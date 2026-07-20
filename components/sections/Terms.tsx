"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { AutoPaginatedSection, type PaginatedSectionProps } from "../AutoPaginatedSection";

type Block =
  | { kind: "term"; index: number }
  | { kind: "terms-empty" }
  | { kind: "milestones"; indexes: number[] }
  | { kind: "stats" };

export function Terms({ startPage, total, onPageCountChange }: PaginatedSectionProps) {
  const { inv, set } = useInvoice();
  const t = inv.terms;
  const blocks: Block[] = t.items.length > 0
    ? t.items.map((_, index) => ({ kind: "term" as const, index }))
    : [{ kind: "terms-empty" }];

  if (t.milestones.length === 0) blocks.push({ kind: "milestones", indexes: [] });
  for (let i = 0; i < t.milestones.length; i += 2) {
    blocks.push({ kind: "milestones", indexes: [i, i + 1].filter((index) => index < t.milestones.length) });
  }
  blocks.push({ kind: "stats" });

  return (
    <AutoPaginatedSection
      itemCount={blocks.length}
      layoutKey={JSON.stringify(t)}
      startPage={startPage}
      total={total}
      onPageCountChange={onPageCountChange}
      renderPage={(blockIndexes, pageIndex) => {
        const selected = blockIndexes.map((index) => blocks[index]).filter(Boolean);
        const terms = selected.filter((block): block is Extract<Block, { kind: "term" }> => block.kind === "term");
        const termsEmpty = selected.some((block) => block.kind === "terms-empty");
        const milestoneBlocks = selected.filter((block): block is Extract<Block, { kind: "milestones" }> => block.kind === "milestones");
        const showStats = selected.some((block) => block.kind === "stats");
        const showTermAdd = termsEmpty || terms.some((block) => block.index === t.items.length - 1);
        const milestoneIndexes = milestoneBlocks.flatMap((block) => block.indexes);
        const showMilestoneAdd = milestoneBlocks.some((block) => block.indexes.length === 0 || block.indexes.includes(t.milestones.length - 1));

        return (
          <>
            <Editable as="div" className="sec-num" value={t.num} onCommit={(v) => set((d) => (d.terms.num = v))} />
            {pageIndex === 0 ? (
              <Editable as="div" className="sec-title" value={t.title} onCommit={(v) => set((d) => (d.terms.title = v))} />
            ) : (
              <div className="sec-title">
                <Editable as="span" value={t.title} onCommit={(v) => set((d) => (d.terms.title = v))} />{" "}
                <span className="muted">— continued</span>
              </div>
            )}
            <div className="sec-rule" />

            {(terms.length > 0 || termsEmpty) && (
              <>
                {terms.length > 0 && (
                  <ul className="term-list">
                    {terms.map(({ index: i }) => (
                      <li className="rowwrap" key={i}>
                        <Editable as="span" rich value={t.items[i]} onCommit={(v) => set((d) => (d.terms.items[i] = v))} />
                        <ItemControls
                          index={i}
                          count={t.items.length}
                          onMove={(from, to) => set((d) => move(d.terms.items, from, to))}
                          onRemove={() => set((d) => d.terms.items.splice(i, 1))}
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {showTermAdd && <AddButton label="term" onAdd={() => set((d) => d.terms.items.push("<b>New term —</b> description."))} />}
              </>
            )}

            {milestoneBlocks.length > 0 && (
              <>
                <div className="group-head content-group-head">
                  <Editable as="span" className="g-tag" value={t.mileTag} onCommit={(v) => set((d) => (d.terms.mileTag = v))} />
                  <Editable as="span" className="g-title" value={t.mileTitle} onCommit={(v) => set((d) => (d.terms.mileTitle = v))} />
                  <span className="g-line" />
                </div>
                {milestoneIndexes.length > 0 && (
                  <div className="two-col">
                    {milestoneIndexes.map((i) => {
                      const milestone = t.milestones[i];
                      return (
                        <div className="mile-card rowwrap" key={i}>
                          <ItemControls
                            index={i}
                            count={t.milestones.length}
                            onMove={(from, to) => set((d) => move(d.terms.milestones, from, to))}
                            onRemove={() => set((d) => d.terms.milestones.splice(i, 1))}
                          />
                          <div className="mc-h">
                            <div className="mc-badge"><Editable as="span" value={milestone.n} onCommit={(v) => set((d) => (d.terms.milestones[i].n = v))} /></div>
                            <Editable as="div" className="mc-t" value={milestone.title} onCommit={(v) => set((d) => (d.terms.milestones[i].title = v))} />
                          </div>
                          <Editable as="div" className="mc-pct" value={milestone.pct} onCommit={(v) => set((d) => (d.terms.milestones[i].pct = v))} />
                          <Editable as="div" className="mc-d" value={milestone.desc} onCommit={(v) => set((d) => (d.terms.milestones[i].desc = v))} />
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
              </>
            )}

            {showStats && (
              <>
                {t.stats.length > 0 && (
                  <div className="stat-band">
                    {t.stats.map((stat, i) => (
                      <div className="stat rowwrap" key={i}>
                        <ItemControls
                          index={i}
                          count={t.stats.length}
                          onMove={(from, to) => set((d) => move(d.terms.stats, from, to))}
                          onRemove={() => set((d) => d.terms.stats.splice(i, 1))}
                        />
                        <Editable as="div" className="s-k" value={stat.k} onCommit={(v) => set((d) => (d.terms.stats[i].k = v))} />
                        <Editable as="div" rich className="s-v" value={stat.v} onCommit={(v) => set((d) => (d.terms.stats[i].v = v))} />
                        <Editable as="div" className="s-sub" value={stat.sub} onCommit={(v) => set((d) => (d.terms.stats[i].sub = v))} />
                      </div>
                    ))}
                  </div>
                )}
                {t.stats.length < 3 && <AddButton label="stat" onAdd={() => set((d) => d.terms.stats.push({ k: "Label", v: "Value", sub: "Sub-label" }))} />}
              </>
            )}
          </>
        );
      }}
    />
  );
}
