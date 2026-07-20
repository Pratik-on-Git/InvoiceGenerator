"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { AutoPaginatedSection, type PaginatedSectionProps } from "../AutoPaginatedSection";

export function Scope({ startPage, total, onPageCountChange }: PaginatedSectionProps) {
  const { inv, set } = useInvoice();
  const s = inv.scope;
  const rowCount = Math.ceil(s.deliverables.length / 2);

  return (
    <AutoPaginatedSection
      itemCount={rowCount}
      layoutKey={JSON.stringify(s)}
      startPage={startPage}
      total={total}
      onPageCountChange={onPageCountChange}
      renderPage={(rowIndexes, pageIndex, isLast) => {
        const indexes = rowIndexes.flatMap((row) => [row * 2, row * 2 + 1]).filter((i) => i < s.deliverables.length);
        return (
          <>
            <Editable as="div" className="sec-num" value={s.num} onCommit={(v) => set((d) => (d.scope.num = v))} />
            {pageIndex === 0 ? (
              <Editable as="div" className="sec-title" value={s.title} onCommit={(v) => set((d) => (d.scope.title = v))} />
            ) : (
              <div className="sec-title">
                <Editable as="span" value={s.title} onCommit={(v) => set((d) => (d.scope.title = v))} />{" "}
                <span className="muted">— continued</span>
              </div>
            )}
            <div className="sec-rule" />
            {pageIndex === 0 && <Editable as="p" rich className="lead" value={s.lead} onCommit={(v) => set((d) => (d.scope.lead = v))} />}

            {indexes.length > 0 && (
              <div className="deliv-grid">
                {indexes.map((i) => {
                  const dv = s.deliverables[i];
                  return (
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
                  );
                })}
              </div>
            )}

            {isLast && (
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
                <Editable as="div" rich className="note-strip" value={s.note} onCommit={(v) => set((d) => (d.scope.note = v))} />
              </>
            )}
          </>
        );
      }}
    />
  );
}
