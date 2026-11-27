"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type { ReactNode } from "react";
import { brand } from "@/config";

/**
 * Dois temas apenas, claro (padrão) e escuro. `enableSystem` fica desligado
 * de propósito: a prova deve parecer sempre uma folha de papel, em vez de
 * mudar sozinha com o tema do aparelho. A escolha fica salva no navegador.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark"]}
      storageKey={`${brand.storagePrefix}.theme`}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
