import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

function obterSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

type Evento = {
  titulo: string
  local: string | null
  link_localizacao: string | null
}

async function buscarEvento(eventoId: string): Promise<Evento | null> {
  const { data } = await obterSupabaseAdmin()
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
