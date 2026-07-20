"use client";

import { LayersIcon, PackageIcon, PercentIcon, WalletIcon, type LucideIcon } from "lucide-react";

import { useInvoice } from "@/lib/state";
import { money } from "@/lib/format";
import { pageCount, investTotal, enabledSections } from "@/lib/summary";
import { Card } from "@/components/ui/card";

export function SummaryStrip() {
  const { inv } = useInvoice();

  const stats: { label: string; value: string; sub: string; icon: LucideIcon }[] = [
    {
      label: "Total investment",
      value: money(investTotal(inv), inv.meta.currency),
      sub: `${inv.invest.items.length} line ${inv.invest.items.length === 1 ? "item" : "items"}`,
      icon: WalletIcon,
    },
    {
      label: "Advance",
      value: `${inv.invest.advancePct}%`,
      sub: "on acceptance",
      icon: PercentIcon,
    },
    {
      label: "Document pages",
      value: String(pageCount(inv)),
      sub: `${enabledSections(inv)} of 5 sections on`,
      icon: LayersIcon,
    },
    {
      label: "Deliverables",
      value: String(inv.scope.deliverables.length),
      sub: `${inv.features.groups.length} feature ${inv.features.groups.length === 1 ? "group" : "groups"}`,
      icon: PackageIcon,
    },
  ];

  return (
    <div className="no-print grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} size="sm" className="gap-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground text-xs font-medium">{s.label}</span>
            <span className="bg-accent text-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
              <s.icon className="size-4" />
            </span>
          </div>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight tabular-nums">{s.value}</div>
          <div className="text-muted-foreground mt-0.5 truncate text-xs">{s.sub}</div>
        </Card>
      ))}
    </div>
  );
}
