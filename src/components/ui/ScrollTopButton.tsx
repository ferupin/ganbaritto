"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/i18n";

const SHOW_AFTER_PX = 480;

/** Aparece quando o cabeçalho e o menu saíram de vista; leva de volta ao topo. */
export function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setShow(window.scrollY > SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      className="scroll-top"
      data-show={show}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      aria-label={t("scrollTop.label")}
      onClick={() => {
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
        // Devolve o foco ao começo da página para quem navega pelo teclado.
        document.getElementById("conteudo")?.focus({ preventScroll: true });
      }}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
