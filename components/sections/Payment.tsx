"use client";

import { useInvoice } from "@/lib/state";
import type { KV } from "@/lib/types";
import { move } from "@/lib/list";
import { Editable } from "../Editable";
import { AddButton, RemoveButton } from "../Controls";
import { ItemControls } from "../ItemControls";
import { PageFrame } from "../PageFrame";

export function Payment({ pageNo, total }: { pageNo: number; total: number }) {
  const { inv, set } = useInvoice();
  const p = inv.payment;

  const kvList = (
    rows: KV[],
    path: "bank" | "contact",
    dark?: boolean
  ) => (
    <>
      {rows.map((row, i) => (
        <div className="kv rowwrap" key={i}>
          <Editable as="span" className="k" value={row.k} onCommit={(v) => set((d) => (d.payment[path][i].k = v))} />
          <Editable as="span" className="v" value={row.v} onCommit={(v) => set((d) => (d.payment[path][i].v = v))} />
          <RemoveButton onRemove={() => set((d) => d.payment[path].splice(i, 1))} />
        </div>
      ))}
      <AddButton inline label="row" onAdd={() => set((d) => d.payment[path].push({ k: "Label", v: "Value" }))} />
    </>
  );

  return (
    <PageFrame pageNo={pageNo} total={total}>
      <Editable as="div" className="sec-num" value={p.num} onCommit={(v) => set((d) => (d.payment.num = v))} />
      <Editable as="div" className="sec-title" value={p.title} onCommit={(v) => set((d) => (d.payment.title = v))} />
      <div className="sec-rule" />

      <div className="pay-grid">
        <div className="pay-card">
          <Editable as="div" className="label pc-label" value={p.bankLabel} onCommit={(v) => set((d) => (d.payment.bankLabel = v))} />
          {kvList(p.bank, "bank")}
        </div>
        <div className="pay-card dark">
          <Editable as="div" className="label pc-label" value={p.contactLabel} onCommit={(v) => set((d) => (d.payment.contactLabel = v))} />
          <div className="pay-person">
            <Editable as="div" className="pp-name" value={p.personName} onCommit={(v) => set((d) => (d.payment.personName = v))} />
            <Editable as="div" className="pp-role" value={p.personRole} onCommit={(v) => set((d) => (d.payment.personRole = v))} />
          </div>
          {kvList(p.contact, "contact", true)}
        </div>
      </div>

      <div className="group-head" style={{ marginTop: "9mm" }}>
        <Editable as="span" className="g-tag" value={p.signTag} onCommit={(v) => set((d) => (d.payment.signTag = v))} />
        <Editable as="span" className="g-title" value={p.signTitle} onCommit={(v) => set((d) => (d.payment.signTitle = v))} />
        <span className="g-line" />
      </div>
      <Editable as="p" className="lead" style={{ marginTop: "-2mm" }} value={p.signLead} onCommit={(v) => set((d) => (d.payment.signLead = v))} />

      <div className="sign-grid">
        {p.signs.map((sg, i) => (
          <div className="sign rowwrap" key={i}>
            <ItemControls
              index={i}
              count={p.signs.length}
              onMove={(from, to) => set((d) => move(d.payment.signs, from, to))}
              onRemove={() => set((d) => d.payment.signs.splice(i, 1))}
            />
            <Editable as="div" className="s-name" value={sg.name} onCommit={(v) => set((d) => (d.payment.signs[i].name = v))} />
            <Editable as="div" className="s-role" value={sg.role} onCommit={(v) => set((d) => (d.payment.signs[i].role = v))} />
            <div className="s-box" />
            <div className="s-cap">Signature &amp; Date</div>
          </div>
        ))}
      </div>
      {p.signs.length < 2 && (
        <AddButton label="signatory" onAdd={() => set((d) => d.payment.signs.push({ name: "Name", role: "Role" }))} />
      )}

      <div className="thanks">
        <div className="t-big">
          <Editable as="span" value={p.thanksA} onCommit={(v) => set((d) => (d.payment.thanksA = v))} />{" "}
          <Editable as="span" className="blue" value={p.thanksB} onCommit={(v) => set((d) => (d.payment.thanksB = v))} />
        </div>
        <Editable as="div" className="t-sub" value={p.thanksSub} onCommit={(v) => set((d) => (d.payment.thanksSub = v))} />
      </div>
    </PageFrame>
  );
}
