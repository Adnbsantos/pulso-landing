"use client";

import { useState } from "react";
import ConviteForm from "./ConviteForm";

const iconePath =
  "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2z" +
  "M12.04 20.15h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.14.82.84-3.06-.2-.32a8.22 8.22 0 0 1-1.27-4.36c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.17 8.17 0 0 1 2.42 5.82c0 4.55-3.7 8.24-8.25 8.24z" +
  "M16.56 13.98c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.59.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z";

export default function ConvitePageClient({
  slug,
  nomeConvidante,
}: {
  slug: string;
  nomeConvidante: string;
}) {
  const [sucesso, setSucesso] = useState(false);
  const numeroWhatsapp = "556131991716";
  const linkWhatsapp = "https://wa.me/" + numeroWhatsapp;

  if (sucesso) {
    return (
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 mt-6 text-center">
        <p className="text-xl font-bold text-blue-950 mb-6">Cadastro realizado com sucesso!</p>
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d={iconePath} />
          </svg>
          Seja um Mobilizador
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
      <ConviteForm slug={slug} onSuccess={() => setSucesso(true)} />
    </>
  );
}