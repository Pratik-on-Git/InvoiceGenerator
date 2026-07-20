"use client";

import { useInvoice } from "@/lib/state";

export function AppFooter() {
  const { inv } = useInvoice();
  return (
    <footer className="no-print text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs">
      <span className="truncate">{inv.meta.brandFooter}</span>
      <span className="truncate">
        Ctrl/⌘ + B toggles the sidebar · edits autosave to this browser
      </span>
    </footer>
  );
}
