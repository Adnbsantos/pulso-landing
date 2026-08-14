import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// Registra cada mensagem de boas-vindas (usuario/senha) gerada na Fase 1,
// junto com o link de origem (legado) de quem convidou. Existe pra dar
// visibilidade de quem recebeu a mensagem mas nao tem cadastro gravado --
// ver public.vw_boas_vindas_pendentes e o cron sincronizar_boas_vindas_log
// no Supabase. Nunca deve travar nem atrasar o cadastro em si -- por isso
// so grava o log, sem nenhuma outra logica de negocio aqui.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idUsuarioGerado, telefone, nome, slugOrigem, mensagemTexto } = body;

    if (!idUsuarioGerado || !telefone || !nome || !slugOrigem || !mensagemTexto) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data: dono } = await supabase
      .from("usuarios_backoffice")
      .select("id_usuario, nome")
      .eq("slug", slugOrigem)
      .maybeSingle();

    const { error } = await supabase.from("mensagens_boas_vindas_log").insert({
      id_usuario_gerado: idUsuarioGerado,
      telefone: String(telefone).replace(/\D/g, ""),
      nome,
      slug_origem: slugOrigem,
      usuario_pai_id: dono?.id_usuario ?? null,
      usuario_pai_nome: dono?.nome ?? null,
      mensagem_texto: mensagemTexto,
    });

    if (error) {
      console.error("Erro ao gravar log de boas-vindas:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro inesperado em /api/log-boas-vindas:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
