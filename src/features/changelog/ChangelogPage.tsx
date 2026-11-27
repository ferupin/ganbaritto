import { ChevronDown } from "lucide-react";
import { appVersion, schemaVersion } from "@/config";
import { entries, kindOrder, type ChangeKind } from "@/changelog/entries";
import { t, type MessageKey } from "@/i18n";

const KIND: Record<ChangeKind, { key: MessageKey; badge: string }> = {
  added: { key: "changelog.kindAdded", badge: "badge-ok" },
  changed: { key: "changelog.kindChanged", badge: "badge-ai" },
  fixed: { key: "changelog.kindFixed", badge: "badge-warm" },
  data: { key: "changelog.kindData", badge: "badge-muted" },
  internal: { key: "changelog.kindInternal", badge: "badge-muted" },
};

/** Lista as versões. O rótulo de cada tipo é texto, não só cor. */
export function ChangelogPage() {
  return (
    <div className="sheet">
      <h1 className="page-title">{t("changelog.title")}</h1>
      <p className="lead">{t("changelog.lead")}</p>
      <p className="callout">
        <strong>{t("changelog.current")}: {appVersion}</strong>
        <br />
        {t("changelog.format", { schema: schemaVersion })}
      </p>

      <ol className="mt-6 grid gap-3">
        {entries.map((e, idx) => (
          <li key={e.version}>
            {/* Só a versão mais recente começa aberta; as outras mostram o resumo. */}
            <details className="disclosure changelog-card" open={idx === 0}>
              <summary>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 id={`v-${e.version}`} className="text-xl font-bold">
                      {e.version}
                    </h2>
                    {idx === 0 && <span className="badge">{t("changelog.latest")}</span>}
                    <time dateTime={e.date} className="text-sm text-muted">
                      {new Date(`${e.date}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </span>
                  <span className="mt-1 block text-[15px] text-ink">{e.summary}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {kindOrder.map((k) => {
                      const n = e.changes[k]?.length ?? 0;
                      if (!n) return null;
                      return (
                        <span key={k} className={`badge ${KIND[k].badge}`}>
                          {t(KIND[k].key)} · {n}
                        </span>
                      );
                    })}
                  </span>
                </span>
                <ChevronDown size={20} aria-hidden="true" className="chevron flex-none text-muted transition-transform" />
              </summary>
              <div className="fade-in grid gap-3.5 rounded-b-2xl border border-t-0 border-line bg-paper-2/40 p-4 sm:p-5">
                {kindOrder.map((k) => {
                  const items = e.changes[k];
                  if (!items?.length) return null;
                  return (
                    <section key={k}>
                      <h3 className="mb-1">
                        <span className={`badge ${KIND[k].badge}`}>{t(KIND[k].key)}</span>
                      </h3>
                      <ul className="list-disc space-y-1 pl-5">
                        {items.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
