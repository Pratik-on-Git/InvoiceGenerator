"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { flowBlockKey, type FlowBlock } from "@/lib/pagination";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import type { SectionSliceProps } from "./types";

type TermBlock = Extract<FlowBlock, { kind: "term" }>;
type MilestoneBlock = Extract<FlowBlock, { kind: "milestone" }>;

export function TermsSlice({ blocks, continued }: SectionSliceProps) {
  const { inv, set } = useInvoice();
  const terms = inv.terms;
  const termBlocks = blocks.filter((block): block is TermBlock => block.kind === "term");
  const termsEmptyBlock = blocks.find((block) => block.kind === "terms-empty");
  const milestoneBlocks = blocks.filter((block): block is MilestoneBlock => block.kind === "milestone");
  const milestonesEmptyBlock = blocks.find((block) => block.kind === "milestones-empty");
  const statsBlock = blocks.find((block) => block.kind === "stats");
  const showTermAdd = Boolean(termsEmptyBlock) || termBlocks.some((block) => block.index === terms.items.length - 1);
  const showMilestoneAdd = Boolean(milestonesEmptyBlock) || milestoneBlocks.some((block) => block.index === terms.milestones.length - 1);

  return (
    <section className="flow-section">
      <Editable as="div" className="sec-num" value={terms.num} onCommit={(v) => set((d) => (d.terms.num = v))} />
      {!continued ? (
        <Editable as="div" className="sec-title" value={terms.title} onCommit={(v) => set((d) => (d.terms.title = v))} />
      ) : (
        <div className="sec-title">
          <Editable as="span" value={terms.title} onCommit={(v) => set((d) => (d.terms.title = v))} />{" "}
          <span className="muted">— continued</span>
        </div>
      )}
      <div className="sec-rule" />

      {(termBlocks.length > 0 || termsEmptyBlock) && (
        <div
          className={termsEmptyBlock ? "flow-atomic" : undefined}
          data-flow-key={termsEmptyBlock ? flowBlockKey(termsEmptyBlock) : undefined}
        >
          {termBlocks.length > 0 && (
            <ul className="term-list">
              {termBlocks.map((block) => (
                <li className="rowwrap" data-flow-key={flowBlockKey(block)} key={block.index}>
                  <Editable as="span" rich value={terms.items[block.index]} onCommit={(v) => set((d) => (d.terms.items[block.index] = v))} />
                  <ItemControls
                    index={block.index}
                    count={terms.items.length}
                    onMove={(from, to) => set((d) => move(d.terms.items, from, to))}
                    onRemove={() => set((d) => d.terms.items.splice(block.index, 1))}
                  />
                </li>
              ))}
            </ul>
          )}
          {showTermAdd && <AddButton label="term" onAdd={() => set((d) => d.terms.items.push("<b>New term —</b> description."))} />}
        </div>
      )}

      {(milestoneBlocks.length > 0 || milestonesEmptyBlock) && (
        <div
          className={milestonesEmptyBlock ? "flow-atomic" : undefined}
          data-flow-key={milestonesEmptyBlock ? flowBlockKey(milestonesEmptyBlock) : undefined}
        >
          <div className="group-head content-group-head">
            <Editable as="span" className="g-tag" value={terms.mileTag} onCommit={(v) => set((d) => (d.terms.mileTag = v))} />
            <Editable as="span" className="g-title" value={terms.mileTitle} onCommit={(v) => set((d) => (d.terms.mileTitle = v))} />
            <span className="g-line" />
          </div>
          {milestoneBlocks.length > 0 && (
            <div className="two-col">
              {milestoneBlocks.map((block) => {
                const { index } = block;
                const milestone = terms.milestones[index];
                if (!milestone) return null;
                return (
                  <div className="mile-card rowwrap" data-flow-key={flowBlockKey(block)} key={index}>
                    <ItemControls
                      index={index}
                      count={terms.milestones.length}
                      onMove={(from, to) => set((d) => move(d.terms.milestones, from, to))}
                      onRemove={() => set((d) => d.terms.milestones.splice(index, 1))}
                    />
                    <div className="mc-h">
                      <div className="mc-badge"><Editable as="span" value={milestone.n} onCommit={(v) => set((d) => (d.terms.milestones[index].n = v))} /></div>
                      <Editable as="div" className="mc-t" value={milestone.title} onCommit={(v) => set((d) => (d.terms.milestones[index].title = v))} />
                    </div>
                    <Editable as="div" className="mc-pct" value={milestone.pct} onCommit={(v) => set((d) => (d.terms.milestones[index].pct = v))} />
                    <Editable as="div" className="mc-d" value={milestone.desc} onCommit={(v) => set((d) => (d.terms.milestones[index].desc = v))} />
                  </div>
                );
              })}
            </div>
          )}
          {showMilestoneAdd && (
            <AddButton label="milestone" onAdd={() => set((d) => d.terms.milestones.push({
              n: String(d.terms.milestones.length + 1),
              title: "Milestone",
              pct: "0%",
              desc: "Description.",
            }))} />
          )}
        </div>
      )}

      {statsBlock && (
        <div className="flow-atomic" data-flow-key={flowBlockKey(statsBlock)}>
          {terms.stats.length > 0 && (
            <div className="stat-band">
              {terms.stats.map((stat, index) => (
                <div className="stat rowwrap" key={index}>
                  <ItemControls
                    index={index}
                    count={terms.stats.length}
                    onMove={(from, to) => set((d) => move(d.terms.stats, from, to))}
                    onRemove={() => set((d) => d.terms.stats.splice(index, 1))}
                  />
                  <Editable as="div" className="s-k" value={stat.k} onCommit={(v) => set((d) => (d.terms.stats[index].k = v))} />
                  <Editable as="div" rich className="s-v" value={stat.v} onCommit={(v) => set((d) => (d.terms.stats[index].v = v))} />
                  <Editable as="div" className="s-sub" value={stat.sub} onCommit={(v) => set((d) => (d.terms.stats[index].sub = v))} />
                </div>
              ))}
            </div>
          )}
          {terms.stats.length < 3 && <AddButton label="stat" onAdd={() => set((d) => d.terms.stats.push({ k: "Label", v: "Value", sub: "Sub-label" }))} />}
        </div>
      )}
    </section>
  );
}
