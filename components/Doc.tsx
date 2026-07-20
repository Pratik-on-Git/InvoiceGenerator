"use client";

import type { CSSProperties } from "react";

import { useInvoice } from "@/lib/state";
import { buildDocumentFlow, flowBlockKey, type FlowBlock, type FlowSection } from "@/lib/pagination";
import { AutoPaginatedDocument } from "./AutoPaginatedDocument";
import { CoverSlice } from "./sections/Cover";
import { ScopeSlice } from "./sections/Scope";
import { FeaturesSlice } from "./sections/Features";
import { TermsSlice } from "./sections/Terms";
import { RequirementsSlice } from "./sections/Requirements";
import { PaymentSlice } from "./sections/Payment";

interface Slice {
  section: FlowSection;
  blocks: FlowBlock[];
  firstGlobalIndex: number;
  lastGlobalIndex: number;
}

export function Doc({ onPageCountChange }: { onPageCountChange: (count: number) => void }) {
  const { inv } = useInvoice();
  const flow = buildDocumentFlow(inv);
  const firstBySection = new Map<FlowSection, number>();
  const lastBySection = new Map<FlowSection, number>();
  flow.forEach((block, index) => {
    if (!firstBySection.has(block.section)) firstBySection.set(block.section, index);
    lastBySection.set(block.section, index);
  });

  const renderPage = (blockIndexes: number[], pageIndex: number) => {
    const selected = blockIndexes
      .map((globalIndex) => ({ block: flow[globalIndex], globalIndex }))
      .filter((entry): entry is { block: FlowBlock; globalIndex: number } => Boolean(entry.block));
    const slices: Slice[] = [];

    selected.forEach(({ block, globalIndex }) => {
      const current = slices[slices.length - 1];
      if (current?.section === block.section) {
        current.blocks.push(block);
        current.lastGlobalIndex = globalIndex;
      } else {
        slices.push({
          section: block.section,
          blocks: [block],
          firstGlobalIndex: globalIndex,
          lastGlobalIndex: globalIndex,
        });
      }
    });

    return slices.map((slice) => {
      const props = {
        blocks: slice.blocks,
        continued: slice.firstGlobalIndex !== firstBySection.get(slice.section),
        isSectionEnd: slice.lastGlobalIndex === lastBySection.get(slice.section),
      };
      const key = `${pageIndex}-${slice.section}-${slice.firstGlobalIndex}`;

      switch (slice.section) {
        case "cover":
          return <CoverSlice key={key} {...props} />;
        case "scope":
          return <ScopeSlice key={key} {...props} />;
        case "features":
          return <FeaturesSlice key={key} {...props} />;
        case "terms":
          return <TermsSlice key={key} {...props} />;
        case "requirements":
          return <RequirementsSlice key={key} {...props} />;
        case "payment":
          return <PaymentSlice key={key} {...props} />;
      }
    });
  };

  return (
    <div className="doc" style={{ "--blue": inv.meta.accent } as CSSProperties}>
      <AutoPaginatedDocument
        blockCount={flow.length}
        blockKeys={flow.map(flowBlockKey)}
        layoutKey={JSON.stringify(inv)}
        onPageCountChange={onPageCountChange}
        renderPage={renderPage}
      />
    </div>
  );
}
