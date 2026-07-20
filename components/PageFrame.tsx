"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInvoice } from "@/lib/state";
import { Editable } from "./Editable";

interface Props {
  pageNo: number;
  total: number;
  children: ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");

// A4 height in CSS px at 96dpi (297mm). Content taller than this is clipped in the PDF.
const A4_PX = Math.round((297 / 25.4) * 96);

/** An A4 sheet with the standard footer + a live "overflows A4" warning while editing. */
export function PageFrame({ pageNo, total, children }: Props) {
  const { inv, set, editing } = useInvoice();
  const ref = useRef<HTMLElement | null>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => {
      // Measure the *printed* height: the add buttons are editor-only and absent
      // from the PDF, so subtract their in-flow height. (Item controls / badge are
      // absolutely positioned and don't affect scrollHeight.)
      let editorChrome = 0;
      el.querySelectorAll<HTMLElement>(".add-slot").forEach((s) => {
        const cs = getComputedStyle(s);
        editorChrome += s.offsetHeight + parseFloat(cs.marginTop || "0") + parseFloat(cs.marginBottom || "0");
      });
      setOverflow(el.scrollHeight - editorChrome > A4_PX + 4);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="page" ref={ref}>
      {editing && overflow && (
        <div className="overflow-badge" title="This content is taller than one A4 page and will be clipped in the PDF. Move items to another page/group, or disable a section.">
          ⚠ Overflows A4 — content will be clipped
        </div>
      )}
      {children}
      <div className="foot">
        <Editable
          value={inv.meta.brandFooter}
          placeholder="Brand"
          onCommit={(v) => set((d) => (d.meta.brandFooter = v))}
        />
        <Editable
          as="span"
          className="mid"
          placeholder="Document label"
          value={inv.meta.docFooter}
          onCommit={(v) => set((d) => (d.meta.docFooter = v))}
        />
        <span className="pg">
          <b>{pad(pageNo)}</b> / {pad(total)}
        </span>
      </div>
    </section>
  );
}
