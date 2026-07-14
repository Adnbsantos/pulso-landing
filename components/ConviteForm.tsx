"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function ConviteForm({
  slug,
  onSuccess,
}: {
  slug: string;
  onSuccess: (idUsuario: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [aceite, setAceite] = useState(false);
  const [mostrarPolitica, setMostrarPolitica] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const scriptId = "turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
        });
      }
    };

    const interval = setInterval(() => {
      if (window.turnstile) {
        renderWidget();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  function handleInstagramChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.toLowerCase();
    if (value.length > 0 && value.charAt(0) !== "@") {
      value = "@" + value;
    }
    setInstagram(value);
  }

  function handleWhatsappChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, "($1");
    }

    setWhatsapp(value);
  }

  function nomeValido(valor: string) {
    const palavras = valor.trim().split(/\s+/).filter(Boolean);
    return palavras.length >= 2;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nomeValido(nome)) {
      setErro("Digite seu nome completo (nome e sobrenome).");
      return;
    }

    if (!whatsapp.trim()) {
      setErro("O WhatsApp e obrigatorio.");
      return;
    }

    if (!aceite) {
      setErro("Voce precisa concordar com a Politica de Privacidade.");
      return;
    }

    if (!turnstileToken) {
      setErro("Confirme que voce nao e um robo.");
      return;
    }

    // Abre o WhatsApp AQUI (ainda dentro do clique de verdade do usuario,
    // antes de qualquer await) -- se abrir depois do fetch, navegador
    // mobile costuma bloquear o popup por nao ser mais "gesto direto do
    // usuario". Roda concomitante com o envio do cadastro Fase1.
    window.open("https://wa.me/556131991716?text=Habilitar", "_blank");

    setEnviando(true);

    const res = await fetch("/api/convidado/" + slug, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, whatsapp, instagram, turnstileToken }),
    });

    setEnviando(false);

    if (res.ok) {
      const data = await res.json();
      onSuccess(data.idUsuario);
    } else {
      const data = await res.json();
      setErro(data.error || "Erro ao enviar. Tente novamente.");
      if (window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
        setTurnstileToken("");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 mt-6">
      <label className="block text-left text-blue-950 font-semibold mb-1">Meu nome completo</label>
      <div className="relative mb-4">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite seu nome completo"
          className="w-full border rounded-lg px-4 py-3 pr-12"
          required
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <label className="block text-left text-blue-950 font-semibold mb-1">Meu whatsApp</label>
      <div className="relative mb-4">
        <input
          value={whatsapp}
          onChange={handleWhatsappChange}
          placeholder="(61) 99999-9999"
          className="w-full border rounded-lg px-4 py-3 pr-12"
          maxLength={15}
          required
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="16" cy="16" r="14" />
          <path
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.5 18.9c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.1 3 .1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"
          />
        </svg>
      </div>

      <label className="block text-left text-blue-950 font-semibold mb-1">Meu Instagram</label>
      <div className="relative mb-4">
        <input
          value={instagram}
          onChange={handleInstagramChange}
          placeholder="@seuinstagram"
          className="w-full border rounded-lg px-4 py-3 pr-12"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </div>

      <label className="flex items-center gap-2 mb-2 text-sm text-blue-950">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
        Eu concordo com a{" "}
        <button type="button" onClick={() => setMostrarPolitica(!mostrarPolitica)} className="underline font-semibold text-blue-700">
          Pol&#237;tica de privacidade
        </button>
      </label>

      {mostrarPolitica && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700">
          Esses dados sao usados para a mobilizacao e a comunicacao do evento. Posso pedir a remocao a qualquer momento em{" "}
          <a href="mailto:contato@pulsodf.com.br" className="underline font-semibold">contato@pulsodf.com.br</a>.
        </div>
      )}

      <div ref={turnstileRef} className="mb-4 flex justify-center" />

      {erro && <p className="text-red-600 text-sm mb-4">{erro}</p>}

      <button
        type="submit"
        disabled={enviando || !aceite || !turnstileToken}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-blue-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {enviando ? "Enviando..." : "Quero participar"}
      </button>
    </form>
  );
}
