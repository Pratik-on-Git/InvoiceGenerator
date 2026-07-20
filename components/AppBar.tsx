"use client";

import { useRef } from "react";
import { useInvoice } from "@/lib/state";
import type { SectionKey } from "@/lib/types";

interface Props {
  editing: boolean;
  setEditing: (v: boolean) => void;
  saveState: "saving" | "saved" | "error";
  onDownload: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onLogo: (file: File) => void;
}

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "scope", label: "Scope" },
  { key: "features", label: "Features" },
  { key: "terms", label: "Terms" },
  { key: "requirements", label: "Requirements" },
  { key: "payment", label: "Payment" },
];

export function AppBar({
  editing,
  setEditing,
  saveState,
  onDownload,
  onExport,
  onImport,
  onReset,
  onLogo,
}: Props) {
  const { inv, set } = useInvoice();
  const importRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  return (
    <header className="appbar">
      <div className="brand-chip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={inv.brand.logo} alt="" />
        <span>
          Blue Moon <span className="accent">Invoice</span>
        </span>
      </div>

      {/* Section visibility toggles */}
      <div className="group">
        {SECTIONS.map((s) => {
          const on = inv[s.key].enabled;
          return (
            <label key={s.key} className={"toggle" + (on ? " on" : "")} title={`Show/hide ${s.label} page`}>
              <input
                type="checkbox"
                checked={on}
                onChange={(e) => set((d) => (d[s.key].enabled = e.target.checked))}
              />
              {s.label}
            </label>
          );
        })}
      </div>

      {/* Brand customisation */}
      <div className="group">
        <button type="button" className="btn ghost" onClick={() => logoRef.current?.click()}>
          Logo
        </button>
        <label className="swatch" title="Accent colour">
          <input
            type="color"
            value={inv.meta.accent}
            onChange={(e) => set((d) => (d.meta.accent = e.target.value))}
          />
        </label>
      </div>

      <div className="spacer" />

      {/* File actions */}
      <div className="group">
        <span
          className="save-state"
          style={saveState === "error" ? { color: "#ff8a8a" } : undefined}
          title={saveState === "error" ? "Autosave failed (storage full or blocked). Use Export JSON to keep a copy." : undefined}
        >
          {saveState === "saving" ? "Saving…" : saveState === "error" ? "⚠ Not saved" : "✓ Saved"}
        </span>
        <button type="button" className="btn ghost" onClick={() => setEditing(!editing)}>
          {editing ? "Preview" : "Edit"}
        </button>
        <button type="button" className="btn ghost" onClick={() => importRef.current?.click()}>
          Import
        </button>
        <button type="button" className="btn ghost" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className="btn ghost" onClick={onReset}>
          Reset
        </button>
        <button type="button" className="btn primary" onClick={onDownload}>
          ⤓ Download PDF
        </button>
      </div>

      {/* hidden file inputs */}
      <input
        ref={logoRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onLogo(f);
          e.target.value = "";
        }}
      />
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }}
      />
    </header>
  );
}
