import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseServer } from "@/lib/supabase";
import { raMaisProxima } from "@/lib/geolocalizacao";

// Link de "completar cadastro" (Fase 2 -- virar Mobilizador de verdade),
// no formato /maisvoce/{id_usuario} -- mesmo padrão usado no botão
// "Tornar um Mobilizador" (ConvitePageClient.tsx) e na mensagem que a
// Camila manda no WhatsApp (montarLinkMaisVoce, no pulso-crm). NÃO existe
// coluna `link_fase2` no banco -- a consulta anterior selecionava uma
// coluna inexistente, o que fazia a query falhar e SEM que ninguém
// percebesse, o WhatsApp de "complete seu cadastro" nunca era enviado.
function linkMaisVoce(idUsuario: string): string {
  return `https://geracao.pulsodf.com.br/maisvoce/${idUsuario}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabaseServer();

  const { data: dono } = await supabase
    .from("usuarios_backoffice")
    .select("id_usuario, nome")
    .eq("slug", slug)
    .single();

  if (!dono) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    nome: dono.nome,
    idUsuario: dono.id_usuario,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { nome, whatsapp, instagram, turnstileToken, idPreGerado, latitude, longitude } = body;
    const supabase = getSupabaseServer();

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Verificação de segurança ausente" },
        { status: 400 }
      );
    }

    const verify = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );
    const verifyData = await verify.json();

    if (!verifyData.success) {
      return NextResponse.json(
        { error: "Falha na verificação de segurança" },
        { status: 400 }
      );
    }

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: dono } = await supabase
      .from("usuarios_backoffice")
      .select("id_usuario, nome, perfil")
      .eq("slug", slug)
      .single();

    if (!dono) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    const telefoneNumeros = String(whatsapp).replace(/\D/g, "");

    // Checagem de duplicidade -- SEMPRE no servidor, mesmo que o
    // navegador já tenha checado antes (defesa em profundidade: o
    // navegador pode ter pulado essa etapa, ou o telefone pode ter
    // sido cadastrado por outra aba entre a checagem e o envio). Se já
    // existe, reaproveita o cadastro existente -- não cria linha
    // duplicada, não gera ID novo. Pedido em 03/08/2026.
    const { data: existente } = await supabase
      .from("usuarios_backoffice")
      .select("id_usuario, slug")
      .eq("telefone", telefoneNumeros)
      .maybeSingle();

    if (existente) {
      return NextResponse.json({
        success: true,
        slug: existente.slug,
        idUsuario: existente.id_usuario,
        jaExistia: true,
      });
    }

    // Usa o ID gerado no NAVEGADOR do cadastrante, se vier valido --
    // precisa bater exatamente com o que foi usado na mensagem que ele
    // já mandou por WhatsApp (login/senha/link). So aceita formato
    // hexadecimal de 8 caracteres (mesmo padrao do randomUUID().slice),
    // pra nao aceitar qualquer string arbitraria vinda do cliente.
    // Se nao vier nada valido, gera aqui mesmo (fallback de seguranca).
    const idValido = typeof idPreGerado === "string" && /^[a-f0-9]{8}$/i.test(idPreGerado);
    const novoId = idValido ? idPreGerado : randomUUID().replace(/-/g, "").slice(0, 8);

    // Se veio GPS da Fase 1, calcula a RA mais próxima ANTES de
    // inserir -- já entra certo no primeiro insert, propaga sozinho
    // pra banco_territorial via o gatilho de sincronização. É uma
    // aproximação por centro de RA (não fronteira real), então serve
    // como o dado "real" inicial, mas a pessoa ainda pode corrigir na
    // Fase 2 -- auditoria, não trava (pedido em 04/08/2026).
    //
    // CRÍTICO: isolado no próprio try/catch, de propósito -- essa é
    // uma funcionalidade EXTRA (detecção automática), não pode nunca
    // derrubar o cadastro principal se algo der errado aqui. Achado em
    // 06/08/2026: um cadastro sumiu por completo (nem chegou a ser
    // criado, mas a pessoa já tinha recebido o link quebrado por
    // WhatsApp) -- provável causa raiz era essa chamada sem proteção
    // própria, dentro do mesmo bloco que travava tudo se lançasse
    // exceção.
    const temGps = typeof latitude === "number" && typeof longitude === "number";
    let raIdDetectada: number | null = null;
    if (temGps) {
      try {
        raIdDetectada = await raMaisProxima(latitude, longitude);
      } catch (erroGps) {
        console.error("Falha ao detectar RA por GPS (não bloqueante):", erroGps);
      }
    }

    // Cadastro Fase 1 (só nome + whatsapp) entra sempre como "Apoiador" e
    // status "Pendente" -- só vira "Mobilizador Ativo" de fato quando (e
    // se) completar a Fase 2 pelo link abaixo. Isso evita o cadastro
    // "inflado" que existia antes (todo mundo entrando como Mobilizador
    // mesmo sem ter completado nada).
    const { error: erroBackoffice } = await supabase
      .from("usuarios_backoffice")
      .insert({
        id_usuario: novoId,
        nome,
        telefone: telefoneNumeros,
        instagram: instagram || null,
        usuario_pai: dono.id_usuario,
        nome_usuario_pai: dono.nome,
        perfil: "Apoiador Base",
        status: "Pendente",
        ra_id: raIdDetectada,
      });

    if (erroBackoffice) {
      // "23505" = violação de UNIQUE (telefone_whatsapp) -- acontece
      // quando duas tentativas quase simultâneas passam pela checagem
      // de duplicidade acima ANTES de qualquer uma ter terminado de
      // gravar (checagem e gravação não são atômicas). A pessoa que
      // perde a corrida não tem cadastro nenhum -- em vez de mostrar
      // erro, busca de novo e reaproveita o que a outra tentativa
      // acabou de criar, do mesmo jeito que o bloco de duplicidade
      // acima já faz pra quem chega depois. Achado em 10/08/2026,
      // caso real: 5 tentativas seguidas, só 1 criou registro.
      if (erroBackoffice.code === "23505") {
        const { data: criadoPelaOutraTentativa } = await supabase
          .from("usuarios_backoffice")
          .select("id_usuario, slug")
          .eq("telefone", telefoneNumeros)
          .maybeSingle();

        if (criadoPelaOutraTentativa) {
          return NextResponse.json({
            success: true,
            slug: criadoPelaOutraTentativa.slug,
            idUsuario: criadoPelaOutraTentativa.id_usuario,
            jaExistia: true,
          });
        }
      }

      console.error("Erro ao criar usuarios_backoffice:", erroBackoffice);
      // Temporariamente expõe a mensagem real do banco (em vez do texto
      // genérico) pra facilitar o diagnóstico.
      return NextResponse.json(
        { error: erroBackoffice.message },
        { status: 500 }
      );
    }

    // Grava a coordenada bruta direto em banco_territorial -- o
    // gatilho de sincronização não mexe em latitude/longitude (só
    // existem nessa tabela, não em usuarios_backoffice), então precisa
    // dessa atualização separada, depois que o insert acima já criou a
    // linha via gatilho. Também isolada -- se falhar, o cadastro já
    // criado continua valendo, só sem a coordenada.
    if (temGps) {
      try {
        await supabase
          .from("banco_territorial")
          .update({ latitude, longitude })
          .eq("id_usuario", novoId);
      } catch (erroCoordenada) {
        console.error("Falha ao gravar coordenada (não bloqueante):", erroCoordenada);
      }
    }

    const { data: criado } = await supabase
      .from("usuarios_backoffice")
      .select("slug")
      .eq("id_usuario", novoId)
      .single();

    // Não manda mais WhatsApp automático por aqui -- o cadastrante
    // envia a mensagem ele mesmo, pelo próprio WhatsApp (ver
    // ConviteForm.tsx), usando o MESMO id_usuario gerado no navegador
    // dele. Isso também abre a conversa como iniciativa do usuário
    // (P2P), não da empresa -- reduz risco de filtro antispam.

    return NextResponse.json({ success: true, slug: criado?.slug, idUsuario: novoId });
  } catch (err) {
    console.error("Erro inesperado no cadastro (POST /api/convidado/[slug]):", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
