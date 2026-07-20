// Small, reusable helpers for editing arrays inside a draft (used with `set`).

/** Move an item within an array, in place. No-op if the target index is out of range. */
export function move<T>(arr: T[], from: number, to: number): void {
  if (to < 0 || to >= arr.length || from === to) return;
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
}

/** Remove the item at `index`, in place. */
export function removeAt<T>(arr: T[], index: number): void {
  arr.splice(index, 1);
}
