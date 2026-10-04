import { getSupabaseServer } from "@/lib/supabase";

// Chave em configuracoes_sistema que suspende TODOS os links de cadastro
// (/{slug} e POST /api/convidado/{slug}). Para reativar:
//   update configuracoes_sistema set valor = 'false' where chave = 'cadastro_links_suspenso';
export const CHAVE_SUSPENSAO = "cadastro_links_suspenso";

export const MENSAGEM_SUSPENSAO = {
  titulo: "Trabalho finalizado!",
  texto: "Obrigado pela colaboração.",
};

export async function cadastrosSuspensos(): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("configuracoes_sistema")
      .select("valor")
      .eq("chave", CHAVE_SUSPENSAO)
      .maybeSingle();
    return data?.valor === "true";
  } catch {
    return false;
  }
}
