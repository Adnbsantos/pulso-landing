import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

// app/confirmacao/[id]/page.tsx
//
// Landing page de "Confirmar presenca" -- e pra onde vai a 2a mensagem
// da convocacao (ver lib/convocacao.ts / notificar-convidados/route.ts
// no repositorio pulso-crm: "Confirme sua presenca aqui\n[link]").
// Segue a mesma linguagem visual da tela de sucesso do cadastro (fundo
// azul claro, card branco, botao dourado).
//
// O botao nao confirma nada aqui dentro -- so linka pra rota que ja
// existe e ja funciona no pulso-crm (GET /api/agenda/confirmar-presenca),
// que e quem de fato grava confirmacao_presenca no banco. Essa pagina
// aqui e so a "vitrine" bonita antes desse clique.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// TODO: confirmar se e esse mesmo dominio -- e onde mora a rota que
// grava a confirmacao de verdade.
const URL_CRM = 'https://crm.pulsodf.com.br'

type Convidado = {
  evento_id: string
  agenda_eventos: { titulo: string; local: string | null; inicio: string } | null
}

async function buscarConvidado(id: string): Promise<Convidado | null> {
  const { data } = await supabaseAdmin
    .from('agenda_convidados')
    .select('evento_id, agenda_eventos(titulo, local, inicio)')
    .eq('id', id)
    .maybeSingle()
  return data as unknown as Convidado | null
}

function formatarHorario(inicioIso: string): string {
  const data = new Date(inicioIso)
  const horas = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return horas.endsWith(':00') ? horas.replace(':00', 'h') : horas.replace(':', 'h')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const convidado = await buscarConvidado(id)
  const titulo = convidado?.agenda_eventos?.titulo
    ? `Confirmar presença • ${convidado.agenda_eventos.titulo}`
    : 'Confirmar presença'

  return {
    title: titulo,
    description: 'Geração de Daniel — confirme sua presença no evento.',
    openGraph: {
      title: titulo,
      description: 'Geração de Daniel — confirme sua presença no evento.',
      images: ['/favicon.png'],
    },
  }
}

export default async function PaginaConfirmacao({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const convidado = await buscarConvidado(id)
  const evento = convidado?.agenda_eventos

  const linkConfirmar = `${URL_CRM}/api/agenda/confirmar-presenca?id=${id}&resposta=confirmado`
  const linkAusente = `${URL_CRM}/api/agenda/confirmar-presenca?id=${id}&resposta=ausente`

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
          style={{ borderRadius: '50%', border: '4px solid #1B2559', marginBottom: 20 }}
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
            </div>
          ) : (
            <p style={{ color: '#1B2559', fontSize: 15 }}>Não encontramos esse convite.</p>
          )}

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
        </div>
      </div>
    </main>
  )
}
