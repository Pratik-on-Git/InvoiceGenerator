# Blue Moon Creatives — Invoice / Quotation Generator

A Next.js app that turns the Blue Moon Creatives quotation design into a **live, fully
editable document generator**. The on-screen document is pixel-identical to the printed
quotation; every field is editable inline, and **Download PDF** produces the same A4 pages.

## Run it

> ⚠️ This folder's path contains spaces ("Blue Moon Creations"), which breaks the `npx`
> and `.bin` shims on Windows. Call the Next binary through `node` directly:

```bash
# from inside invoice-generator/
node ./node_modules/next/dist/bin/next dev        # dev server  -> http://localhost:3000
node ./node_modules/next/dist/bin/next build      # production build
node ./node_modules/next/dist/bin/next start      # serve the build
```

(Plain `npm run dev` also works if your path has no spaces.)

## Using the app

- **Edit inline** — click any text on the document and type. `Ctrl/Cmd+B` bolds a
  selection inside rich fields (leads, terms, notes).
- **Add / remove / reorder** — hover any repeatable item (line items, features,
  deliverables, terms, milestones, requirements, signatories, footer lines) for the
  ↑ ↓ × controls; use the dashed **+ …** buttons to add.
- **Investment total** recomputes live from the line-item amounts.
- **Section toggles** (top bar) show/hide the Scope, Features, Terms, Requirements and
  Payment pages. Page numbers renumber automatically.
- **Logo** upload and **accent colour** picker rebrand the whole document.
- **Preview** hides all editing chrome; **Download PDF** downloads an A4 PDF directly
  (each sheet is rasterised client-side via `jspdf` + `html2canvas-pro`) — no print dialog.
- **Export JSON / Import** saves and reloads a document; edits also autosave to the
  browser (localStorage).
- **Automatic A4 pagination** continuously packs every enabled section into the available
  page space, then moves only the overflowing rows or cards to a numbered continuation
  sheet. The dashboard and PDF page totals update from the measured layout.

## Architecture

```text
app/
  layout.tsx        Root layout + Hanken Grotesque webfont
  globals.css       Design system (identical to the quotation) + app chrome + print CSS
  page.tsx          Renders <Generator/>
lib/
  types.ts          Invoice data model (mirrors the printed layout 1:1)
  defaultInvoice.ts Default document (the Kanthiveda Herbals quotation)
  state.tsx         React context: document state, UI state, measured page total
  format.ts         Indian-style money grouping
  list.ts           move() / removeAt() array helpers
components/
  Generator.tsx     State, autosave, import/export, print, context provider
  AppBar.tsx        Toolbar (toggles, logo, colour, file actions)
  Doc.tsx           Builds one ordered cross-section document flow
  AutoPaginatedDocument.tsx Global A4 packing and oversized-item safeguard
  PageFrame.tsx     Fixed A4 sheet, reserved content body, footer
  Editable.tsx      Cursor-safe inline contentEditable (text / rich / numeric)
  Controls.tsx      AddButton / RemoveButton
  ItemControls.tsx  Reorder (↑↓) + remove cluster
  sections/         Cover, Scope, Features, Terms, Requirements, Payment
```

Adding a new field is a three-step change: add it to `types.ts`, give it a value in
`defaultInvoice.ts`, and drop an `<Editable>` bound to its path into the relevant section.
