"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { PageFrame } from "../PageFrame";

export function Requirements({ pageNo, total }: { pageNo: number; total: number }) {
  const { inv, set } = useInvoice();
  const r = inv.requirements;

  return (
    <PageFrame pageNo={pageNo} total={total}>
      <Editable as="div" className="sec-num" value={r.num} onCommit={(v) => set((d) => (d.requirements.num = v))} />
      <Editable as="div" className="sec-title" value={r.title} onCommit={(v) => set((d) => (d.requirements.title = v))} />
      <div className="sec-rule" />
      <Editable as="p" rich className="lead" style={undefined} value={r.lead} onCommit={(v) => set((d) => (d.requirements.lead = v))} />

      <div className="req-grid" style={{ marginTop: "7mm" }}>
        {r.items.map((it, i) => (
          <div className="req rowwrap" key={i}>
            <ItemControls
              index={i}
              count={r.items.length}
              onMove={(from, to) => set((d) => move(d.requirements.items, from, to))}
              onRemove={() => set((d) => d.requirements.items.splice(i, 1))}
            />
            <div className="r-h">
              <div className="r-i">
                <Editable as="span" value={it.letter} onCommit={(v) => set((d) => (d.requirements.items[i].letter = v))} />
              </div>
              <Editable as="div" className="r-t" value={it.title} onCommit={(v) => set((d) => (d.requirements.items[i].title = v))} />
            </div>
            <Editable as="div" rich className="r-items" value={it.html} onCommit={(v) => set((d) => (d.requirements.items[i].html = v))} />
          </div>
        ))}
      </div>
      <AddButton
        label="requirement"
        onAdd={() => set((d) => d.requirements.items.push({ letter: "•", title: "New requirement", html: "Details." }))}
      />

      <Editable
        as="div"
        rich
        className="note-strip"
        style={{ marginTop: "8mm" }}
        value={r.note}
        onCommit={(v) => set((d) => (d.requirements.note = v))}
      />
    </PageFrame>
  );
}
