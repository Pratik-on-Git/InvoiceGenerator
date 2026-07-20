"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { flowBlockKey, type FlowBlock } from "@/lib/pagination";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import type { SectionSliceProps } from "./types";

type RequirementBlock = Extract<FlowBlock, { kind: "requirement" }>;

export function RequirementsSlice({ blocks, continued }: SectionSliceProps) {
  const { inv, set } = useInvoice();
  const requirements = inv.requirements;
  const introBlock = blocks.find((block) => block.kind === "requirements-intro");
  const itemBlocks = blocks.filter((block): block is RequirementBlock => block.kind === "requirement");
  const noteBlock = blocks.find((block) => block.kind === "requirements-note");

  return (
    <section className="flow-section">
      <div className={introBlock ? "flow-atomic" : undefined} data-flow-key={introBlock ? flowBlockKey(introBlock) : undefined}>
        <Editable as="div" className="sec-num" value={requirements.num} onCommit={(v) => set((d) => (d.requirements.num = v))} />
        {!continued ? (
          <Editable as="div" className="sec-title" value={requirements.title} onCommit={(v) => set((d) => (d.requirements.title = v))} />
        ) : (
          <div className="sec-title">
            <Editable as="span" value={requirements.title} onCommit={(v) => set((d) => (d.requirements.title = v))} />{" "}
            <span className="muted">— continued</span>
          </div>
        )}
        <div className="sec-rule" />
        {introBlock && <Editable as="p" rich className="lead" value={requirements.lead} onCommit={(v) => set((d) => (d.requirements.lead = v))} />}
      </div>

      {itemBlocks.length > 0 && (
        <div className="req-grid">
          {itemBlocks.map((block) => {
            const { index } = block;
            const item = requirements.items[index];
            if (!item) return null;
            return (
              <div className="req rowwrap" data-flow-key={flowBlockKey(block)} key={index}>
                <ItemControls
                  index={index}
                  count={requirements.items.length}
                  onMove={(from, to) => set((d) => move(d.requirements.items, from, to))}
                  onRemove={() => set((d) => d.requirements.items.splice(index, 1))}
                />
                <div className="r-h">
                  <div className="r-i"><Editable as="span" value={item.letter} onCommit={(v) => set((d) => (d.requirements.items[index].letter = v))} /></div>
                  <Editable as="div" className="r-t" value={item.title} onCommit={(v) => set((d) => (d.requirements.items[index].title = v))} />
                </div>
                <Editable as="div" rich className="r-items" value={item.html} onCommit={(v) => set((d) => (d.requirements.items[index].html = v))} />
              </div>
            );
          })}
        </div>
      )}

      {noteBlock && (
        <div className="flow-atomic" data-flow-key={flowBlockKey(noteBlock)}>
          <AddButton label="requirement" onAdd={() => set((d) => d.requirements.items.push({ letter: "•", title: "New requirement", html: "Details." }))} />
          <Editable as="div" rich className="note-strip requirements-note" value={requirements.note} onCommit={(v) => set((d) => (d.requirements.note = v))} />
        </div>
      )}
    </section>
  );
}
