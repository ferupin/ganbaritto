"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { t } from "@/i18n";

const BAR = { light: "#ebe3d1", dark: "#15171b" } as const;

/** Interruptor claro/escuro. Também acerta a cor da barra do navegador no celular. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? BAR.dark : BAR.light);
  }, [dark]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={t("theme.label")}
      title={dark ? t("theme.toLight") : t("theme.toDark")}
      className="btn btn-sm btn-icon"
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
