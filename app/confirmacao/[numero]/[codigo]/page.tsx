import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

function obterSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const URL_CRM = 'https://crm.pulsodf.com.br'

type Evento = { titulo: string; local: string | null; inicio: string }

type ResultadoBusca = {
  evento: Evento | null
  convidadoEncontrado: boolean
}

// Achado em 15/08/2026: link com só o código do convidado ficava
// órfão sempre que algo mexia na lista de convidados depois (já
// corrigido na raiz em pulso-crm/app/api/agenda/convidados/route.ts).
// O link agora tem duas partes -- número do evento (sequencial,
// legível, agenda_eventos.numero) primeiro, depois o código do
// convidado -- a busca só bate se o código pertencer AO EVENTO CERTO,
// não só ao código isolado.
//
// Busca em duas etapas, de propósito -- pedido em 15/08/2026: mesmo
// se o código do convidado não bater com nada (link errado, digitado
// à mão, etc.), mas o NÚMERO do evento existir, ainda mostra o nome
// do evento na tela -- em vez do "Não encontramos esse convite"
// genérico, sem contexto nenhum.
async function buscarConvidado(numero: string, codigo: string): Promise<ResultadoBusca> {
  const numeroNumerico = Number(numero)
  if (Number.isNaN(numeroNumerico)) return { evento: null, convidadoEncontrado: false }

  const { data: evento } = await obterSupabaseAdmin()
    .from('agenda_eventos')
    .select('id, titulo, local, inicio')
    .eq('numero', numeroNumerico)
    .maybeSingle()

  if (!evento) return { evento: null, convidadoEncontrado: false }

  const { data: convidado } = await obterSupabaseAdmin()
    .from('agenda_convidados')
    .select('id')
    .eq('codigo', codigo)
    .eq('evento_id', evento.id)
    .maybeSingle()

  return {
    evento: { titulo: evento.titulo, local: evento.local, inicio: evento.inicio },
    convidadoEncontrado: !!convidado,
  }
}

function formatarHorario(inicioIso: string): string {
  const data = new Date(inicioIso)
  const horas = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return horas.endsWith(':00') ? horas.replace(':00', 'h') : horas.replace(':', 'h')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ numero: string; codigo: string }>
}): Promise<Metadata> {
  const { numero, codigo } = await params
  const resultado = await buscarConvidado(numero, codigo)
  const titulo = resultado.evento?.titulo ? `Confirmar presença • ${resultado.evento.titulo}` : 'Confirmar presença'

  return {
    title: titulo,
    description: 'Geração de Daniel - Evento marcado',
    openGraph: {
      title: titulo,
      description: 'Geração de Daniel - Evento marcado',
      images: ['/favicon-32.png'],
    },
  }
}

export default async function PaginaConfirmacao({
  params,
}: {
  params: Promise<{ numero: string; codigo: string }>
}) {
  const { numero, codigo } = await params
  const resultado = await buscarConvidado(numero, codigo)
  const { evento, convidadoEncontrado } = resultado

  const linkConfirmar = `${URL_CRM}/api/agenda/confirmar-presenca?numero=${numero}&codigo=${codigo}&resposta=confirmado`
  const linkAusente = `${URL_CRM}/api/agenda/confirmar-presenca?numero=${numero}&codigo=${codigo}&resposta=ausente`

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#EAF2FB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <img
          src="/favicon.png"
          alt="Pastor Daniel de Castro"
          width={110}
          height={110}
          style={{ display: 'block', margin: '0 auto 20px', borderRadius: '50%', border: '4px solid #1B2559' }}
        />
        <h1 style={{ color: '#1B2559', fontSize: 28, margin: '0 0 6px', fontWeight: 800 }}>
          Geração de Daniel
        </h1>
        <p style={{ color: '#1B2559', fontSize: 15, margin: '0 0 24px', fontWeight: 600 }}>
          Juntos por fé, família e propósito.
        </p>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 4px 16px rgba(27,37,89,0.08)',
          }}
        >
          {evento ? (
            <div style={{ color: '#1B2559', fontSize: 15, lineHeight: 1.9, textAlign: 'left' }}>
              <p style={{ margin: 0 }}>
                Evento: <strong>{evento.titulo}</strong>
              </p>
              <p style={{ margin: 0 }}>
                Horário: <strong>{formatarHorario(evento.inicio)}</strong>
              </p>
              {evento.local && (
                <p style={{ margin: 0 }}>
                  Local: <strong>{evento.local}</strong>
                </p>
              )}
              {!convidadoEncontrado && (
                <p style={{ margin: '12px 0 0', color: '#B0402C', fontSize: 13 }}>
                  Não encontramos seu convite específico para este evento. O link pode estar
                  incompleto ou incorreto.
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#1B2559', fontSize: 15 }}>Não encontramos esse convite.</p>
          )}

          {convidadoEncontrado && (
            <>
              <a
                href={linkConfirmar}
                style={{
                  display: 'block',
                  marginTop: 24,
                  background: '#F0C24A',
                  color: '#1B2559',
                  fontWeight: 800,
                  fontSize: 16,
                  padding: '14px 20px',
                  borderRadius: 999,
                  textDecoration: 'none',
                }}
              >
                Clique aqui para confirmar
              </a>

              <a
                href={linkAusente}
                style={{
                  display: 'block',
                  marginTop: 12,
                  color: '#7C8A8E',
                  fontSize: 13,
                  textDecoration: 'underline',
                }}
              >
                Não poderei comparecer
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
