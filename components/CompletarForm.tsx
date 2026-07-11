"use client";

import { useEffect, useRef, useState } from "react";
import {
  FAIXA_LIDERANCA_OPTIONS,
  ATIVIDADE_COMUNITARIA_OPTIONS,
  TEMAS_PRIORITARIOS_OPTIONS,
  SITUACAO_PROFISSIONAL_OPTIONS,
  AREA_ATUACAO_OPTIONS,
} from "@/lib/options";

type RA = { id: number; nome: string };
type Bairro = { id: number; nome: string; ra_id: number };
type Pessoa = { nome: string; telefone: string; instagram: string | null; status: string };

// Heurística simples: nomes terminados em "a" geralmente são femininos em
// português, com algumas exceções conhecidas. Não é infalível, mas cobre
// a grande maioria dos casos comuns.
function inferirSaudacao(primeiroNome: string): string {
  const nome = primeiroNome.toLowerCase();
  const excecoesMasculinas = ["luca", "josua", "joshua", "nikita"];
  const feminino = !excecoesMasculinas.includes(nome) && nome.endsWith("a");
  return feminino ? "Bem-vinda" : "Bem-vindo";
}

export default function CompletarForm({
  id,
  pessoa,
  ras,
  bairros,
}: {
  id: string;
  pessoa: Pessoa;
  ras: RA[];
  bairros: Bairro[];
}) {
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(pessoa.status === "Concluído");
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    instagram: pessoa.instagram ?? "",
    raId: "",
    bairroId: "",
    possuiIgreja: "" as "" | "Sim" | "Não",
    nomeIgreja: "",
    lideraPessoas: "" as "" | "Sim" | "Não",
    faixaLideranca: "",
    atividadeComunitaria: [] as string[],
    temasPrioritarios: [] as string[],
    situacaoProfissional: "",
    areaAtuacao: "",
  });

  const bairrosDaRa = bairros.filter((b) => String(b.ra_id) === form.raId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const res = await fetch(`/api/maisvoce/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSucesso(true);
        return;
      }

      // Tenta ler o corpo como JSON, mas não quebra se o servidor responder
      // com algo que não é JSON (ex: erro 500/504 "cru" do próprio Vercel).
      let mensagem = `Erro ao enviar (código ${res.status}). Tente novamente.`;
      try {
        const data = await res.json();
        if (data?.error) mensagem = data.error;
      } catch {
        // corpo não era JSON — mantém a mensagem genérica acima
      }
      setErro(mensagem);
    } catch (err) {
      // Falha de rede, timeout, etc.
      console.error("Erro ao enviar cadastro (Fase 2):", err);
      setErro("Não foi possível conectar. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const primeiroNome = pessoa.nome.split(" ")[0];

  if (sucesso) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <p className="text-3xl font-extrabold text-blue-950">
          {inferirSaudacao(primeiroNome)}, {primeiroNome}!
        </p>

        <p className="text-lg text-blue-900 font-semibold mt-4 max-w-md">
          Agora você faz parte da Geração de Daniel.
        </p>

        <p className="text-lg mt-3 max-w-md" style={{ color: "#ECB300" }}>
          Grandes transformações começam com pessoas dispostas a agir — e você é uma delas.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-blue-950 text-center">
        Quase lá, {primeiroNome}!
      </h1>
      <p className="text-blue-800 mt-2 text-center font-semibold">
        Só faltam mais alguns dados pra completar seu cadastro.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 mt-6">
      {!pessoa.instagram && (
        <Campo label="Meu Instagram">
          <input
            value={form.instagram}
            onChange={(e) => {
              let v = e.target.value;
              if (v.length > 0 && v.charAt(0) !== "@") v = "@" + v;
              setForm({ ...form, instagram: v });
            }}
            placeholder="@seuinstagram"
            className="w-full border rounded-lg px-4 py-3"
          />
        </Campo>
      )}

      <Campo label="Região administrativa">
        <select
          required
          value={form.raId}
          onChange={(e) => setForm({ ...form, raId: e.target.value, bairroId: "" })}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">Selecione</option>
          {ras.map((ra) => (
            <option key={ra.id} value={ra.id}>{ra.nome}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Bairro">
        <select
          required
          value={form.bairroId}
          onChange={(e) => setForm({ ...form, bairroId: e.target.value })}
          disabled={!form.raId}
          className="w-full border rounded-lg px-4 py-3 disabled:opacity-50"
        >
          <option value="">Selecione</option>
          {bairrosDaRa.map((b) => (
            <option key={b.id} value={b.id}>{b.nome}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Frequenta alguma igreja?">
        <SimNao valor={form.possuiIgreja} onChange={(v) => setForm({ ...form, possuiIgreja: v })} />
      </Campo>

      {form.possuiIgreja === "Sim" && (
        <Campo label="Nome da igreja">
          <input
            value={form.nomeIgreja}
            onChange={(e) => setForm({ ...form, nomeIgreja: e.target.value })}
            placeholder="Nome da igreja"
            className="w-full border rounded-lg px-4 py-3"
          />
        </Campo>
      )}

      <Campo label="Exerce alguma liderança?">
        <SimNao valor={form.lideraPessoas} onChange={(v) => setForm({ ...form, lideraPessoas: v })} />
      </Campo>

      {form.lideraPessoas === "Sim" && (
        <Campo label="Faixa de liderança">
          <select
            value={form.faixaLideranca}
            onChange={(e) => setForm({ ...form, faixaLideranca: e.target.value })}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Selecione</option>
            {FAIXA_LIDERANCA_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Campo>
      )}

      <Campo label="Exerce atividade comunitária?">
        <MultiSelect
          opcoes={ATIVIDADE_COMUNITARIA_OPTIONS}
          selecionados={form.atividadeComunitaria}
          onToggle={(v) =>
            setForm((f) => ({
              ...f,
              atividadeComunitaria: f.atividadeComunitaria[0] === v ? [] : [v],
            }))
          }
          fecharAoSelecionar
        />
      </Campo>

      <Campo label="Temas de interesse">
        <MultiSelect
          opcoes={TEMAS_PRIORITARIOS_OPTIONS}
          selecionados={form.temasPrioritarios}
          onToggle={(v) =>
            setForm((f) => ({
              ...f,
              temasPrioritarios: f.temasPrioritarios.includes(v)
                ? f.temasPrioritarios.filter((t) => t !== v)
                : [...f.temasPrioritarios, v],
            }))
          }
          maxSelecionados={2}
        />
      </Campo>

      <Campo label="Situação profissional">
        <select
          value={form.situacaoProfissional}
          onChange={(e) => setForm({ ...form, situacaoProfissional: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">Selecione</option>
          {SITUACAO_PROFISSIONAL_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Área de atuação">
        <select
          value={form.areaAtuacao}
          onChange={(e) => setForm({ ...form, areaAtuacao: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">Selecione</option>
          {AREA_ATUACAO_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Campo>

      {erro && <p className="text-red-600 text-sm mb-4">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-blue-950 font-bold py-4 rounded-xl mt-2"
      >
        {enviando ? "Enviando..." : "Concluir cadastro"}
      </button>
    </form>
    </>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-left text-blue-950 font-semibold mb-1">{label}</label>
      {children}
    </div>
  );
}

function SimNao({
  valor,
  onChange,
}: {
  valor: "" | "Sim" | "Não";
  onChange: (v: "Sim" | "Não") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["Sim", "Não"] as const).map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => onChange(op)}
          className={`py-3 rounded-lg border font-semibold ${
            valor === op ? "bg-blue-100 border-blue-900 text-blue-950" : "bg-white border-gray-300 text-gray-600"
          }`}
        >
          {op}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  opcoes,
  selecionados,
  onToggle,
  maxSelecionados,
  fecharAoSelecionar,
}: {
  opcoes: readonly string[];
  selecionados: string[];
  onToggle: (v: string) => void;
  maxSelecionados?: number;
  fecharAoSelecionar?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  function handleToggle(op: string) {
    onToggle(op);
    if (fecharAoSelecionar) {
      setAberto(false);
      return;
    }
    if (maxSelecionados) {
      const jaEstava = selecionados.includes(op);
      const novoTotal = jaEstava ? selecionados.length - 1 : selecionados.length + 1;
      if (novoTotal >= maxSelecionados) setAberto(false);
    }
  }

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full border rounded-lg px-4 py-3 text-left flex items-center justify-between bg-white"
      >
        <span className={selecionados.length ? "text-gray-800" : "text-gray-400"}>
          {selecionados.length === 0
            ? "Selecionar opções"
            : selecionados.length === 1
            ? selecionados[0]
            : `${selecionados.length} selecionados`}
        </span>
        <span className="text-gray-400">{aberto ? "−" : "+"}</span>
      </button>
      {aberto && (
        <div className="mt-2 border rounded-lg bg-white p-2 max-h-48 overflow-y-auto">
          {opcoes.map((op) => {
            const marcado = selecionados.includes(op);
            const limite = !!maxSelecionados && selecionados.length >= maxSelecionados && !marcado;
            return (
              <label key={op} className={`flex items-center gap-2 py-1.5 ${limite ? "text-gray-300" : "text-gray-700"}`}>
                <input type="checkbox" checked={marcado} disabled={limite} onChange={() => handleToggle(op)} />
                {op}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
