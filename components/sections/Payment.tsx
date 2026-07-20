"use client";

import { useInvoice } from "@/lib/state";
import { move } from "@/lib/list";
import { flowBlockKey, type FlowBlock } from "@/lib/pagination";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import type { SectionSliceProps } from "./types";

type PaymentRowBlock = Extract<FlowBlock, { kind: "payment-row" }>;
type SignatureBlock = Extract<FlowBlock, { kind: "signature" }>;

export function PaymentSlice({ blocks, continued }: SectionSliceProps) {
  const { inv, set } = useInvoice();
  const payment = inv.payment;
  const rowBlocks = blocks.filter((block): block is PaymentRowBlock => block.kind === "payment-row");
  const signatureBlocks = blocks.filter((block): block is SignatureBlock => block.kind === "signature");
  const signaturesEmptyBlock = blocks.find((block) => block.kind === "signatures-empty");
  const thanksBlock = blocks.find((block) => block.kind === "thanks");
  const emptyPaymentBlock = payment.bank.length === 0 && payment.contact.length === 0 ? rowBlocks[0] : undefined;
  const showBankAdd = rowBlocks.some((block) => block.index === Math.max(payment.bank.length - 1, 0));
  const showContactAdd = rowBlocks.some((block) => block.index === Math.max(payment.contact.length - 1, 0));
  const showSignAdd = Boolean(signaturesEmptyBlock) || signatureBlocks.some((block) => block.index === payment.signs.length - 1);

  return (
    <section className="flow-section">
      <Editable as="div" className="sec-num" value={payment.num} onCommit={(v) => set((d) => (d.payment.num = v))} />
      {!continued ? (
        <Editable as="div" className="sec-title" value={payment.title} onCommit={(v) => set((d) => (d.payment.title = v))} />
      ) : (
        <div className="sec-title">
          <Editable as="span" value={payment.title} onCommit={(v) => set((d) => (d.payment.title = v))} />{" "}
          <span className="muted">— continued</span>
        </div>
      )}
      <div className="sec-rule" />

      {rowBlocks.length > 0 && (
        <div className="pay-grid" data-flow-key={emptyPaymentBlock ? flowBlockKey(emptyPaymentBlock) : undefined}>
          <div className="pay-card">
            <Editable as="div" className="label pc-label" value={payment.bankLabel} onCommit={(v) => set((d) => (d.payment.bankLabel = v))} />
            {rowBlocks.map((block) => {
              const { index } = block;
              const row = payment.bank[index];
              if (!row) return null;
              return (
                <div className="kv rowwrap" data-flow-key={flowBlockKey(block)} key={index}>
                  <Editable as="span" className="k" value={row.k} onCommit={(v) => set((d) => (d.payment.bank[index].k = v))} />
                  <Editable as="span" className="v" value={row.v} onCommit={(v) => set((d) => (d.payment.bank[index].v = v))} />
                  <RemoveButton onRemove={() => set((d) => d.payment.bank.splice(index, 1))} />
                </div>
              );
            })}
            {showBankAdd && <AddButton inline label="row" onAdd={() => set((d) => d.payment.bank.push({ k: "Label", v: "Value" }))} />}
          </div>
          <div className="pay-card dark">
            <Editable as="div" className="label pc-label" value={payment.contactLabel} onCommit={(v) => set((d) => (d.payment.contactLabel = v))} />
            <div className="pay-person">
              <Editable as="div" className="pp-name" value={payment.personName} onCommit={(v) => set((d) => (d.payment.personName = v))} />
              <Editable as="div" className="pp-role" value={payment.personRole} onCommit={(v) => set((d) => (d.payment.personRole = v))} />
            </div>
            {rowBlocks.map((block) => {
              const { index } = block;
              const row = payment.contact[index];
              if (!row) return null;
              return (
                <div className="kv rowwrap" data-flow-key={flowBlockKey(block)} key={index}>
                  <Editable as="span" className="k" value={row.k} onCommit={(v) => set((d) => (d.payment.contact[index].k = v))} />
                  <Editable as="span" className="v" value={row.v} onCommit={(v) => set((d) => (d.payment.contact[index].v = v))} />
                  <RemoveButton onRemove={() => set((d) => d.payment.contact.splice(index, 1))} />
                </div>
              );
            })}
            {showContactAdd && <AddButton inline label="row" onAdd={() => set((d) => d.payment.contact.push({ k: "Label", v: "Value" }))} />}
          </div>
        </div>
      )}

      {(signatureBlocks.length > 0 || signaturesEmptyBlock) && (
        <div
          className={signaturesEmptyBlock ? "flow-atomic" : undefined}
          data-flow-key={signaturesEmptyBlock ? flowBlockKey(signaturesEmptyBlock) : undefined}
        >
          <div className="group-head content-group-head">
            <Editable as="span" className="g-tag" value={payment.signTag} onCommit={(v) => set((d) => (d.payment.signTag = v))} />
            <Editable as="span" className="g-title" value={payment.signTitle} onCommit={(v) => set((d) => (d.payment.signTitle = v))} />
            <span className="g-line" />
          </div>
          <Editable as="p" className="lead sign-lead" value={payment.signLead} onCommit={(v) => set((d) => (d.payment.signLead = v))} />
          {signatureBlocks.length > 0 && (
            <div className="sign-grid">
              {signatureBlocks.map((block) => {
                const { index } = block;
                const signature = payment.signs[index];
                if (!signature) return null;
                return (
                  <div className="sign rowwrap" data-flow-key={flowBlockKey(block)} key={index}>
                    <ItemControls
                      index={index}
                      count={payment.signs.length}
                      onMove={(from, to) => set((d) => move(d.payment.signs, from, to))}
                      onRemove={() => set((d) => d.payment.signs.splice(index, 1))}
                    />
                    <Editable as="div" className="s-name" value={signature.name} onCommit={(v) => set((d) => (d.payment.signs[index].name = v))} />
                    <Editable as="div" className="s-role" value={signature.role} onCommit={(v) => set((d) => (d.payment.signs[index].role = v))} />
                    <div className="s-box" />
                    <div className="s-cap">Signature &amp; Date</div>
                  </div>
                );
              })}
            </div>
          )}
          {showSignAdd && payment.signs.length < 2 && <AddButton label="signatory" onAdd={() => set((d) => d.payment.signs.push({ name: "Name", role: "Role" }))} />}
        </div>
      )}

      {thanksBlock && (
        <div className="thanks" data-flow-key={flowBlockKey(thanksBlock)}>
          <div className="t-big">
            <Editable as="span" value={payment.thanksA} onCommit={(v) => set((d) => (d.payment.thanksA = v))} />{" "}
            <Editable as="span" className="blue" value={payment.thanksB} onCommit={(v) => set((d) => (d.payment.thanksB = v))} />
          </div>
          <Editable as="div" className="t-sub" value={payment.thanksSub} onCommit={(v) => set((d) => (d.payment.thanksSub = v))} />
        </div>
      )}
    </section>
  );
}
