"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { PageFrame } from "../PageFrame";

export function Terms({ pageNo, total }: { pageNo: number; total: number }) {
  const { inv, set } = useInvoice();
  const t = inv.terms;

  return (
    <PageFrame pageNo={pageNo} total={total}>
      <Editable as="div" className="sec-num" value={t.num} onCommit={(v) => set((d) => (d.terms.num = v))} />
      <Editable as="div" className="sec-title" value={t.title} onCommit={(v) => set((d) => (d.terms.title = v))} />
      <div className="sec-rule" />

      <ul className="term-list">
        {t.items.map((item, i) => (
          <li className="rowwrap" key={i}>
            <Editable as="span" rich value={item} onCommit={(v) => set((d) => (d.terms.items[i] = v))} />
            <ItemControls
              index={i}
              count={t.items.length}
              onMove={(from, to) => set((d) => move(d.terms.items, from, to))}
              onRemove={() => set((d) => d.terms.items.splice(i, 1))}
            />
          </li>
        ))}
      </ul>
      <AddButton label="term" onAdd={() => set((d) => d.terms.items.push("<b>New term —</b> description."))} />

      <div className="group-head" style={{ marginTop: "9mm" }}>
        <Editable as="span" className="g-tag" value={t.mileTag} onCommit={(v) => set((d) => (d.terms.mileTag = v))} />
        <Editable as="span" className="g-title" value={t.mileTitle} onCommit={(v) => set((d) => (d.terms.mileTitle = v))} />
        <span className="g-line" />
      </div>

      <div className="two-col">
        {t.milestones.map((m, i) => (
          <div className="mile-card rowwrap" key={i}>
            <ItemControls
              index={i}
              count={t.milestones.length}
              onMove={(from, to) => set((d) => move(d.terms.milestones, from, to))}
              onRemove={() => set((d) => d.terms.milestones.splice(i, 1))}
            />
            <div className="mc-h">
              <div className="mc-badge">
                <Editable as="span" value={m.n} onCommit={(v) => set((d) => (d.terms.milestones[i].n = v))} />
              </div>
              <Editable as="div" className="mc-t" value={m.title} onCommit={(v) => set((d) => (d.terms.milestones[i].title = v))} />
            </div>
            <Editable as="div" className="mc-pct" value={m.pct} onCommit={(v) => set((d) => (d.terms.milestones[i].pct = v))} />
            <Editable as="div" className="mc-d" value={m.desc} onCommit={(v) => set((d) => (d.terms.milestones[i].desc = v))} />
          </div>
        ))}
      </div>
      <AddButton
        label="milestone"
        onAdd={() =>
          set((d) => d.terms.milestones.push({ n: String(d.terms.milestones.length + 1), title: "Milestone", pct: "0%", desc: "Description." }))
        }
      />

      <div className="stat-band">
        {t.stats.map((st, i) => (
          <div className="stat rowwrap" key={i}>
            <ItemControls
              index={i}
              count={t.stats.length}
              onMove={(from, to) => set((d) => move(d.terms.stats, from, to))}
              onRemove={() => set((d) => d.terms.stats.splice(i, 1))}
            />
            <Editable as="div" className="s-k" value={st.k} onCommit={(v) => set((d) => (d.terms.stats[i].k = v))} />
            <Editable as="div" rich className="s-v" value={st.v} onCommit={(v) => set((d) => (d.terms.stats[i].v = v))} />
            <Editable as="div" className="s-sub" value={st.sub} onCommit={(v) => set((d) => (d.terms.stats[i].sub = v))} />
          </div>
        ))}
      </div>
      {t.stats.length < 3 && (
        <AddButton label="stat" onAdd={() => set((d) => d.terms.stats.push({ k: "Label", v: "Value", sub: "Sub-label" }))} />
      )}
    </PageFrame>
  );
}
