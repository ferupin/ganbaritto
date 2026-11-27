"use client";

import { Library, Sparkles, Upload, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type MessageKey } from "@/i18n";
import { Logo } from "@/brand/Logo";
import { ThemeToggle } from "../theme/ThemeToggle";

const LINKS: { href: string; key: MessageKey; Icon: LucideIcon }[] = [
  { href: "/", key: "nav.library", Icon: Library },
  { href: "/importar", key: "nav.import", Icon: Upload },
  { href: "/criar", key: "nav.create", Icon: Sparkles },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="mx-auto flex max-w-[920px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 print:hidden">
      <Logo />
      <nav aria-label={t("nav.label")} className="ml-auto flex flex-wrap items-center gap-1">
        {LINKS.map(({ href, key, Icon }) => {
          const current = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold no-underline transition-colors hover:bg-paper hover:text-ink sm:px-3 sm:text-[15px] ${
                current
                  ? "bg-paper text-ink shadow-[inset_0_-2px_0_var(--accent)]"
                  : "text-muted"
              }`}
            >
              <Icon size={17} aria-hidden="true" className="hidden min-[420px]:block" />
              {t(key)}
            </Link>
          );
        })}
        <ThemeToggle />
      </nav>
    </header>
  );
}
