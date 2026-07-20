"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { AutoPaginatedSection, type PaginatedSectionProps } from "../AutoPaginatedSection";

type Block =
  | { kind: "payment"; index: number }
  | { kind: "signatures"; indexes: number[] }
  | { kind: "thanks" };

export function Payment({ startPage, total, onPageCountChange }: PaginatedSectionProps) {
  const { inv, set } = useInvoice();
  const p = inv.payment;
  const paymentRows = Math.max(p.bank.length, p.contact.length, 1);
  const blocks: Block[] = Array.from({ length: paymentRows }, (_, index) => ({ kind: "payment" as const, index }));

  if (p.signs.length === 0) blocks.push({ kind: "signatures", indexes: [] });
  for (let i = 0; i < p.signs.length; i += 2) {
    blocks.push({ kind: "signatures", indexes: [i, i + 1].filter((index) => index < p.signs.length) });
  }
  blocks.push({ kind: "thanks" });

  return (
    <AutoPaginatedSection
      itemCount={blocks.length}
      layoutKey={JSON.stringify(p)}
      startPage={startPage}
      total={total}
      onPageCountChange={onPageCountChange}
      renderPage={(blockIndexes, pageIndex) => {
        const selected = blockIndexes.map((index) => blocks[index]).filter(Boolean);
        const paymentIndexes = selected
          .filter((block): block is Extract<Block, { kind: "payment" }> => block.kind === "payment")
          .map((block) => block.index);
        const signatureBlocks = selected.filter((block): block is Extract<Block, { kind: "signatures" }> => block.kind === "signatures");
        const signatureIndexes = signatureBlocks.flatMap((block) => block.indexes);
        const showThanks = selected.some((block) => block.kind === "thanks");
        const showBankAdd = paymentIndexes.includes(Math.max(p.bank.length - 1, 0));
        const showContactAdd = paymentIndexes.includes(Math.max(p.contact.length - 1, 0));
        const showSignAdd = signatureBlocks.some((block) => block.indexes.length === 0 || block.indexes.includes(p.signs.length - 1));

        return (
          <>
            <Editable as="div" className="sec-num" value={p.num} onCommit={(v) => set((d) => (d.payment.num = v))} />
            {pageIndex === 0 ? (
              <Editable as="div" className="sec-title" value={p.title} onCommit={(v) => set((d) => (d.payment.title = v))} />
            ) : (
              <div className="sec-title">
                <Editable as="span" value={p.title} onCommit={(v) => set((d) => (d.payment.title = v))} />{" "}
                <span className="muted">— continued</span>
              </div>
            )}
            <div className="sec-rule" />

            {paymentIndexes.length > 0 && (
              <div className="pay-grid">
                <div className="pay-card">
                  <Editable as="div" className="label pc-label" value={p.bankLabel} onCommit={(v) => set((d) => (d.payment.bankLabel = v))} />
                  {paymentIndexes.map((i) => {
                    const row = p.bank[i];
                    if (!row) return null;
                    return (
                      <div className="kv rowwrap" key={i}>
                        <Editable as="span" className="k" value={row.k} onCommit={(v) => set((d) => (d.payment.bank[i].k = v))} />
                        <Editable as="span" className="v" value={row.v} onCommit={(v) => set((d) => (d.payment.bank[i].v = v))} />
                        <RemoveButton onRemove={() => set((d) => d.payment.bank.splice(i, 1))} />
                      </div>
                    );
                  })}
                  {showBankAdd && <AddButton inline label="row" onAdd={() => set((d) => d.payment.bank.push({ k: "Label", v: "Value" }))} />}
                </div>
                <div className="pay-card dark">
                  <Editable as="div" className="label pc-label" value={p.contactLabel} onCommit={(v) => set((d) => (d.payment.contactLabel = v))} />
                  <div className="pay-person">
                    <Editable as="div" className="pp-name" value={p.personName} onCommit={(v) => set((d) => (d.payment.personName = v))} />
                    <Editable as="div" className="pp-role" value={p.personRole} onCommit={(v) => set((d) => (d.payment.personRole = v))} />
                  </div>
                  {paymentIndexes.map((i) => {
                    const row = p.contact[i];
                    if (!row) return null;
                    return (
                      <div className="kv rowwrap" key={i}>
                        <Editable as="span" className="k" value={row.k} onCommit={(v) => set((d) => (d.payment.contact[i].k = v))} />
                        <Editable as="span" className="v" value={row.v} onCommit={(v) => set((d) => (d.payment.contact[i].v = v))} />
                        <RemoveButton onRemove={() => set((d) => d.payment.contact.splice(i, 1))} />
                      </div>
                    );
                  })}
                  {showContactAdd && <AddButton inline label="row" onAdd={() => set((d) => d.payment.contact.push({ k: "Label", v: "Value" }))} />}
                </div>
              </div>
            )}

            {signatureBlocks.length > 0 && (
              <>
                <div className="group-head content-group-head">
                  <Editable as="span" className="g-tag" value={p.signTag} onCommit={(v) => set((d) => (d.payment.signTag = v))} />
                  <Editable as="span" className="g-title" value={p.signTitle} onCommit={(v) => set((d) => (d.payment.signTitle = v))} />
                  <span className="g-line" />
                </div>
                <Editable as="p" className="lead sign-lead" value={p.signLead} onCommit={(v) => set((d) => (d.payment.signLead = v))} />
                {signatureIndexes.length > 0 && (
                  <div className="sign-grid">
                    {signatureIndexes.map((i) => {
                      const signature = p.signs[i];
                      return (
                        <div className="sign rowwrap" key={i}>
                          <ItemControls
                            index={i}
                            count={p.signs.length}
                            onMove={(from, to) => set((d) => move(d.payment.signs, from, to))}
                            onRemove={() => set((d) => d.payment.signs.splice(i, 1))}
                          />
                          <Editable as="div" className="s-name" value={signature.name} onCommit={(v) => set((d) => (d.payment.signs[i].name = v))} />
                          <Editable as="div" className="s-role" value={signature.role} onCommit={(v) => set((d) => (d.payment.signs[i].role = v))} />
                          <div className="s-box" />
                          <div className="s-cap">Signature &amp; Date</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {showSignAdd && p.signs.length < 2 && <AddButton label="signatory" onAdd={() => set((d) => d.payment.signs.push({ name: "Name", role: "Role" }))} />}
              </>
            )}

            {showThanks && (
              <div className="thanks">
                <div className="t-big">
                  <Editable as="span" value={p.thanksA} onCommit={(v) => set((d) => (d.payment.thanksA = v))} />{" "}
                  <Editable as="span" className="blue" value={p.thanksB} onCommit={(v) => set((d) => (d.payment.thanksB = v))} />
                </div>
                <Editable as="div" className="t-sub" value={p.thanksSub} onCommit={(v) => set((d) => (d.payment.thanksSub = v))} />
              </div>
            )}
          </>
        );
      }}
    />
  );
}
