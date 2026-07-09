export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      // Temporariamente expõe a mensagem real do banco (em vez de um texto
      // genérico) pra facilitar o diagnóstico — mesmo padrão já usado no
      // pulso-crm. Depois de confirmarmos a causa, podemos voltar a esconder.
      return NextResponse.json({ error: erroTerritorial.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Qualquer exceção não prevista (JSON inválido no corpo, env var
    // faltando, etc.) agora sempre volta como JSON — nunca mais como página
    // de erro genérica do Next.js, que quebrava o res.json() no front-end.
    console.error("Erro inesperado no cadastro (POST /api/maisvoce/[id]):", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}