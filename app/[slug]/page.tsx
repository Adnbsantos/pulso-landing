import ConvitePageClient from "@/components/ConvitePageClient";
import { getSheet } from "@/lib/sheets";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getDono(slug: string) {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  const dono = rows.find((r) => r.get("Slug") === slug);
  return dono ? { nome: dono.get("Nome") } : null;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gera\u00e7\u00e3o de Daniel",
    description: "Juntos por f\u00e9, fam\u00edlia e prop\u00f3sito.",
    openGraph: {
      title: "Gera\u00e7\u00e3o de Daniel",
      description: "Juntos por f\u00e9, fam\u00edlia e prop\u00f3sito.",
      siteName: "app.pulsodf.com.br",
      images: ["/favicon.png"],
    },
  };
}

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dono = await getDono(slug);

  if (!dono) notFound();

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-40 h-40 mb-6 flex items-center justify-center">
          <img
            src="/assets/Daniel - Caricatura.png"
            alt="Pr. Daniel de Castro"
            className="w-40 h-40 rounded-full border-4 border-blue-900 object-cover block"
          />
        </div>
        <h1 className="text-5xl font-extrabold text-blue-950 text-center">
          Gera&#231;&#227;o de Daniel
        </h1>
        <p className="text-blue-800 mt-3 text-center font-bold text-lg">Juntos por f&#233;, fam&#237;lia e prop&#243;sito.</p>
      </div>

      <ConvitePageClient slug={slug} nomeConvidante={dono.nome} />

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center w-full max-w-md mt-3 text-blue-900 font-bold">
        <div className="flex items-center justify-center gap-1.5 px-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1e3a8a" className="shrink-0">
            <path d="M12 2 4 5v6c0 5 3.4 9.3 8 10.5 4.6-1.2 8-5.5 8-10.5V5l-8-3z" />
            <path fill="white" d="M10.3 13.6 8.2 11.5l-1.1 1.1 3.2 3.2 6-6-1.1-1.1z" />
          </svg>
          <span className="leading-tight text-blue-900 text-left text-[10px]">
            Seus dados
            <br />
            est&#227;o protegidos
          </span>
        </div>

        <div className="w-px h-10 bg-blue-900 justify-self-center" />

        <div className="flex items-center justify-center gap-1.5 px-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1e3a8a" className="shrink-0">
            <circle cx="9" cy="8" r="3" />
            <path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5v1H3v-1z" />
            <circle cx="17" cy="9" r="2.3" />
            <path d="M15.5 13.2c2.6.3 4.5 1.7 4.5 4.3v1.5h-3v-1.5c0-1.6-.6-2.9-1.5-4.3z" />
          </svg>
          <span className="leading-tight text-blue-900 text-left text-[10px]">
            Junte-se a
            <br />
            milhares de pessoas
          </span>
        </div>

        <div className="w-px h-10 bg-blue-900 justify-self-center" />

        <div className="flex items-center justify-center gap-1.5 px-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1e3a8a" className="shrink-0">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="leading-tight text-blue-900 text-left text-[10px]">
            Fa&#231;a parte de
            <br />
            algo maior
          </span>
        </div>
      </div>
    </main>
  );
}