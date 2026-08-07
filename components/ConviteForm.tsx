"use client";

import { useState, useEffect, useRef } from "react";
import { capturarLocalizacao } from "@/lib/geolocalizacao";

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
  // Se o telefone digitado já tem cadastro, guarda o ID REAL aqui --
  // usado tanto na mensagem do WhatsApp quanto no envio, em vez de um
  // ID novo inventado. Checado no onBlur do campo (ver
  // verificarCadastroExistente abaixo). Servidor faz a MESMA checagem
  // de novo antes de gravar (essa aqui é só pra mensagem nascer certa,
  // a de verdade é a do servidor) -- pedido em 03/08/2026.
  const [idExistente, setIdExistente] = useState<string | null>(null);
  // O carrossel de rodizio de numeros (/api/proximo-numero) nao e mais
  // usado aqui -- desde que o WhatsApp deixou de ser aberto no clique
  // (o acesso e' entregue automaticamente via backend, ver
  // app/api/convidado/[slug]/route.ts). O endpoint continua existindo
  // no repositorio, caso volte a fazer sentido usar mais de um numero
  // pra esse fluxo especifico no futuro.

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
          // Widget de verdade fica INVISÍVEL -- roda a verificação
          // real escondida, sem checkbox, sem "Sucesso!", sem UI
          // nenhuma da Cloudflare aparecendo. No lugar visível (ver
          // JSX abaixo), mostramos uma réplica estática nossa da
          // caixinha padrão, que nunca muda -- pra ninguém confundir
          // "captcha passou" com "cadastro terminou" (pedido em
          // 06/08/2026, causa raiz: gente via 'Sucesso!' e não
          // apertava o botão de cadastrar, achando que já tinha
          // enviado).
          size: "invisible",
          callback: (token: string) => {
            setTurnstileToken(token);
          },
          "expired-callback": () => {
            setTurnstileToken("");
          },
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
    // Numero mudou -- o resultado da checagem anterior nao vale mais.
    setIdExistente(null);
  }

  // Assim que a pessoa termina de digitar o telefone (onBlur), checa
  // se ele já tem cadastro -- se tiver, guarda o ID real em
  // idExistente, pra mensagem do WhatsApp nascer com o login/senha
  // CORRETOS dela, em vez de inventar um cadastro novo. Silencioso se
  // falhar (não trava o formulário por causa disso -- o servidor faz a
  // checagem de verdade de qualquer forma).
  async function verificarCadastroExistente() {
    const digitos = whatsapp.replace(/\D/g, "");
    if (digitos.length < 10) return;

    try {
      const res = await fetch(`/api/verificar-cadastro?telefone=${digitos}`);
      const dados = await res.json();
      if (dados?.existe && dados?.idUsuario) {
        setIdExistente(dados.idUsuario);
      }
    } catch {
      // Silencioso -- servidor confere de novo no envio de qualquer forma.
    }
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

    // Se a pessoa JA tem cadastro (checado no onBlur do telefone,
    // idExistente), usa o ID REAL dela -- senao gera um novo aqui, no
    // navegador, antes do window.open() (que tem que rodar de forma
    // sincrona, dentro do clique de verdade do usuario, senao o
    // navegador mobile bloqueia o popup). O mesmo ID vai junto no POST
    // logo abaixo -- se ja existia, o servidor confere de novo e nao
    // cria linha duplicada (pedido em 03/08/2026).
    const idParaUsar = idExistente ?? crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const loginGerado = idParaUsar.slice(0, 4);
    const telefoneDigitos = whatsapp.replace(/\D/g, "");
    const primeiroNome = nome.trim().split(" ")[0];

    const mensagemAcesso =
      `${primeiroNome}, bem-vindo ao time do Pastor Daniel de Castro. Seu acesso está liberado.\n\n` +
      `app.pulsodf.com.br\n` +
      `Usuário: ${loginGerado}\n` +
      `Senha: ${telefoneDigitos}\n\n` +
      `Continue me falando um pouco de você\n` +
      `https://geracao.pulsodf.com.br/maisvoce/${idParaUsar}`;

    // FIXO temporariamente em 556131991965 enquanto o rodizio
    // multi-numero ainda esta em teste -- pra voltar ao carrossel
    // dinamico, troca de volta pra `https://wa.me/${numeroAtendente}?...`.
    window.open(
      `https://wa.me/556131991965?text=${encodeURIComponent(mensagemAcesso)}`,
      "_blank"
    );

    setEnviando(true);

    // Captura o GPS AQUI, na Fase 1 -- pedido em 04/08/2026, pra a RA
    // já nascer real (por localização), em vez de depender só da
    // pessoa escolher certo na Fase 2. Silencioso se ela negar
    // permissão ou o dispositivo não suportar -- nunca trava o
    // cadastro por causa disso.
    const localizacao = await capturarLocalizacao();

    const res = await fetch("/api/convidado/" + slug, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        whatsapp,
        instagram,
        turnstileToken,
        idPreGerado: idParaUsar,
        latitude: localizacao?.latitude ?? null,
        longitude: localizacao?.longitude ?? null,
      }),
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
          onBlur={verificarCadastroExistente}
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
          Esses dados são usados para a mobilização e comunicação de eventos. Posso solicitar a remoção a qualquer momento em{" "}
          <a href="mailto:contato@pulsodf.com.br" className="underline font-semibold">contato@pulsodf.com.br</a>
        </div>
      )}

      {/* Widget de verdade some (size="invisible", ver useEffect acima) --
          roda a verificação real escondida. Essa caixinha aqui é só uma
          réplica visual estática nossa, do jeito clássico do Cloudflare
          -- fica sempre com essa mesma aparência, nunca muda pra
          "Sucesso!" nem pra nada, mesmo depois da verificação real
          terminar (pedido em 06/08/2026). */}
      <div ref={turnstileRef} className="hidden" />
      <div className="mb-4 flex justify-center">
        <div className="flex items-center justify-between gap-3 border border-gray-300 rounded-md px-4 py-3 bg-gray-50 w-[300px]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-blue-600 rounded-sm flex-shrink-0 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Verificação de segurança</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 15.5H6a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 16.2 6.13 4.5 4.5 0 0 1 18.5 15.5Z" />
            </svg>
            <span className="text-[10px] font-medium tracking-wide">CLOUDFLARE</span>
          </div>
        </div>
      </div>

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
