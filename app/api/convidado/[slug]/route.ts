import { NextRequest, NextResponse } from "next/server";
import { getSheet } from "@/lib/sheets";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const sheet = await getSheet();
  const rows = await sheet.getRows();

  const dono = rows.find((r) => r.get("Slug") === slug);

  if (!dono) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    nome: dono.get("Nome"),
    idUsuario: dono.get("IDUsuario"),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const { nome, whatsapp, instagram, turnstileToken } = body;

  // 1. Verifica se o token do Turnstile foi enviado
  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Verificação de segurança ausente" },
      { status: 400 }
    );
  }

  // 2. Valida o token junto à Cloudflare
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

  // 3. Validação dos campos obrigatórios
  if (!nome || !whatsapp) {
    return NextResponse.json(
      { error: "Nome e WhatsApp são obrigatórios" },
      { status: 400 }
    );
  }

  // 4. Busca o dono do slug (quem convidou)
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  const dono = rows.find((r) => r.get("Slug") === slug);
  if (!dono) {
    return NextResponse.json(
      { error: "Convite não encontrado" },
      { status: 404 }
    );
  }

  // 5. Gera o novo ID e slug do convidado
  const novoId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const slugGerado =
    nome.toLowerCase().trim().replace(/\s+/g, "-") + "-" + novoId.slice(-4);

  // 6. Grava o novo cadastro na planilha
  await sheet.addRow({
    IDUsuario: novoId,
    DataCadastro: new Date().toLocaleString("pt-BR"),
    Nome: nome,
    Telefone: whatsapp,
    Instagram: instagram || "",
    UsuarioPai: dono.get("IDUsuario"),
    Status: "Ativo",
    Perfil: "Mobilizador",
    NomeUsuarioPai: dono.get("Nome"),
    Slug: slugGerado,
    Link: `https://geracao.pulsodf.com.br/${slugGerado}`,
  });

  return NextResponse.json({ success: true, slug: slugGerado });
}