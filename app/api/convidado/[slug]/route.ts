import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseServer } from "@/lib/supabase";
import { enviarWhatsApp } from "@/lib/evolutionApi";

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
    const { nome, whatsapp, instagram, turnstileToken } = body;
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

    const novoId = randomUUID().replace(/-/g, "").slice(0, 8);

    const { error: erroBackoffice } = await supabase
      .from("usuarios_backoffice")
      .insert({
        id_usuario: novoId,
        nome,
        telefone: telefoneNumeros,
        instagram: instagram || null,
        usuario_pai: dono.id_usuario,
        nome_usuario_pai: dono.nome,
        perfil: "Mobilizador",
        status: "Pendente",
      });

    if (erroBackoffice) {
      console.error("Erro ao criar usuarios_backoffice:", erroBackoffice);
      // Temporariamente expõe a mensagem real do banco (em vez do texto
      // genérico) pra facilitar o diagnóstico.
      return NextResponse.json(
        { error: erroBackoffice.message },
        { status: 500 }
      );
    }

    const { data: criado } = await supabase
      .from("usuarios_backoffice")
      .select("slug, link_fase2")
      .eq("id_usuario", novoId)
      .single();

    if (criado?.link_fase2) {
      const primeiroNome = nome.split(" ")[0];
      enviarWhatsApp(
        telefoneNumeros,
        `Oi, ${primeiroNome}! Aqui é da Geração de Daniel 🙏\n\n` +
          `Você já faz parte da nossa rede — falta só um passinho: contar ` +
          `um pouco mais sobre você, pra gente conseguir direcionar as ações ` +
          `certas pra perto de você.\n\nÉ rapidinho: ${criado.link_fase2}`
      ).catch((err) => console.error("Falha ao enviar WhatsApp:", err));
    }

    return NextResponse.json({ success: true, slug: criado?.slug, idUsuario: novoId });
  } catch (err) {
    console.error("Erro inesperado no cadastro (POST /api/convidado/[slug]):", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}