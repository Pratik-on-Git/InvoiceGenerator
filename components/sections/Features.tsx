"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { PageFrame } from "../PageFrame";
import type { FeatureGroup } from "@/lib/types";

const newGroup = (): FeatureGroup => ({
  tag: "Group",
  title: "New Group",
  range: "",
  items: [{ title: "New feature", desc: "Short description." }],
});

export function Features({ pageNo, total, gi }: { pageNo: number; total: number; gi: number }) {
  const { inv, set } = useInvoice();
  const f = inv.features;
  const empty = gi < 0 || !f.groups[gi];
  const isFirst = gi <= 0;
  const isLast = empty || gi === f.groups.length - 1;
  const group = empty ? undefined : f.groups[gi];
  const offset = empty ? 0 : f.groups.slice(0, gi).reduce((s, g) => s + g.items.length, 0);

  return (
    <PageFrame pageNo={pageNo} total={total}>
      <Editable as="div" className="sec-num" value={f.num} onCommit={(v) => set((d) => (d.features.num = v))} />
      {isFirst ? (
        <Editable as="div" className="sec-title" value={f.title} onCommit={(v) => set((d) => (d.features.title = v))} />
      ) : (
        <div className="sec-title">
          <Editable as="span" value={f.title} onCommit={(v) => set((d) => (d.features.title = v))} />{" "}
          <span className="muted">— continued</span>
        </div>
      )}
      <div className="sec-rule" />
      {isFirst && (
        <Editable as="p" rich className="lead" value={f.lead} onCommit={(v) => set((d) => (d.features.lead = v))} />
      )}

      {empty ? (
        <div style={{ marginTop: "10mm" }}>
          <p className="lead" style={{ marginBottom: "5mm" }}>
            No feature groups yet.
          </p>
          <AddButton label="feature group" onAdd={() => set((d) => d.features.groups.push(newGroup()))} />
        </div>
      ) : (
        <>
          <div className="group-head rowwrap" style={isFirst ? { marginTop: "8mm" } : { marginTop: "2mm" }}>
            <Editable as="span" className="g-tag" value={group!.tag} onCommit={(v) => set((d) => (d.features.groups[gi].tag = v))} />
            <Editable as="span" className="g-title" value={group!.title} onCommit={(v) => set((d) => (d.features.groups[gi].title = v))} />
            <span className="g-line" />
            <Editable as="span" className="g-count" value={group!.range} placeholder="range" onCommit={(v) => set((d) => (d.features.groups[gi].range = v))} />
            <ItemControls
              index={gi}
              count={f.groups.length}
              onMove={(from, to) => set((d) => move(d.features.groups, from, to))}
              onRemove={() => set((d) => d.features.groups.splice(gi, 1))}
            />
          </div>

          <div className="feat-grid">
            {group!.items.map((it, j) => (
              <div className="feat rowwrap" key={j}>
                <div className="f-n">{offset + j + 1}</div>
                <div className="f-body">
                  <Editable as="div" className="f-t" value={it.title} onCommit={(v) => set((d) => (d.features.groups[gi].items[j].title = v))} />
                  <Editable as="div" className="f-d" value={it.desc} onCommit={(v) => set((d) => (d.features.groups[gi].items[j].desc = v))} />
                </div>
                <ItemControls
                  index={j}
                  count={group!.items.length}
                  onMove={(from, to) => set((d) => move(d.features.groups[gi].items, from, to))}
                  onRemove={() => set((d) => d.features.groups[gi].items.splice(j, 1))}
                />
              </div>
            ))}
          </div>

          <AddButton
            label="feature"
            onAdd={() => set((d) => d.features.groups[gi].items.push({ title: "New feature", desc: "Short description." }))}
          />

          {isLast && (
            <AddButton label="feature group" onAdd={() => set((d) => d.features.groups.push(newGroup()))} />
          )}
        </>
      )}
    </PageFrame>
  );
}
