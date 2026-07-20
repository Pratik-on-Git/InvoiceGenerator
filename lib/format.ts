// Indian-style number grouping (e.g. 125000 -> "1,25,000").
export function groupIN(n: number): string {
  if (!isFinite(n)) return "0";
  const neg = n < 0;
  const s = Math.round(Math.abs(n)).toString();
  let out = s;
  if (s.length > 3) {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  return neg ? "-" + out : out;
}

// Money with a currency symbol prefix.
export function money(n: number, currency: string): string {
  return `${currency}${groupIN(n)}`;
}

// Digits only, from any user-typed string.
export function digits(s: string): number {
  const d = s.replace(/[^\d]/g, "");
  return d ? parseInt(d, 10) : 0;
}
