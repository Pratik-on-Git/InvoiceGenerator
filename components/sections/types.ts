import type { FlowBlock } from "@/lib/pagination";

export interface SectionSliceProps {
  blocks: FlowBlock[];
  continued: boolean;
  isSectionEnd: boolean;
}
