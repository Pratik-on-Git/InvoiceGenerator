"use client";

import { useEffect, useRef } from "react";
import { useInvoice } from "@/lib/state";

type Tag = "span" | "div" | "p" | "li" | "small" | "h1";

interface Props {
  value: string;
  onCommit: (v: string) => void;
  /** Preserve inline HTML (e.g. <b>). Enables native Ctrl+B while editing. */
  rich?: boolean;
  /** Digits only; commits live (on input) so totals update as you type. */
  numeric?: boolean;
  /** Commit on every keystroke instead of on blur. */
  live?: boolean;
  as?: Tag;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

/**
 * Cursor-safe inline editor.
 *
 * The DOM — not React — owns the text while you type, so re-renders never reset
 * the caret. We only write into the node when the incoming value differs AND the
 * node isn't focused (i.e. an external change: load, reset, import, add/remove).
 */
export function Editable({
  value,
  onCommit,
  rich = false,
  numeric = false,
  live = false,
  as = "span",
  className,
  placeholder,
  style,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const { editing } = useInvoice();

  useEffect(() => {
    const el = ref.current;
    if (!el || el === document.activeElement) return;
    const current = rich ? el.innerHTML : el.textContent ?? "";
    if (current !== value) {
      if (rich) el.innerHTML = value;
      else el.textContent = value;
    }
  }, [value, rich]);

  const read = (): string => {
    const el = ref.current;
    if (!el) return "";
    if (rich) return el.innerHTML;
    const text = el.textContent ?? "";
    return numeric ? text.replace(/[^\d]/g, "") : text;
  };

  // Dynamic tag; `any` sidesteps ref/props typing across the element union.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = as;

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={placeholder}
      onInput={() => {
        if (live || numeric) onCommit(read());
      }}
      onBlur={() => onCommit(read())}
    />
  );
}
