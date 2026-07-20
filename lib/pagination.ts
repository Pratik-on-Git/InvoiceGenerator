import type { Invoice } from "./types";

export type FlowSection = "cover" | "scope" | "features" | "terms" | "requirements" | "payment";

export type FlowBlock =
  | { section: "cover"; kind: "cover-intro" }
  | { section: "cover"; kind: "investment-item"; index: number }
  | { section: "cover"; kind: "investment-total" }
  | { section: "scope"; kind: "scope-intro" }
  | { section: "scope"; kind: "deliverable"; index: number }
  | { section: "scope"; kind: "scope-note" }
  | { section: "features"; kind: "features-intro" }
  | { section: "features"; kind: "features-empty" }
  | { section: "features"; kind: "feature-empty"; groupIndex: number }
  | { section: "features"; kind: "feature"; groupIndex: number; index: number }
  | { section: "terms"; kind: "terms-intro" }
  | { section: "terms"; kind: "terms-empty" }
  | { section: "terms"; kind: "term"; index: number }
  | { section: "terms"; kind: "milestones-empty" }
  | { section: "terms"; kind: "milestone"; index: number }
  | { section: "terms"; kind: "stats" }
  | { section: "requirements"; kind: "requirements-intro" }
  | { section: "requirements"; kind: "requirement"; index: number }
  | { section: "requirements"; kind: "requirements-note" }
  | { section: "payment"; kind: "payment-intro" }
  | { section: "payment"; kind: "payment-row"; index: number }
  | { section: "payment"; kind: "signatures-empty" }
  | { section: "payment"; kind: "signature"; index: number }
  | { section: "payment"; kind: "thanks" };

/** Build one continuous, ordered stream of atomic document blocks. */
export function buildDocumentFlow(inv: Invoice): FlowBlock[] {
  const blocks: FlowBlock[] = [
    { section: "cover", kind: "cover-intro" },
    ...inv.invest.items.map((_, index) => ({ section: "cover", kind: "investment-item", index }) as const),
    { section: "cover", kind: "investment-total" },
  ];

  if (inv.scope.enabled) {
    blocks.push(
      { section: "scope", kind: "scope-intro" },
      ...inv.scope.deliverables.map((_, index) => ({ section: "scope", kind: "deliverable", index }) as const),
      { section: "scope", kind: "scope-note" },
    );
  }

  if (inv.features.enabled) {
    blocks.push({ section: "features", kind: "features-intro" });
    if (inv.features.groups.length === 0) {
      blocks.push({ section: "features", kind: "features-empty" });
    } else {
      inv.features.groups.forEach((group, groupIndex) => {
        if (group.items.length === 0) blocks.push({ section: "features", kind: "feature-empty", groupIndex });
        else {
          blocks.push(
            ...group.items.map((_, index) => ({ section: "features", kind: "feature", groupIndex, index }) as const),
          );
        }
      });
    }
  }

  if (inv.terms.enabled) {
    blocks.push({ section: "terms", kind: "terms-intro" });
    if (inv.terms.items.length === 0) blocks.push({ section: "terms", kind: "terms-empty" });
    else blocks.push(...inv.terms.items.map((_, index) => ({ section: "terms", kind: "term", index }) as const));

    if (inv.terms.milestones.length === 0) blocks.push({ section: "terms", kind: "milestones-empty" });
    else blocks.push(...inv.terms.milestones.map((_, index) => ({ section: "terms", kind: "milestone", index }) as const));
    blocks.push({ section: "terms", kind: "stats" });
  }

  if (inv.requirements.enabled) {
    blocks.push(
      { section: "requirements", kind: "requirements-intro" },
      ...inv.requirements.items.map((_, index) => ({ section: "requirements", kind: "requirement", index }) as const),
      { section: "requirements", kind: "requirements-note" },
    );
  }

  if (inv.payment.enabled) {
    const rowCount = Math.max(inv.payment.bank.length, inv.payment.contact.length, 1);
    blocks.push(
      { section: "payment", kind: "payment-intro" },
      ...Array.from({ length: rowCount }, (_, index) => ({ section: "payment", kind: "payment-row", index }) as const),
    );
    if (inv.payment.signs.length === 0) blocks.push({ section: "payment", kind: "signatures-empty" });
    else blocks.push(...inv.payment.signs.map((_, index) => ({ section: "payment", kind: "signature", index }) as const));
    blocks.push({ section: "payment", kind: "thanks" });
  }

  return blocks;
}

export function flowBlockKey(block: FlowBlock): string {
  switch (block.kind) {
    case "investment-item":
    case "deliverable":
    case "term":
    case "milestone":
    case "requirement":
    case "payment-row":
    case "signature":
      return `${block.section}-${block.kind}-${block.index}`;
    case "feature":
      return `${block.section}-${block.kind}-${block.groupIndex}-${block.index}`;
    case "feature-empty":
      return `${block.section}-${block.kind}-${block.groupIndex}`;
    default:
      return `${block.section}-${block.kind}`;
  }
}
