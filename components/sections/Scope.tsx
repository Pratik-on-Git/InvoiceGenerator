"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import type { FlowBlock } from "@/lib/pagination";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import type { SectionSliceProps } from "./types";

type DeliverableBlock = Extract<FlowBlock, { kind: "deliverable" }>;

export function ScopeSlice({ blocks, continued }: SectionSliceProps) {
  const { inv, set } = useInvoice();
  const scope = inv.scope;
  const deliverables = blocks.filter((block): block is DeliverableBlock => block.kind === "deliverable");
  const showNote = blocks.some((block) => block.kind === "scope-note");

  return (
    <section className="flow-section">
      <Editable as="div" className="sec-num" value={scope.num} onCommit={(v) => set((d) => (d.scope.num = v))} />
      {!continued ? (
        <Editable as="div" className="sec-title" value={scope.title} onCommit={(v) => set((d) => (d.scope.title = v))} />
      ) : (
        <div className="sec-title">
          <Editable as="span" value={scope.title} onCommit={(v) => set((d) => (d.scope.title = v))} />{" "}
          <span className="muted">— continued</span>
        </div>
      )}
      <div className="sec-rule" />
      {!continued && <Editable as="p" rich className="lead" value={scope.lead} onCommit={(v) => set((d) => (d.scope.lead = v))} />}

      {deliverables.length > 0 && (
        <div className="deliv-grid">
          {deliverables.map(({ index }) => {
            const deliverable = scope.deliverables[index];
            if (!deliverable) return null;
            return (
              <div className="deliv rowwrap" key={index}>
                <ItemControls
                  index={index}
                  count={scope.deliverables.length}
                  onMove={(from, to) => set((d) => move(d.scope.deliverables, from, to))}
                  onRemove={() => set((d) => d.scope.deliverables.splice(index, 1))}
                />
                <div className="d-top">
                  <Editable as="span" className="d-idx" value={deliverable.idx} onCommit={(v) => set((d) => (d.scope.deliverables[index].idx = v))} />
                  <Editable as="span" className="d-price" value={deliverable.price} onCommit={(v) => set((d) => (d.scope.deliverables[index].price = v))} />
                </div>
                <Editable as="div" className="d-name" value={deliverable.name} onCommit={(v) => set((d) => (d.scope.deliverables[index].name = v))} />
                <Editable as="div" className="d-meta" value={deliverable.meta} onCommit={(v) => set((d) => (d.scope.deliverables[index].meta = v))} />
                <Editable as="div" className="d-desc" value={deliverable.desc} onCommit={(v) => set((d) => (d.scope.deliverables[index].desc = v))} />
                <div className="d-inc">
                  <div className="label">Includes</div>
                  <ul>
                    {deliverable.includes.map((item, itemIndex) => (
                      <li className="rowwrap" key={itemIndex}>
                        <Editable as="span" value={item} onCommit={(v) => set((d) => (d.scope.deliverables[index].includes[itemIndex] = v))} />
                        <RemoveButton onRemove={() => set((d) => d.scope.deliverables[index].includes.splice(itemIndex, 1))} />
                      </li>
                    ))}
                  </ul>
                  <AddButton inline label="item" onAdd={() => set((d) => d.scope.deliverables[index].includes.push("New item"))} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNote && (
        <>
          <AddButton
            label="deliverable"
            onAdd={() => set((d) => d.scope.deliverables.push({
              idx: "DELIVERABLE",
              price: inv.meta.currency + "0",
              name: "New deliverable",
              meta: "Meta",
              desc: "Description of this deliverable.",
              includes: ["Included item"],
            }))}
          />
          <Editable as="div" rich className="note-strip" value={scope.note} onCommit={(v) => set((d) => (d.scope.note = v))} />
        </>
      )}
    </section>
  );
}
