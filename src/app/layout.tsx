import { ScrollTopButton } from "@/components/ui/ScrollTopButton";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import { brand } from "@/config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.tagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4ebdd",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main id="conteudo" tabIndex={-1} className="mx-auto outline-none max-w-[920px] px-0 pb-14 pt-1 sm:px-4 print:p-0">{children}</main>
          <Footer />
          <ScrollTopButton />
        </Providers>
      </body>
    </html>
  );
}
