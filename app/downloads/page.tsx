"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";
import { downloads } from "@/config/downloads";

type Acesso = "verificando" | "ativa" | "inativa" | null;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function DownloadsPage() {
  const [email, setEmail] = useState("");
  const [acesso, setAcesso] = useState<Acesso>(null);
  const [msg, setMsg] = useState("");

  async function verificarAcesso(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setAcesso("verificando");
    try {
      const res = await fetch(
        `/api/assinatura/status?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Não foi possível verificar o acesso.");
        setAcesso(null);
        return;
      }
      setAcesso(data.ativa ? "ativa" : "inativa");
      if (!data.ativa) {
        setMsg(
          "Assinatura não encontrada ou pagamento ainda não confirmado. Use o e-mail cadastrado na compra."
        );
      }
    } catch {
      setMsg("Não foi possível verificar o acesso. Tente novamente.");
      setAcesso(null);
    }
  }

  return (
    <Section className="pt-16">
      <h1 className="font-display text-4xl">Downloads</h1>
      <p className="mt-4 max-w-[60ch] text-[var(--text-muted)]">
        Baixe o instalador do Vorazes. O download é liberado somente após a
        confirmação do pagamento — informe o e-mail usado na assinatura para
        verificar.
      </p>

      <form
        onSubmit={verificarAcesso}
        className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setAcesso(null);
            setMsg("");
          }}
          placeholder="E-mail usado na assinatura"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={acesso === "verificando"}
          className="shrink-0 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[#10150f] hover:opacity-90 disabled:opacity-60"
        >
          {acesso === "verificando" ? "Verificando..." : "Verificar acesso"}
        </button>
      </form>

      {msg && (
        <p className="mt-4 max-w-[60ch] text-sm text-[var(--text-muted)]">
          {msg}
        </p>
      )}

      <div className="mt-12 space-y-6">
        {downloads.map((d) => (
          <div
            key={d.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl">Vorazes para {d.platform}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Versão {d.version} · Atualizado em {formatDate(d.releaseDate)}{" "}
                  · {d.sizeMb} MB
                </p>
              </div>

              {acesso === "ativa" && d.fileName ? (
                <a
                  href={`/api/download?email=${encodeURIComponent(email)}&file=${d.id}`}
                  className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[#10150f] hover:opacity-90"
                >
                  Baixar instalador
                </a>
              ) : acesso === "ativa" ? (
                <span
                  className="rounded-md border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-muted)]"
                  title="O instalador ainda não foi publicado."
                >
                  Instalador em breve
                </span>
              ) : (
                <a
                  href="/planos"
                  className="rounded-md border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
                  title="Assine um plano para liberar o download"
                >
                  Assinar para baixar
                </a>
              )}
            </div>

            <div className="mt-6 grid gap-6 border-t border-[var(--border)] pt-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Changelog</p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                  {d.changelog.map((c) => (
                    <li key={c}>— {c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Requisitos</p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                  {d.requirements.map((r) => (
                    <li key={r}>— {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}