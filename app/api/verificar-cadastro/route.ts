import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// Verifica se um telefone JA tem cadastro -- usado pelo ConviteForm.tsx
// assim que a pessoa termina de digitar o WhatsApp, pra mensagem de
// acesso já nascer com o ID/login REAL dela (não um novo, inventado),
// caso ela já seja cadastrada. Pedido em 03/08/2026, depois de notar
// que reenvios geravam ID novo toda vez, mesmo pra quem já tinha conta.
export async function GET(req: NextRequest) {
  const telefone = req.nextUrl.searchParams.get("telefone")?.replace(/\D/g, "");

  if (!telefone) {
    return NextResponse.json({ existe: false });
  }

  const supabase = getSupabaseServer();

  const { data } = await supabase
    .from("usuarios_backoffice")
    .select("id_usuario")
    .eq("telefone", telefone)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ existe: false });
  }

  return NextResponse.json({ existe: true, idUsuario: data.id_usuario });
}
