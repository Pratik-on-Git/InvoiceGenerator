"use client";

import { type ReactNode } from "react";
import { PlusIcon, SquarePenIcon, Trash2Icon, XIcon } from "lucide-react";

import { useInvoice } from "@/lib/state";
import { money } from "@/lib/format";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sectionTriggerClass } from "./SidebarSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * A form-based editing surface for the most commonly edited quotation fields —
 * document meta, cover, the two parties (Prepared By / Billed To), and the
 * investment breakdown (line items → total → advance).
 *
 * Every input reads from `inv` and writes through `set`, and the printed
 * document reads from the same `inv`, so edits flow live in both directions:
 * type here and the page updates; edit the page inline and these fields reflect
 * it the next time they render.
 */
export function DetailsSheet() {
  const { inv, set } = useInvoice();
  const total = inv.invest.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Sheet>
      <SheetTrigger className={sectionTriggerClass}>
        <span className="flex min-w-0 items-center gap-2">
          <SquarePenIcon className="size-4 shrink-0" />
          <span className="truncate">Edit Details</span>
        </span>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Edit Details</SheetTitle>
          <SheetDescription>
            Changes sync live with the document — and inline edits on the page flow back here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
          {/* -------- Document -------- */}
          <Section title="Document">
            <div className="grid grid-cols-2 gap-3">
              <Field label={inv.meta.docNoLabel || "Document No."}>
                <Input
                  value={inv.meta.docNo}
                  onChange={(e) => set((d) => (d.meta.docNo = e.target.value))}
                />
              </Field>
              <Field label={inv.meta.dateLabel || "Date"}>
                <Input value={inv.meta.date} onChange={(e) => set((d) => (d.meta.date = e.target.value))} />
              </Field>
            </div>
            <Field label="Currency symbol">
              <Input
                className="w-24"
                value={inv.meta.currency}
                onChange={(e) => set((d) => (d.meta.currency = e.target.value))}
              />
            </Field>
          </Section>

          {/* -------- Cover -------- */}
          <Section title="Cover">
            <Field label="Eyebrow">
              <Input value={inv.cover.eyebrow} onChange={(e) => set((d) => (d.cover.eyebrow = e.target.value))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title line 1">
                <Input value={inv.cover.titleA} onChange={(e) => set((d) => (d.cover.titleA = e.target.value))} />
              </Field>
              <Field label="Title line 2">
                <Input value={inv.cover.titleB} onChange={(e) => set((d) => (d.cover.titleB = e.target.value))} />
              </Field>
            </div>
            <Field label="Subtitle">
              <Input value={inv.cover.sub} onChange={(e) => set((d) => (d.cover.sub = e.target.value))} />
            </Field>
          </Section>

          {/* -------- Prepared By -------- */}
          <Section title="Prepared By">
            <div className="grid grid-cols-[1fr_1.4fr] gap-3">
              <Field label="Label">
                <Input value={inv.provider.label} onChange={(e) => set((d) => (d.provider.label = e.target.value))} />
              </Field>
              <Field label="Name">
                <Input value={inv.provider.name} onChange={(e) => set((d) => (d.provider.name = e.target.value))} />
              </Field>
            </div>
            <Field label="Detail lines">
              <Lines
                lines={inv.provider.lines}
                onChange={(i, v) => set((d) => (d.provider.lines[i] = v))}
                onAdd={() => set((d) => d.provider.lines.push("New line"))}
                onRemove={(i) => set((d) => d.provider.lines.splice(i, 1))}
              />
            </Field>
          </Section>

          {/* -------- Billed To (client) -------- */}
          <Section title="Billed To">
            <div className="grid grid-cols-[1fr_1.4fr] gap-3">
              <Field label="Label">
                <Input value={inv.client.label} onChange={(e) => set((d) => (d.client.label = e.target.value))} />
              </Field>
              <Field label="Client name">
                <Input value={inv.client.name} onChange={(e) => set((d) => (d.client.name = e.target.value))} />
              </Field>
            </div>
            <Field label="Detail lines">
              <Lines
                lines={inv.client.lines}
                onChange={(i, v) => set((d) => (d.client.lines[i] = v))}
                onAdd={() => set((d) => d.client.lines.push("New line"))}
                onRemove={(i) => set((d) => d.client.lines.splice(i, 1))}
              />
            </Field>
          </Section>

          {/* -------- Investment / amount bifurcation -------- */}
          <Section title="Investment Breakdown">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Section title">
                <Input value={inv.invest.title} onChange={(e) => set((d) => (d.invest.title = e.target.value))} />
              </Field>
              <Field label="Note">
                <Input value={inv.invest.note} onChange={(e) => set((d) => (d.invest.note = e.target.value))} />
              </Field>
            </div>

            <div className="grid gap-3">
              {inv.invest.items.map((item, i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Line item {i + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove line item ${i + 1}`}
                      disabled={inv.invest.items.length === 1}
                      onClick={() => set((d) => d.invest.items.splice(i, 1))}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  <Field label="Name">
                    <Input
                      value={item.name}
                      onChange={(e) => set((d) => (d.invest.items[i].name = e.target.value))}
                    />
                  </Field>
                  <Field label="Description">
                    <Input
                      value={item.desc}
                      onChange={(e) => set((d) => (d.invest.items[i].desc = e.target.value))}
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Qty">
                      <Input
                        value={item.qty}
                        onChange={(e) => set((d) => (d.invest.items[i].qty = e.target.value))}
                      />
                    </Field>
                    <Field label="Unit">
                      <Input
                        value={item.unit}
                        onChange={(e) => set((d) => (d.invest.items[i].unit = e.target.value))}
                      />
                    </Field>
                    <Field label="Amount">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={item.amount}
                        onChange={(e) =>
                          set((d) => (d.invest.items[i].amount = Math.max(0, Math.round(Number(e.target.value) || 0))))
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-center"
                onClick={() =>
                  set((d) => d.invest.items.push({ name: "New item", desc: "Description", qty: "—", unit: "—", amount: 0 }))
                }
              >
                <PlusIcon /> Add line item
              </Button>
            </div>

            <div className="bg-muted flex items-center justify-between rounded-lg px-3 py-2">
              <span className="text-sm font-medium">{inv.invest.totalLabel || "Total"}</span>
              <span className="text-sm font-semibold tabular-nums">{money(total, inv.meta.currency)}</span>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Field label="Total label">
                <Input
                  value={inv.invest.totalLabel}
                  onChange={(e) => set((d) => (d.invest.totalLabel = e.target.value))}
                />
              </Field>
              <Field label="Advance %">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  className="w-24"
                  value={inv.invest.advancePct}
                  onChange={(e) =>
                    set((d) => (d.invest.advancePct = Math.min(100, Math.max(0, Math.round(Number(e.target.value) || 0)))))
                  }
                />
              </Field>
            </div>
            <Field label="Total note">
              <Textarea
                className="min-h-0"
                rows={2}
                value={inv.invest.totalNote}
                onChange={(e) => set((d) => (d.invest.totalNote = e.target.value))}
              />
            </Field>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-muted-foreground text-xs font-normal">{label}</Label>
      {children}
    </div>
  );
}

function Lines({
  lines,
  onChange,
  onAdd,
  onRemove,
}: {
  lines: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input value={line} onChange={(e) => onChange(i, e.target.value)} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label={`Remove line ${i + 1}`}
            onClick={() => onRemove(i)}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="justify-center" onClick={onAdd}>
        <PlusIcon /> Add line
      </Button>
    </div>
  );
}
