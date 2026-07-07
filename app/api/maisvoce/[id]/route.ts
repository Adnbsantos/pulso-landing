import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServer();

  const { data } = await supabase
    .from("banco_territorial")
    .select("nome, telefone, instagram, status")
    .eq("id_usuario", id)
    .single();

  if (!data) {
    return NextResponse.json({ error: "Cadastro não encontrado" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = getSupabaseServer();

  const {
    instagram,
    raId,
    bairroId,
    possuiIgreja,
    nomeIgreja,
    lideraPessoas,
    faixaLideranca,
    atividadeComunitaria,
    temasPrioritarios,
    situacaoProfissional,
    areaAtuacao,
  } = body;

  // Confirma que o cadastro existe e ainda está pendente
  const { data: atual } = await supabase
    .from("banco_territorial")
    .select("status, instagram")
    .eq("id_usuario", id)
    .single();

  if (!atual) {
    return NextResponse.json({ error: "Cadastro não encontrado" }, { status: 404 });
  }

  if (atual.status === "Concluído") {
    return NextResponse.json({ error: "Esse cadastro já foi concluído" }, { status: 400 });
  }

  // A linha em usuarios_backoffice é atualizada automaticamente por um
  // trigger no banco (sincronização bidirecional) assim que salvamos aqui —
  // não precisa mais atualizar as duas tabelas manualmente.
  const { error: erroTerritorial } = await supabase
    .from("banco_territorial")
    .update({
      // Só grava o Instagram se a pessoa ainda não tinha preenchido na Fase 1
      instagram: atual.instagram || instagram || null,
      ra_id: raId ? Number(raId) : null,
      bairro_id: bairroId ? Number(bairroId) : null,
      possui_igreja: possuiIgreja || null,
      nome_igreja: nomeIgreja || null,
      lidera_pessoas: lideraPessoas || null,
      faixa_lideranca: faixaLideranca || null,
      atividade_comunitaria:
        atividadeComunitaria && atividadeComunitaria.length ? atividadeComunitaria : null,
      temas_prioritarios:
        temasPrioritarios && temasPrioritarios.length ? temasPrioritarios : null,
      situacao_profissional: situacaoProfissional || null,
      area_atuacao: areaAtuacao || null,
      status: "Concluído",
    })
    .eq("id_usuario", id);

  if (erroTerritorial) {
    console.error("Erro ao concluir cadastro (Fase 2):", erroTerritorial);
    return NextResponse.json({ error: "Não foi possível salvar. Tente novamente." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
