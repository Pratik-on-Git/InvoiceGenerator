"use client";

import type { CSSProperties } from "react";
import { useInvoice } from "@/lib/state";
import { Cover } from "./sections/Cover";
import { Scope } from "./sections/Scope";
import { Features } from "./sections/Features";
import { Terms } from "./sections/Terms";
import { Requirements } from "./sections/Requirements";
import { Payment } from "./sections/Payment";

type Def = { type: "cover" | "scope" | "terms" | "req" | "pay" } | { type: "feat"; gi: number };

export function Doc() {
  const { inv } = useInvoice();

  const defs: Def[] = [{ type: "cover" }];
  if (inv.scope.enabled) defs.push({ type: "scope" });
  if (inv.features.enabled) {
    if (inv.features.groups.length === 0) defs.push({ type: "feat", gi: -1 });
    else inv.features.groups.forEach((_, gi) => defs.push({ type: "feat", gi }));
  }
  if (inv.terms.enabled) defs.push({ type: "terms" });
  if (inv.requirements.enabled) defs.push({ type: "req" });
  if (inv.payment.enabled) defs.push({ type: "pay" });

  const total = defs.length;
  const accentStyle = { "--blue": inv.meta.accent } as CSSProperties;

  return (
    <div className="doc" style={accentStyle}>
      {defs.map((d, i) => {
        const pageNo = i + 1;
        switch (d.type) {
          case "cover":
            return <Cover key="cover" pageNo={pageNo} total={total} />;
          case "scope":
            return <Scope key="scope" pageNo={pageNo} total={total} />;
          case "feat":
            return <Features key={`feat-${d.gi}`} gi={d.gi} pageNo={pageNo} total={total} />;
          case "terms":
            return <Terms key="terms" pageNo={pageNo} total={total} />;
          case "req":
            return <Requirements key="req" pageNo={pageNo} total={total} />;
          case "pay":
            return <Payment key="pay" pageNo={pageNo} total={total} />;
        }
      })}
    </div>
  );
}
