import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// Carrossel de distribuicao -- cada chamada pega o PROXIMO numero de
// WhatsApp em rodizio (nao aleatorio, um contador atomico no banco
// garante equilibrio entre os atendentes). Chamado uma vez quando a
// pagina do convite carrega, guardado em estado no componente -- assim
// o numero ja esta pronto na hora do clique em "Quero participar" (sem
// precisar de outra chamada de rede bem na hora do gesto do usuario,
// que poderia atrasar o window.open o suficiente pro navegador
// bloquear o popup).
export async function GET() {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase.rpc("proximo_numero_rodizio");

  if (error || !data) {
    console.error("Falha ao buscar proximo numero do rodizio:", error);
    // Fallback pro numero original, caso a funcao/tabela ainda nao
    // exista ou algo falhe -- nunca deixa a pagina quebrada.
    return NextResponse.json({ numero: "556131991716" });
  }

  return NextResponse.json({ numero: data });
}
