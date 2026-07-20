import type { Invoice, SectionKey } from "./types";

export const SECTION_KEYS: SectionKey[] = ["scope", "features", "terms", "requirements", "payment"];

/** Initial logical page estimate used before browser-measured pagination settles. */
export function pageCount(inv: Invoice): number {
  let n = 1; // cover is always present
  if (inv.scope.enabled) n += 1;
  if (inv.features.enabled) n += inv.features.groups.length === 0 ? 1 : inv.features.groups.length;
  if (inv.terms.enabled) n += 1;
  if (inv.requirements.enabled) n += 1;
  if (inv.payment.enabled) n += 1;
  return n;
}

/** Sum of the investment line-item amounts. */
export function investTotal(inv: Invoice): number {
  return inv.invest.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
}

/** How many of the optional sections are currently enabled. */
export function enabledSections(inv: Invoice): number {
  return SECTION_KEYS.reduce((n, k) => n + (inv[k].enabled ? 1 : 0), 0);
}
