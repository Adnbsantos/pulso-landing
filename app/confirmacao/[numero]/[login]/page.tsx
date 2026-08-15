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

// Link em duas partes -- número do evento (sequencial, legível,
// agenda_eventos.numero) primeiro, depois o LOGIN do convidado (4
// primeiros dígitos do usuario_id -- o mesmo usado pra entrar no app,
// em vez de um código aleatório separado) -- pedido em 15/08/2026,
// mais fácil de reconhecer/testar do que um código de 8 caracteres
// sem sentido nenhum.
//
// Busca em duas etapas, de propósito: mesmo se o login não bater com
// nada (link errado, digitado à mão, etc.), mas o NÚMERO do evento
// existir, ainda mostra o nome do evento na tela -- em vez do "Não
// encontramos esse convite" genérico, sem contexto nenhum.
async function buscarConvidado(numero: string, login: string): Promise<ResultadoBusca> {
  const numeroNumerico = Number(numero)
  if (Number.isNaN(numeroNumerico)) return { evento: null, convidadoEncontrado: false }

  const { data: evento } = await obterSupabaseAdmin()
    .from('agenda_eventos')
    .select('id, titulo, local, inicio')
    .eq('numero', numeroNumerico)
    .maybeSingle()

  if (!evento) return { evento: null, convidadoEncontrado: false }

  // .like() + limit(1) em vez de .maybeSingle() -- colisão de login
  // entre dois convidados do MESMO evento é rara, mas não impossível;
  // pega o primeiro em vez de dar erro.
  const { data: convidados } = await obterSupabaseAdmin()
    .from('agenda_convidados')
    .select('id')
    .eq('evento_id', evento.id)
    .like('usuario_id', `${login}%`)
    .limit(1)

  return {
    evento: { titulo: evento.titulo, local: evento.local, inicio: evento.inicio },
    convidadoEncontrado: !!convidados?.[0],
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
  params: Promise<{ numero: string; login: string }>
}): Promise<Metadata> {
  const { numero, login } = await params
  const resultado = await buscarConvidado(numero, login)
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
  params: Promise<{ numero: string; login: string }>
}) {
  const { numero, login } = await params
  const resultado = await buscarConvidado(numero, login)
  const { evento, convidadoEncontrado } = resultado

  const linkConfirmar = `${URL_CRM}/api/agenda/confirmar-presenca?numero=${numero}&login=${login}&resposta=confirmado`
  const linkAusente = `${URL_CRM}/api/agenda/confirmar-presenca?numero=${numero}&login=${login}&resposta=ausente`

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
