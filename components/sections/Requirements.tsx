"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { AutoPaginatedSection, type PaginatedSectionProps } from "../AutoPaginatedSection";

export function Requirements({ startPage, total, onPageCountChange }: PaginatedSectionProps) {
  const { inv, set } = useInvoice();
  const r = inv.requirements;
  const rowCount = Math.ceil(r.items.length / 2);

  return (
    <AutoPaginatedSection
      itemCount={rowCount}
      layoutKey={JSON.stringify(r)}
      startPage={startPage}
      total={total}
      onPageCountChange={onPageCountChange}
      renderPage={(rowIndexes, pageIndex, isLast) => {
        const itemIndexes = rowIndexes.flatMap((row) => [row * 2, row * 2 + 1]).filter((i) => i < r.items.length);
        return (
          <>
            <Editable as="div" className="sec-num" value={r.num} onCommit={(v) => set((d) => (d.requirements.num = v))} />
            {pageIndex === 0 ? (
              <Editable as="div" className="sec-title" value={r.title} onCommit={(v) => set((d) => (d.requirements.title = v))} />
            ) : (
              <div className="sec-title">
                <Editable as="span" value={r.title} onCommit={(v) => set((d) => (d.requirements.title = v))} />{" "}
                <span className="muted">— continued</span>
              </div>
            )}
            <div className="sec-rule" />
            {pageIndex === 0 && <Editable as="p" rich className="lead" value={r.lead} onCommit={(v) => set((d) => (d.requirements.lead = v))} />}

            {itemIndexes.length > 0 && (
              <div className="req-grid">
                {itemIndexes.map((i) => {
                  const item = r.items[i];
                  return (
                    <div className="req rowwrap" key={i}>
                      <ItemControls
                        index={i}
                        count={r.items.length}
                        onMove={(from, to) => set((d) => move(d.requirements.items, from, to))}
                        onRemove={() => set((d) => d.requirements.items.splice(i, 1))}
                      />
                      <div className="r-h">
                        <div className="r-i"><Editable as="span" value={item.letter} onCommit={(v) => set((d) => (d.requirements.items[i].letter = v))} /></div>
                        <Editable as="div" className="r-t" value={item.title} onCommit={(v) => set((d) => (d.requirements.items[i].title = v))} />
                      </div>
                      <Editable as="div" rich className="r-items" value={item.html} onCommit={(v) => set((d) => (d.requirements.items[i].html = v))} />
                    </div>
                  );
                })}
              </div>
            )}

            {isLast && (
              <>
                <AddButton label="requirement" onAdd={() => set((d) => d.requirements.items.push({ letter: "•", title: "New requirement", html: "Details." }))} />
                <Editable as="div" rich className="note-strip requirements-note" value={r.note} onCommit={(v) => set((d) => (d.requirements.note = v))} />
              </>
            )}
          </>
        );
      }}
    />
  );
}
