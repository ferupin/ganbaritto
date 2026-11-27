"use client";

import { useId } from "react";

export type Tone = "ok" | "warm" | "bad";

/**
 * Escolha de uma entre poucas opções: rádios nativos (uma parada de Tab,
 * setas dentro do grupo). `tone` colore a opção com significado (ex.: nível
 * de dificuldade). Com `equal`, as opções dividem a largura por igual.
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  equal = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; tone?: Tone }[];
  onChange: (v: T) => void;
  equal?: boolean;
}) {
  const name = useId();
  return (
    <div
      className={equal ? "grid gap-2" : "flex flex-wrap gap-2"}
      style={equal ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((o) => (
        <label key={o.value} className={`pick ${o.tone ? `pick-${o.tone}` : ""} ${equal ? "pick-fill" : ""}`}>
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
