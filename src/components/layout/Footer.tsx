import { HardDriveDownload, History } from "lucide-react";
import Link from "next/link";
import { appVersion, brand } from "@/config";
import { t } from "@/i18n";

/** Rodapé discreto. O histórico de versões fica aqui, e não na navegação principal. */
export function Footer() {
  return (
    <footer className="mx-auto max-w-[920px] px-4 pb-9 text-center text-xs text-muted print:hidden">
      <p>{t("footer.privacy")}</p>
      <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5">
        <span>
          {brand.name} {t("footer.version", { version: appVersion })}
        </span>
        <span aria-hidden="true">·</span>
        <Link
          href="/versoes"
          className="inline-flex items-center gap-1 text-muted underline-offset-2 hover:text-accent-text"
        >
          <History size={12} aria-hidden="true" />
          {t("footer.versions")}
        </Link>
        <span aria-hidden="true">·</span>
        <Link
          href="/dados"
          className="inline-flex items-center gap-1 text-muted underline-offset-2 hover:text-accent-text"
        >
          <HardDriveDownload size={12} aria-hidden="true" />
          {t("footer.data")}
        </Link>
      </p>
    </footer>
  );
}
