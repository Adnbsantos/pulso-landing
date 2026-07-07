import { getSupabaseServer } from "@/lib/supabase";
import { notFound } from "next/navigation";
import CompletarForm from "@/components/CompletarForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete seu cadastro — Geração de Daniel",
};

export default async function CompletarCadastroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServer();

  const { data: pessoa } = await supabase
    .from("banco_territorial")
    .select("nome, telefone, instagram, status")
    .eq("id_usuario", id)
    .single();

  if (!pessoa) notFound();

  const [{ data: ras }, { data: bairros }] = await Promise.all([
    supabase.from("regioes_administrativas").select("id, nome").order("nome"),
    supabase.from("bairros").select("id, nome, ra_id").order("nome"),
  ]);

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center px-4 py-10">
      <CompletarForm
        id={id}
        pessoa={pessoa}
        ras={ras ?? []}
        bairros={bairros ?? []}
      />
    </main>
  );
}
