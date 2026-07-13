import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

// app/local/[eventoId]/page.tsx
//
// Pagina de redirecionamento com preview bonito pro link de localizacao
// que vai nas mensagens de convocacao do WhatsApp (ver lib/convocacao.ts
// no repositorio pulso-crm). O motivo de existir: um link direto do
// Google Maps chega feio no WhatsApp (preview gigante, generico, sem
// nossa marca) -- essa pagina tem metadados Open Graph proprios
// (favicon/nome do projeto) e so redireciona pro Maps de verdade depois
// que o preview ja foi gerado a partir de cima.
//
// Cliente Supabase proprio aqui (nao importa de lib/supabase existente)
// pra nao depender de um export que eu nao pude conferir -- mesmo padrao
// usado em lib/supabaseAdmin.ts do pulso-crm.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Evento = {
  titulo: string
  local: string | null
  link_localizacao: string | null
}

async function buscarEvento(eventoId: string): Promise<Evento | null> {
  const { data } = await supabaseAdmin
    .from('agenda_eventos')
    .select('titulo, local, link_localizacao')
    .eq('id', eventoId)
    .maybeSingle()
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventoId: string }>
}): Promise<Metadata> {
  const { eventoId } = await params
  const evento = await buscarEvento(eventoId)

  const titulo = evento?.titulo ? `Localização • ${evento.titulo}` : 'Localização do evento'
  const descricao = evento?.local
    ? `📍 ${evento.local} — Geração de Daniel`
    : 'Geração de Daniel — juntos por fé, família e propósito.'

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: ['/favicon.png'],
    },
  }
}

export default async function PaginaLocal({
  params,
}: {
  params: Promise<{ eventoId: string }>
}) {
  const { eventoId } = await params
  const evento = await buscarEvento(eventoId)

  if (evento?.link_localizacao) {
    redirect(evento.link_localizacao)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, system-ui, sans-serif',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div>
        <h1>Localização não encontrada</h1>
        <p>Não encontramos o endereço desse evento. Fale com quem te convidou.</p>
      </div>
    </main>
  )
}
