"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InvoiceCtx, type Updater } from "@/lib/state";
import type { Invoice } from "@/lib/types";
import { defaultInvoice } from "@/lib/defaultInvoice";
import { AppBar } from "./AppBar";
import { Doc } from "./Doc";

const STORAGE_KEY = "bmc-invoice-v1";

// Recursively merge a stored document over the defaults, so documents saved by an
// older build still gain any newly-added fields instead of rendering undefined.
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
function merge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined ? base : (over as T));
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(base as Record<string, unknown>)) {
    out[k] = merge((base as Record<string, unknown>)[k], (over as Record<string, unknown>)[k]);
  }
  return out as T;
}

export function Generator() {
  const [inv, setInv] = useState<Invoice>(defaultInvoice);
  const [editing, setEditing] = useState(true);
  const [saveState, setSaveState] = useState<"saving" | "saved" | "error">("saved");
  const hydrated = useRef(false);

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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
    window.print();
  }, [inv.brand.name, inv.meta.docNo]);

  const onExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(inv, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.meta.docNo || "invoice"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [inv]);

  const onImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        // Shape guard: reject arrays/primitives or exports missing core sections.
        if (!isObj(parsed) || !isObj(parsed.meta) || !isObj(parsed.cover) || !isObj(parsed.invest)) {
          alert("That JSON does not look like a Blue Moon invoice export.");
          return;
        }
        setInv(merge(defaultInvoice, parsed));
      } catch {
        alert("That file is not valid JSON.");
      }
    };
    reader.onerror = () => alert("Could not read that file.");
    reader.readAsText(file);
  }, []);

  const onReset = useCallback(() => {
    if (confirm("Reset the document to the default template? Your current edits will be lost.")) {
      setInv(structuredClone(defaultInvoice));
    }
  }, []);

  const onLogo = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => set((d) => (d.brand.logo = String(reader.result)));
    reader.readAsDataURL(file);
  }, [set]);

  return (
    <InvoiceCtx.Provider value={{ inv, set, editing }}>
      <div className={"app" + (editing ? " editing" : "")}>
        <AppBar
          editing={editing}
          setEditing={setEditing}
          saveState={saveState}
          onDownload={onDownload}
          onExport={onExport}
          onImport={onImport}
          onReset={onReset}
          onLogo={onLogo}
        />
        <main className="stage">
          <Doc />
        </main>
      </div>
    </InvoiceCtx.Provider>
  );
}
