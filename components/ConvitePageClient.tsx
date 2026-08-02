"use client";

import { useState } from "react";
import ConviteForm from "./ConviteForm";

export default function ConvitePageClient({
  slug,
  nomeConvidante,
}: {
  slug: string;
  nomeConvidante: string;
}) {
  const [idUsuario, setIdUsuario] = useState<string | null>(null);

  if (idUsuario) {
    return (
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 mt-6 text-center">
        <p className="text-xl font-bold text-blue-950 mb-2">Cadastro realizado com sucesso!</p>
        <p className="text-sm text-gray-600 mb-6">
          Faça parte dessa transformação.
        </p>
        {/* "Tornar um Mobilizador" (Fase 2) DESABILITADO por enquanto --
            vamos lancar essa acao aos poucos (pedido em 01/08/2026). Pra
            reativar, troca de volta o <span> abaixo por um <a
            href={`/maisvoce/${idUsuario}`}>. */}
        <span
          aria-disabled="true"
          title="Em breve"
          className="inline-flex items-center justify-center gap-2 w-full bg-yellow-500/50 text-blue-950/50 font-bold py-4 rounded-xl cursor-not-allowed select-none"
        >
          Tornar um Mobilizador
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-950 text-white text-center rounded-xl w-full max-w-md py-5 mt-6">
        <p className="text-sm">Voce foi convidado pelo</p>
        <p className="text-3xl font-bold mt-1">{nomeConvidante}</p>
      </div>
      <ConviteForm slug={slug} onSuccess={setIdUsuario} />
    </>
  );
}
