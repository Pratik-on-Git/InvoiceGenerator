"use client";

import { useInvoice } from "@/lib/state";
import { groupIN, money, digits } from "@/lib/format";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { AutoPaginatedSection, type PaginatedSectionProps } from "../AutoPaginatedSection";

export function Cover({ startPage, total, onPageCountChange }: PaginatedSectionProps) {
  const { inv, set } = useInvoice();
  const sum = inv.invest.items.reduce((s, i) => s + i.amount, 0);
  const layoutKey = JSON.stringify({
    brand: inv.brand,
    cover: inv.cover,
    provider: inv.provider,
    client: inv.client,
    invest: inv.invest,
    currency: inv.meta.currency,
  });

  return (
    <AutoPaginatedSection
      itemCount={inv.invest.items.length}
      layoutKey={layoutKey}
      startPage={startPage}
      total={total}
      onPageCountChange={onPageCountChange}
      renderPage={(itemIndexes, pageIndex, isLast) => (
        <>
          {pageIndex === 0 ? (
            <>
              <div className="cover-top">
                <div className="brand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inv.brand.logo} alt={inv.brand.name} />
                  <div>
                    <Editable as="div" className="bname" value={inv.brand.name} onCommit={(v) => set((d) => (d.brand.name = v))} />
                    <Editable as="div" className="btag" value={inv.brand.tagline} onCommit={(v) => set((d) => (d.brand.tagline = v))} />
                  </div>
                </div>
                <div className="cover-meta">
                  <div className="m-row">
                    <Editable as="div" className="m-k" value={inv.meta.docNoLabel} onCommit={(v) => set((d) => (d.meta.docNoLabel = v))} />
                    <Editable as="div" className="m-v" value={inv.meta.docNo} onCommit={(v) => set((d) => (d.meta.docNo = v))} />
                  </div>
                  <div className="m-row">
                    <Editable as="div" className="m-k" value={inv.meta.dateLabel} onCommit={(v) => set((d) => (d.meta.dateLabel = v))} />
                    <Editable as="div" className="m-v" value={inv.meta.date} onCommit={(v) => set((d) => (d.meta.date = v))} />
                  </div>
                </div>
              </div>

              <div className="cover-title-wrap">
                <Editable as="span" className="eyebrow" value={inv.cover.eyebrow} onCommit={(v) => set((d) => (d.cover.eyebrow = v))} />
                <div className="cover-title">
                  <Editable as="span" value={inv.cover.titleA} onCommit={(v) => set((d) => (d.cover.titleA = v))} />{" "}
                  <Editable as="span" className="blue" value={inv.cover.titleB} onCommit={(v) => set((d) => (d.cover.titleB = v))} />
                </div>
                <Editable as="div" className="cover-sub" value={inv.cover.sub} onCommit={(v) => set((d) => (d.cover.sub = v))} />
              </div>

              <div className="parties">
                {(["provider", "client"] as const).map((key) => {
                  const party = inv[key];
                  return (
                    <div className="party" key={key}>
                      <Editable as="div" className="label" value={party.label} onCommit={(v) => set((d) => (d[key].label = v))} />
                      <Editable as="div" className="p-name" value={party.name} onCommit={(v) => set((d) => (d[key].name = v))} />
                      <div className="p-lines">
                        {party.lines.map((line, i) => (
                          <div className="rowwrap" key={i}>
                            <Editable as="div" className={i === 0 ? "strong" : undefined} value={line} onCommit={(v) => set((d) => (d[key].lines[i] = v))} />
                            <RemoveButton onRemove={() => set((d) => d[key].lines.splice(i, 1))} />
                          </div>
                        ))}
                        <AddButton inline label="line" onAdd={() => set((d) => d[key].lines.push("New line"))} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <Editable as="div" className="sec-num" value={inv.cover.eyebrow} onCommit={(v) => set((d) => (d.cover.eyebrow = v))} />
              <div className="sec-title">
                <Editable as="span" value={inv.invest.title} onCommit={(v) => set((d) => (d.invest.title = v))} />{" "}
                <span className="muted">— continued</span>
              </div>
              <div className="sec-rule" />
            </>
          )}

          <div className="invest">
            <div className="invest-head">
              <Editable as="span" className="h-l" value={inv.invest.title} onCommit={(v) => set((d) => (d.invest.title = v))} />
              <Editable as="span" className="h-r" value={inv.invest.note} onCommit={(v) => set((d) => (d.invest.note = v))} />
            </div>
            <div className="inv-col-head">
              <span>Item</span><span>Pages</span><span>Unit</span><span>Total</span>
            </div>
            {itemIndexes.map((i) => {
              const it = inv.invest.items[i];
              if (!it) return null;
              return (
                <div className="inv-row rowwrap" key={i}>
                  <div className="c-item">
                    <Editable as="span" value={it.name} onCommit={(v) => set((d) => (d.invest.items[i].name = v))} />
                    <Editable as="small" value={it.desc} onCommit={(v) => set((d) => (d.invest.items[i].desc = v))} />
                  </div>
                  <Editable as="div" className="c-q" value={it.qty} onCommit={(v) => set((d) => (d.invest.items[i].qty = v))} />
                  <Editable as="div" className="c-u" value={it.unit} onCommit={(v) => set((d) => (d.invest.items[i].unit = v))} />
                  <div className="c-t">
                    {inv.meta.currency}<Editable as="span" numeric value={groupIN(it.amount)} onCommit={(v) => set((d) => (d.invest.items[i].amount = digits(v)))} />
                  </div>
                  <ItemControls
                    index={i}
                    count={inv.invest.items.length}
                    onMove={(from, to) => set((d) => move(d.invest.items, from, to))}
                    onRemove={() => set((d) => d.invest.items.splice(i, 1))}
                  />
                </div>
              );
            })}
            {isLast && (
              <>
                <AddButton
                  label="line item"
                  onAdd={() => set((d) => d.invest.items.push({ name: "New item", desc: "Description", qty: "—", unit: "—", amount: 0 }))}
                />
                <div className="inv-total">
                  <div className="t-l">
                    <Editable as="span" value={inv.invest.totalLabel} onCommit={(v) => set((d) => (d.invest.totalLabel = v))} />
                    <Editable as="small" value={inv.invest.totalNote} onCommit={(v) => set((d) => (d.invest.totalNote = v))} />
                  </div>
                  <div className="t-r">{money(sum, inv.meta.currency)}</div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    />
  );
}
