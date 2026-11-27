"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { addTags, removeTag, type TagLimits } from "@/core/tags";
import type { ControlProps } from "./Field";

/**
 * Campo que vira lista de etiquetas removíveis. Enter, vírgula ou o botão
 * adicionam; colar um texto com vários itens também funciona. As etiquetas
 * ficam logo abaixo do campo, cada uma com seu botão de remover.
 */
export function TagInput({
  control,
  tags,
  onChange,
  limits,
  placeholder,
  addLabel,
  listLabel,
  removeLabel,
  countLabel,
}: {
  control: ControlProps;
  tags: string[];
  onChange: (tags: string[]) => void;
  limits: TagLimits;
  placeholder: string;
  addLabel: string;
  listLabel: string;
  removeLabel: (tag: string) => string;
  countLabel: string;
}) {
  const [draft, setDraft] = useState("");
  const full = tags.length >= limits.max;

  function commit(raw: string) {
    if (!raw.trim()) return;
    onChange(addTags(tags, raw, limits).tags);
    setDraft("");
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <input
          {...control}
          className="input min-w-0 flex-1"
          type="text"
          value={draft}
          placeholder={placeholder}
          maxLength={limits.maxLength}
          enterKeyHint="done"
          autoComplete="off"
          disabled={full}
          onChange={(e) => {
            const v = e.target.value;
            // Vírgula ou ponto e vírgula digitados fecham a etiqueta na hora.
            if (/[,;]$/.test(v)) commit(v);
            else setDraft(v);
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/[\n,;]/.test(text)) {
              e.preventDefault();
              commit(text);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
            }
          }}
        />
        <button
          type="button"
          className="btn btn-primary flex-none"
          onClick={() => commit(draft)}
          disabled={!draft.trim() || full}
        >
          <Plus size={18} aria-hidden="true" />
          {addLabel}
        </button>
      </div>
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={listLabel}>
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-accent/40 bg-accent-soft py-0.5 pl-3 pr-0.5 text-sm font-semibold text-accent-text"
            >
              <span className="min-w-0 break-words">{tag}</span>
              <button
                type="button"
                className="grid size-7 flex-none place-items-center rounded-full hover:bg-accent/15"
                aria-label={removeLabel(tag)}
                onClick={() => onChange(removeTag(tags, tag))}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted" aria-live="polite">
        {countLabel}
      </p>
    </div>
  );
}
