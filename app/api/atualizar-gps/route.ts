import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { raMaisProxima } from "@/lib/geolocalizacao";

// Recebe a localização quando ela chega DEPOIS do cadastro principal já
// ter sido gravado -- caso comum desde 14/08/2026, quando a captura de
// GPS foi desacoplada do POST de /api/convidado/[slug] (ver
// ConviteForm.tsx: aba em segundo plano trava o timeout do GPS, então
// o cadastro não pode mais esperar por ele). Sempre best-effort: se o
// usuário não existir mais, ou a RA não puder ser calculada, não é
// erro -- só significa que essa atualização específica não aconteceu.
export async function POST(req: NextRequest) {
  try {
    const { idUsuario, latitude, longitude } = await req.json();

    if (!idUsuario || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    let raId: number | null = null;
    try {
      raId = await raMaisProxima(latitude, longitude);
    } catch (erroGps) {
      console.error("Falha ao detectar RA por GPS atrasado (não bloqueante):", erroGps);
    }

    await supabase
      .from("banco_territorial")
      .update({ latitude, longitude })
      .eq("id_usuario", idUsuario);

    if (raId !== null) {
      await supabase.from("usuarios_backoffice").update({ ra_id: raId }).eq("id_usuario", idUsuario);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro inesperado em /api/atualizar-gps:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
