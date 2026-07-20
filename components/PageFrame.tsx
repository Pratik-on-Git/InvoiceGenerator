"use client";

import type { ReactNode, RefCallback } from "react";

import { useInvoice } from "@/lib/state";
import { Editable } from "./Editable";

interface Props {
  pageNo: number;
  total: number;
  children: ReactNode;
  contentScale?: number;
  contentRef?: RefCallback<HTMLDivElement>;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** A fixed A4 sheet with a reserved, non-overlapping footer area. */
export function PageFrame({ pageNo, total, children, contentScale = 1, contentRef }: Props) {
  const { inv, set } = useInvoice();

  return (
    <section className="page">
      <div className="page-body">
        <div
          className="page-body-inner"
          ref={contentRef}
          style={contentScale < 1 ? { transform: `scale(${contentScale})` } : undefined}
        >
          {children}
        </div>
      </div>
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
