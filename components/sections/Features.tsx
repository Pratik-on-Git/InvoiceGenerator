"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import type { FeatureGroup } from "@/lib/types";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { AutoPaginatedSection, type PaginatedSectionProps } from "../AutoPaginatedSection";

const newGroup = (): FeatureGroup => ({
  tag: "Group",
  title: "New Group",
  range: "",
  items: [{ title: "New feature", desc: "Short description." }],
});

export function Features({
  startPage,
  total,
  onPageCountChange,
  gi,
}: PaginatedSectionProps & { gi: number }) {
  const { inv, set } = useInvoice();
  const f = inv.features;
  const empty = gi < 0 || !f.groups[gi];
  const group = empty ? undefined : f.groups[gi];
  const rowCount = Math.ceil((group?.items.length ?? 0) / 2);
  const offset = empty ? 0 : f.groups.slice(0, gi).reduce((sum, item) => sum + item.items.length, 0);
  const isLastGroup = empty || gi === f.groups.length - 1;

  return (
    <AutoPaginatedSection
      itemCount={rowCount}
      layoutKey={JSON.stringify({ num: f.num, title: f.title, lead: f.lead, group })}
      startPage={startPage}
      total={total}
      onPageCountChange={onPageCountChange}
      renderPage={(rowIndexes, pageIndex, isLastPage) => {
        const itemIndexes = rowIndexes.flatMap((row) => [row * 2, row * 2 + 1]).filter((i) => i < (group?.items.length ?? 0));
        const firstSectionPage = gi <= 0 && pageIndex === 0;
        return (
          <>
            <Editable as="div" className="sec-num" value={f.num} onCommit={(v) => set((d) => (d.features.num = v))} />
            {firstSectionPage ? (
              <Editable as="div" className="sec-title" value={f.title} onCommit={(v) => set((d) => (d.features.title = v))} />
            ) : (
              <div className="sec-title">
                <Editable as="span" value={f.title} onCommit={(v) => set((d) => (d.features.title = v))} />{" "}
                <span className="muted">— continued</span>
              </div>
            )}
            <div className="sec-rule" />
            {firstSectionPage && <Editable as="p" rich className="lead" value={f.lead} onCommit={(v) => set((d) => (d.features.lead = v))} />}

            {empty ? (
              <div className="empty-section">
                <p className="lead">No feature groups yet.</p>
                <AddButton label="feature group" onAdd={() => set((d) => d.features.groups.push(newGroup()))} />
              </div>
            ) : (
              <>
                <div className="group-head rowwrap feature-group-head">
                  <Editable as="span" className="g-tag" value={group!.tag} onCommit={(v) => set((d) => (d.features.groups[gi].tag = v))} />
                  <Editable as="span" className="g-title" value={group!.title} onCommit={(v) => set((d) => (d.features.groups[gi].title = v))} />
                  <span className="g-line" />
                  <Editable as="span" className="g-count" value={group!.range} placeholder="range" onCommit={(v) => set((d) => (d.features.groups[gi].range = v))} />
                  {pageIndex === 0 && (
                    <ItemControls
                      index={gi}
                      count={f.groups.length}
                      onMove={(from, to) => set((d) => move(d.features.groups, from, to))}
                      onRemove={() => set((d) => d.features.groups.splice(gi, 1))}
                    />
                  )}
                </div>

                {itemIndexes.length > 0 && (
                  <div className="feat-grid">
                    {itemIndexes.map((j) => {
                      const item = group!.items[j];
                      return (
                        <div className="feat rowwrap" key={j}>
                          <div className="f-n">{offset + j + 1}</div>
                          <div className="f-body">
                            <Editable as="div" className="f-t" value={item.title} onCommit={(v) => set((d) => (d.features.groups[gi].items[j].title = v))} />
                            <Editable as="div" className="f-d" value={item.desc} onCommit={(v) => set((d) => (d.features.groups[gi].items[j].desc = v))} />
                          </div>
                          <ItemControls
                            index={j}
                            count={group!.items.length}
                            onMove={(from, to) => set((d) => move(d.features.groups[gi].items, from, to))}
                            onRemove={() => set((d) => d.features.groups[gi].items.splice(j, 1))}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {isLastPage && (
                  <>
                    <AddButton label="feature" onAdd={() => set((d) => d.features.groups[gi].items.push({ title: "New feature", desc: "Short description." }))} />
                    {isLastGroup && <AddButton label="feature group" onAdd={() => set((d) => d.features.groups.push(newGroup()))} />}
                  </>
                )}
              </>
            )}
          </>
        );
      }}
    />
  );
}
