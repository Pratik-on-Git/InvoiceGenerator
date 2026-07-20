"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { useInvoice } from "@/lib/state";
import { Cover } from "./sections/Cover";
import { Scope } from "./sections/Scope";
import { Features } from "./sections/Features";
import { Terms } from "./sections/Terms";
import { Requirements } from "./sections/Requirements";
import { Payment } from "./sections/Payment";

type Def =
  | { id: string; type: "cover" | "scope" | "terms" | "req" | "pay" }
  | { id: string; type: "feat"; gi: number };

export function Doc({ onPageCountChange }: { onPageCountChange: (count: number) => void }) {
  const { inv } = useInvoice();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const defs: Def[] = [{ id: "cover", type: "cover" }];
  if (inv.scope.enabled) defs.push({ id: "scope", type: "scope" });
  if (inv.features.enabled) {
    if (inv.features.groups.length === 0) defs.push({ id: "feat-empty", type: "feat", gi: -1 });
    else inv.features.groups.forEach((_, gi) => defs.push({ id: `feat-${gi}`, type: "feat", gi }));
  }
  if (inv.terms.enabled) defs.push({ id: "terms", type: "terms" });
  if (inv.requirements.enabled) defs.push({ id: "req", type: "req" });
  if (inv.payment.enabled) defs.push({ id: "pay", type: "pay" });

  const total = defs.reduce((sum, def) => sum + (counts[def.id] ?? 1), 0);
  const accentStyle = { "--blue": inv.meta.accent } as CSSProperties;

  useEffect(() => {
    const id = window.setTimeout(() => onPageCountChange(total), 0);
    return () => window.clearTimeout(id);
  }, [onPageCountChange, total]);

  let nextPage = 1;
  return (
    <div className="doc" style={accentStyle}>
      {defs.map((def) => {
        const startPage = nextPage;
        nextPage += counts[def.id] ?? 1;
        const report = (count: number) => {
          setCounts((current) => current[def.id] === count ? current : { ...current, [def.id]: count });
        };
        const props = { startPage, total, onPageCountChange: report };

        switch (def.type) {
          case "cover":
            return <Cover key={def.id} {...props} />;
          case "scope":
            return <Scope key={def.id} {...props} />;
          case "feat":
            return <Features key={def.id} gi={def.gi} {...props} />;
          case "terms":
            return <Terms key={def.id} {...props} />;
          case "req":
            return <Requirements key={def.id} {...props} />;
          case "pay":
            return <Payment key={def.id} {...props} />;
        }
      })}
    </div>
  );
}
