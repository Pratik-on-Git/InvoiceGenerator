import type { Invoice } from "./types";

/** Replace every verbatim occurrence of `from` with `to` (plain string, no regex). */
function swapAll(text: string, from: string, to: string): string {
  return from ? text.split(from).join(to) : text;
}

/**
 * Set the client's name and cascade it to the places that echo it verbatim —
 * the document footer, the scope lead paragraph, and the client signatory — so
 * those stay in sync while their surrounding wording is left untouched.
 *
 * It is one-directional (client name → derived fields) and only swaps the name
 * token: renaming "Kanthiveda Herbals" to "Acme" turns the footer
 * "E-Commerce Website — Kanthiveda Herbals" into "E-Commerce Website — Acme"
 * and updates the client's signature line, without disturbing anything else.
 *
 * Call inside a `set` draft mutation, e.g. `set((d) => renameClient(d, value))`.
 */
export function renameClient(d: Invoice, next: string): void {
  const prev = d.client.name;
  d.client.name = next;
  if (!prev || prev === next) return;

  d.meta.docFooter = swapAll(d.meta.docFooter, prev, next);
  d.scope.lead = swapAll(d.scope.lead, prev, next);
  for (const sign of d.payment.signs) {
    if (sign.name === prev) sign.name = next;
  }
}
