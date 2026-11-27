/**
 * Etapa de ensino derivada do campo `grade` do banco ("5º Ano do Ensino
 * Fundamental I"). Assim um banco novo se encaixa sozinho no catálogo, sem
 * cadastro à parte. Bancos sem número de ano caem em "other".
 */
export type Stage = "fundamental-1" | "fundamental-2" | "other";

export function yearOf(grade: string | undefined): number | undefined {
  const m = grade?.match(/(\d{1,2})\s*[º°o]/i);
  return m ? Number(m[1]) : undefined;
}

export function stageOf(grade: string | undefined): Stage {
  const y = yearOf(grade);
  if (y === undefined) return "other";
  if (y >= 1 && y <= 5) return "fundamental-1";
  if (y >= 6 && y <= 9) return "fundamental-2";
  return "other";
}
