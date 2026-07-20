"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { PageFrame } from "../PageFrame";

export function Scope({ pageNo, total }: { pageNo: number; total: number }) {
  const { inv, set } = useInvoice();
  const s = inv.scope;

  return (
    <PageFrame pageNo={pageNo} total={total}>
      <Editable as="div" className="sec-num" value={s.num} onCommit={(v) => set((d) => (d.scope.num = v))} />
      <Editable as="div" className="sec-title" value={s.title} onCommit={(v) => set((d) => (d.scope.title = v))} />
      <div className="sec-rule" />
      <Editable as="p" rich className="lead" value={s.lead} onCommit={(v) => set((d) => (d.scope.lead = v))} />

      <div className="deliv-grid">
        {s.deliverables.map((dv, i) => (
          <div className="deliv rowwrap" key={i}>
            <ItemControls
              index={i}
              count={s.deliverables.length}
              onMove={(from, to) => set((d) => move(d.scope.deliverables, from, to))}
              onRemove={() => set((d) => d.scope.deliverables.splice(i, 1))}
            />
            <div className="d-top">
              <Editable as="span" className="d-idx" value={dv.idx} onCommit={(v) => set((d) => (d.scope.deliverables[i].idx = v))} />
              <Editable as="span" className="d-price" value={dv.price} onCommit={(v) => set((d) => (d.scope.deliverables[i].price = v))} />
            </div>
            <Editable as="div" className="d-name" value={dv.name} onCommit={(v) => set((d) => (d.scope.deliverables[i].name = v))} />
            <Editable as="div" className="d-meta" value={dv.meta} onCommit={(v) => set((d) => (d.scope.deliverables[i].meta = v))} />
            <Editable as="div" className="d-desc" value={dv.desc} onCommit={(v) => set((d) => (d.scope.deliverables[i].desc = v))} />
            <div className="d-inc">
              <div className="label">Includes</div>
              <ul>
                {dv.includes.map((inc, j) => (
                  <li className="rowwrap" key={j}>
                    <Editable as="span" value={inc} onCommit={(v) => set((d) => (d.scope.deliverables[i].includes[j] = v))} />
                    <RemoveButton onRemove={() => set((d) => d.scope.deliverables[i].includes.splice(j, 1))} />
                  </li>
                ))}
              </ul>
              <AddButton inline label="item" onAdd={() => set((d) => d.scope.deliverables[i].includes.push("New item"))} />
            </div>
          </div>
        ))}
      </div>
      <AddButton
        label="deliverable"
        onAdd={() =>
          set((d) =>
            d.scope.deliverables.push({
              idx: "DELIVERABLE",
              price: inv.meta.currency + "0",
              name: "New deliverable",
              meta: "Meta",
              desc: "Description of this deliverable.",
              includes: ["Included item"],
            })
          )
        }
      />

      <Editable as="div" rich className="note-strip" value={s.note} onCommit={(v) => set((d) => (d.scope.note = v))} />
    </PageFrame>
  );
}
