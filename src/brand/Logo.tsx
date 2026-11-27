import Link from "next/link";
import { t } from "@/i18n";
import { brand } from "./identity";
import { logo } from "./logo-paths";

/**
 * Logotipo: o nome em curvas, com o último "O" como bolha de gabarito marcada.
 * O desenho vem de scripts/gerar-logo.py (src/brand/logo-paths.ts). As letras usam
 * a cor do texto atual e a bolha usa --brand-coral, então o logotipo acompanha o tema.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  const pad = 2;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${logo.nomeLargura + pad * 2} ${logo.nomeAltura + pad * 2}`}
      className={className}
      role="img"
      aria-label={brand.name}
      fill="currentColor"
    >
      <g transform={`translate(0 ${logo.nomeAltura})`}>
        {logo.letras.map((d, i) => (
          <path key={i} d={d} />
        ))}
        <circle cx={logo.bolha.cx} cy={logo.bolha.cy} r={logo.bolha.r} fill="var(--brand-coral)" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      aria-label={t("brand.home", { name: brand.name })}
      className="inline-flex items-center text-ink no-underline"
    >
      <Wordmark className="h-6 w-auto sm:h-7" />
    </Link>
  );
}
