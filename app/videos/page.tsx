import { Section } from "@/components/ui/section";
import { videos } from "@/config/videos";

export const metadata = {
  title: "Vídeos de demonstração | Vorazes",
  description: "Veja o Vorazes em ação em vídeos curtos de demonstração.",
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideosPage() {
  return (
    <Section className="pt-16">
      <h1 className="font-display text-4xl">Vídeos de demonstração</h1>
      <p className="mt-4 max-w-[60ch] text-[var(--text-muted)]">
        Veja como o Vorazes funciona na prática, direto das telas do sistema.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {videos.map((v) => (
          <div
            key={v.id}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <div className="flex aspect-video items-center justify-center bg-[var(--surface-2)] text-sm text-[var(--text-muted)]">
              {v.externalId ? "Vídeo" : "Em breve"}
            </div>
            <div className="p-5">
              <span className="text-xs text-[var(--accent)]">
                {v.category}
              </span>
              <p className="mt-2 font-medium">{v.title}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {v.description}
              </p>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                {formatDuration(v.durationSeconds)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
