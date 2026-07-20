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
