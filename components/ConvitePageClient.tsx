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
        <a
          href={`/maisvoce/${idUsuario}`}
          className="inline-flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-4 rounded-xl"
        >
          Seja um mobilizador
        </a>
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
