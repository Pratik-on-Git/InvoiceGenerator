"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { InvoiceCtx, UICtx, type Updater, type SaveState } from "@/lib/state";
import type { Invoice } from "@/lib/types";
import { defaultInvoice } from "@/lib/defaultInvoice";
import { pageCount } from "@/lib/summary";

import { SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "./shell/AppSidebar";
import { AppHeader } from "./shell/AppHeader";
import { AppFooter } from "./shell/AppFooter";

const STORAGE_KEY = "bmc-invoice-v1";

// Recursively merge a stored document over the defaults, so documents saved by an
// older build still gain any newly-added fields instead of rendering undefined.
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
function merge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : (over as T);
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(base as Record<string, unknown>)) {
    out[k] = merge((base as Record<string, unknown>)[k], (over as Record<string, unknown>)[k]);
  }
  return out as T;
}

/**
 * The persistent application shell: sidebar + top navbar + footer, plus the
 * invoice/UI state providers. It lives in the root layout, so it stays mounted
 * (and its state survives) as the user navigates between the document view (`/`)
 * and the edit form (`/edit`). Each route renders into `children`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [inv, setInv] = useState<Invoice>(defaultInvoice);
  const [editing, setEditing] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [pageTotal, setPageTotal] = useState(() => pageCount(defaultInvoice));
  const hydrated = useRef(false);

  // Load once on mount. This must run after mount, not in a useState initializer:
  // localStorage is unavailable during SSR, so the server renders the default and
  // the client swaps in the saved document once hydrated.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration-safe load
      if (raw) setInv(merge(defaultInvoice, JSON.parse(raw)));
    } catch {
      /* ignore corrupt storage */
    }
    hydrated.current = true;
  }, []);

  // Autosave (debounced) after hydration.
  useEffect(() => {
    if (!hydrated.current) return;
    setSaveState("saving");
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
        setSaveState("saved");
      } catch {
        // Quota exceeded (usually a very large embedded logo) or storage disabled.
        setSaveState("error");
      }
    }, 400);
    return () => clearTimeout(id);
  }, [inv]);

  const set: Updater = useCallback((mutator) => {
    setInv((prev) => {
      const draft = structuredClone(prev);
      mutator(draft);
      return draft;
    });
  }, []);

  const onDownload = useCallback(() => {
    const prevTitle = document.title;
    document.title = `${inv.brand.name} — ${inv.meta.docNo}`;
    const restore = () => {
      document.title = prevTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    // Let a just-blurred editor commit and let measured pagination settle before
    // the browser snapshots the DOM for printing.
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
  }, [inv.brand.name, inv.meta.docNo]);

  const onExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(inv, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.meta.docNo || "invoice"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document exported", { description: `${a.download}` });
  }, [inv]);

  const onImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        // Shape guard: reject arrays/primitives or exports missing core sections.
        if (!isObj(parsed) || !isObj(parsed.meta) || !isObj(parsed.cover) || !isObj(parsed.invest)) {
          toast.error("Invalid file", { description: "That JSON is not a Blue Moon invoice export." });
          return;
        }
        setInv(merge(defaultInvoice, parsed));
        toast.success("Document imported");
      } catch {
        toast.error("Could not read that file", { description: "It is not valid JSON." });
      }
    };
    reader.onerror = () => toast.error("Could not read that file.");
    reader.readAsText(file);
  }, []);

  const onReset = useCallback(() => {
    if (confirm("Reset the document to the default template? Your current edits will be lost.")) {
      setInv(structuredClone(defaultInvoice));
      toast.success("Reset to the default template");
    }
  }, []);

  const onLogo = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        set((d) => (d.brand.logo = String(reader.result)));
        toast.success("Logo updated");
      };
      reader.readAsDataURL(file);
    },
    [set]
  );

  return (
    <InvoiceCtx.Provider value={{ inv, set, editing }}>
      <UICtx.Provider
        value={{
          editing,
          setEditing,
          saveState,
          pageTotal,
          setPageTotal,
          zoom,
          setZoom,
          onDownload,
          onExport,
          onImport,
          onReset,
          onLogo,
        }}
      >
        <div className="flex min-h-svh w-full min-w-0 flex-1">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AppHeader />
            {children}
            <AppFooter />
          </SidebarInset>
        </div>
        <Toaster position="bottom-right" />
      </UICtx.Provider>
    </InvoiceCtx.Provider>
  );
}
