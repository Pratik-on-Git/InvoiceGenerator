"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import type { FeatureGroup } from "@/lib/types";
import { flowBlockKey, type FlowBlock } from "@/lib/pagination";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import type { SectionSliceProps } from "./types";

type FeatureBlock = Extract<FlowBlock, { kind: "feature" | "feature-empty" }>;

const newGroup = (): FeatureGroup => ({
  tag: "Group",
  title: "New Group",
  range: "",
  items: [{ title: "New feature", desc: "Short description." }],
});

export function FeaturesSlice({ blocks, continued, isSectionEnd }: SectionSliceProps) {
  const { inv, set } = useInvoice();
  const features = inv.features;
  const completelyEmptyBlock = blocks.find((block) => block.kind === "features-empty");
  const featureBlocks = blocks.filter((block): block is FeatureBlock => block.kind === "feature" || block.kind === "feature-empty");
  const groupIndexes = [...new Set(featureBlocks.map((block) => block.groupIndex))];

  return (
    <section className="flow-section">
      <Editable as="div" className="sec-num" value={features.num} onCommit={(v) => set((d) => (d.features.num = v))} />
      {!continued ? (
        <Editable as="div" className="sec-title" value={features.title} onCommit={(v) => set((d) => (d.features.title = v))} />
      ) : (
        <div className="sec-title">
          <Editable as="span" value={features.title} onCommit={(v) => set((d) => (d.features.title = v))} />{" "}
          <span className="muted">— continued</span>
        </div>
      )}
      <div className="sec-rule" />
      {!continued && <Editable as="p" rich className="lead" value={features.lead} onCommit={(v) => set((d) => (d.features.lead = v))} />}

      {completelyEmptyBlock ? (
        <div className="empty-section flow-atomic" data-flow-key={flowBlockKey(completelyEmptyBlock)}>
          <p className="lead">No feature groups yet.</p>
          <AddButton label="feature group" onAdd={() => set((d) => d.features.groups.push(newGroup()))} />
        </div>
      ) : (
        groupIndexes.map((groupIndex) => {
          const group = features.groups[groupIndex];
          if (!group) return null;
          const selected = featureBlocks.filter((block) => block.groupIndex === groupIndex);
          const items = selected.filter((block): block is Extract<FlowBlock, { kind: "feature" }> => block.kind === "feature");
          const emptyBlock = selected.find((block) => block.kind === "feature-empty");
          const groupStart = Boolean(emptyBlock) || items.some((block) => block.index === 0);
          const groupEnd = Boolean(emptyBlock) || items.some((block) => block.index === group.items.length - 1);
          const offset = features.groups.slice(0, groupIndex).reduce((sum, item) => sum + item.items.length, 0);

          return (
            <div
              className="feature-group-block"
              data-flow-key={emptyBlock ? flowBlockKey(emptyBlock) : undefined}
              key={groupIndex}
            >
              <div className="group-head rowwrap feature-group-head">
                <Editable as="span" className="g-tag" value={group.tag} onCommit={(v) => set((d) => (d.features.groups[groupIndex].tag = v))} />
                <Editable as="span" className="g-title" value={group.title} onCommit={(v) => set((d) => (d.features.groups[groupIndex].title = v))} />
                <span className="g-line" />
                <Editable as="span" className="g-count" value={group.range} placeholder="range" onCommit={(v) => set((d) => (d.features.groups[groupIndex].range = v))} />
                {groupStart && (
                  <ItemControls
                    index={groupIndex}
                    count={features.groups.length}
                    onMove={(from, to) => set((d) => move(d.features.groups, from, to))}
                    onRemove={() => set((d) => d.features.groups.splice(groupIndex, 1))}
                  />
                )}
              </div>

              {items.length > 0 && (
                <div className="feat-grid">
                  {items.map((block) => {
                    const { index } = block;
                    const item = group.items[index];
                    if (!item) return null;
                    return (
                      <div className="feat rowwrap" data-flow-key={flowBlockKey(block)} key={index}>
                        <div className="f-n">{offset + index + 1}</div>
                        <div className="f-body">
                          <Editable as="div" className="f-t" value={item.title} onCommit={(v) => set((d) => (d.features.groups[groupIndex].items[index].title = v))} />
                          <Editable as="div" className="f-d" value={item.desc} onCommit={(v) => set((d) => (d.features.groups[groupIndex].items[index].desc = v))} />
                        </div>
                        <ItemControls
                          index={index}
                          count={group.items.length}
                          onMove={(from, to) => set((d) => move(d.features.groups[groupIndex].items, from, to))}
                          onRemove={() => set((d) => d.features.groups[groupIndex].items.splice(index, 1))}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {groupEnd && (
                <>
                  <AddButton label="feature" onAdd={() => set((d) => d.features.groups[groupIndex].items.push({ title: "New feature", desc: "Short description." }))} />
                  {groupIndex === features.groups.length - 1 && isSectionEnd && (
                    <AddButton label="feature group" onAdd={() => set((d) => d.features.groups.push(newGroup()))} />
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
