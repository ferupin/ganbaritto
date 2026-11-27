import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { t } from "@/i18n";
import { HelpTip } from "./HelpTip";

export interface ControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

/**
 * Rótulo, asterisco de obrigatório, dica, ajuda (?) e mensagem de erro de
 * um campo. Não conhece o controle: entrega a ele os atributos de
 * acessibilidade (render prop), então serve para input, textarea e select.
 * O erro só aparece quando `error` vem preenchido; quem decide QUANDO
 * mostrar (ao sair do campo, ao tentar copiar) é a tela.
 */
export function Field({
  label,
  hint,
  required,
  error,
  help,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  /** Explicação em balão ao lado do rótulo. `label` é o nome acessível do botão "?". */
  help?: { label: string; body: ReactNode };
  className?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={`relative grid content-start gap-1.5 ${className ?? ""}`}>
      <div className="flex min-h-7 items-center gap-1">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
          {required && (
            <span className="ml-0.5 text-bad" aria-hidden="true">
              {" "}
              *
            </span>
          )}
          {required && <span className="sr-only"> {t("common.required")}</span>}
          {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
        </label>
        {help && <HelpTip label={help.label}>{help.body}</HelpTip>}
      </div>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errId : undefined,
        "aria-required": required,
      })}
      {error && (
        <p id={errId} className="flex items-center gap-1.5 text-sm font-semibold text-bad">
          <CircleAlert size={15} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
