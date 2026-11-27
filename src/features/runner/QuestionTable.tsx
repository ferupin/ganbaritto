import type { McQuestion } from "@/core/schema";
import { RichText } from "@/components/math/RichText";

/** Tabela de dados de uma questão. Rola na horizontal dentro da própria caixa, nunca a página. */
export function QuestionTable({ table }: { table: NonNullable<McQuestion["table"]> }) {
  const hasHeader = table.headers.some((h) => h.trim() !== "");
  return (
    <div className="my-2.5 overflow-x-auto">
      <table className="w-full border-collapse text-[15px]">
        {table.caption && (
          <caption className="pb-1 text-left text-[13px] text-muted">{table.caption}</caption>
        )}
        {hasHeader && (
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} scope="col" className="border border-line-strong bg-paper-2 px-2.5 py-2 text-left align-top">
                  <RichText text={h} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="border border-line-strong px-2.5 py-2 text-left align-top">
                  <RichText text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
