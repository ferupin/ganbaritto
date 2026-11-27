import { t } from "@/i18n";

/** Número, título e tipo de correção. O tipo é texto, não só cor. */
export function QuestionHead({
  number,
  title,
  kind,
}: {
  number: number;
  title?: string;
  kind: "auto" | "assisted";
}) {
  return (
    <div className="mb-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span className="min-w-7 font-extrabold text-accent-text">{number}.</span>
      {title && <span className="font-bold">{title}</span>}
      <span className="ml-auto print:hidden">
        {kind === "auto" ? (
          <span className="badge badge-ai">{t("runner.autoBadge")}</span>
        ) : (
          <span className="badge badge-warm">{t("runner.assistedBadge")}</span>
        )}
      </span>
    </div>
  );
}
