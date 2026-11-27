import { Bot, ExternalLink, MessageSquare, Sparkles, type LucideIcon } from "lucide-react";
import { llms } from "@/config";
import { t, type MessageKey } from "@/i18n";

const ICON: Record<(typeof llms)[number]["id"], LucideIcon> = {
  gemini: Sparkles,
  chatgpt: MessageSquare,
  claude: Bot,
};
const NOTE: Record<(typeof llms)[number]["id"], MessageKey> = {
  gemini: "llm.geminiNote",
  chatgpt: "llm.chatgptNote",
  claude: "llm.claudeNote",
};

/** Atalhos para as IAs onde o pedido pode ser colado. A recomendada vem primeiro, sem destaque exagerado. */
export function LlmLinks() {
  return (
    <section className="mt-8 border-t border-line pt-5" aria-labelledby="llm-title">
      <h2 id="llm-title" className="text-lg font-bold">
        {t("llm.title")}
      </h2>
      <p className="mb-3 text-sm text-muted">{t("llm.lead")}</p>
      <ul className="grid gap-2.5 sm:grid-cols-3">
        {llms.map((l) => {
          const Icon = ICON[l.id];
          return (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col gap-1 rounded-xl border border-line bg-paper-2 p-3 text-ink no-underline transition-colors hover:border-ink"
              >
                <span className="flex items-center gap-2 font-bold">
                  <Icon size={18} aria-hidden="true" className="text-accent-text" />
                  {l.name}
                  {l.recommended && <span className="badge ml-auto">{t("llm.recommended")}</span>}
                  <ExternalLink
                    size={14}
                    aria-hidden="true"
                    className={`text-muted ${l.recommended ? "" : "ml-auto"}`}
                  />
                  <span className="sr-only">{t("llm.external")}</span>
                </span>
                <span className="text-[13px] text-muted">{t(NOTE[l.id])}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
