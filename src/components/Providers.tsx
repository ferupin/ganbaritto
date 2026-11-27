"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ConfirmProvider } from "./ui/ConfirmProvider";
import { ToastProvider } from "./ui/ToastProvider";

/** Único ponto que reúne os provedores do app (tema, avisos, confirmações). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
