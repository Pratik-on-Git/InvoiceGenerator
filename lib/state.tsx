"use client";

import { createContext, useContext } from "react";
import type { Invoice } from "./types";

// A mutator receives a mutable draft; the provider clones state before applying it.
export type Updater = (mutator: (draft: Invoice) => void) => void;

interface Ctx {
  inv: Invoice;
  set: Updater;
  editing: boolean;
}

export const InvoiceCtx = createContext<Ctx | null>(null);

export function useInvoice(): Ctx {
  const ctx = useContext(InvoiceCtx);
  if (!ctx) throw new Error("useInvoice must be used inside <InvoiceCtx.Provider>");
  return ctx;
}

export type SaveState = "saving" | "saved" | "error";

// UI/actions context — lets the dashboard shell (sidebar, header, toolbar)
// reach the document actions without prop-drilling through every layer.
export interface UI {
  editing: boolean;
  setEditing: (v: boolean) => void;
  saveState: SaveState;
  pageTotal: number;
  zoom: number;
  setZoom: (v: number | ((z: number) => number)) => void;
  onDownload: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onLogo: (file: File) => void;
}

export const UICtx = createContext<UI | null>(null);

export function useUI(): UI {
  const ctx = useContext(UICtx);
  if (!ctx) throw new Error("useUI must be used inside <UICtx.Provider>");
  return ctx;
}
