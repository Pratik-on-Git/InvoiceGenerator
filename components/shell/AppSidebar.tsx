"use client";

import { useRef } from "react";
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  Loader2Icon,
  PaletteIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UploadIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import { useInvoice, useUI } from "@/lib/state";
import type { SectionKey } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Logo } from "./Logo";
import { DetailsSheet } from "./DetailsSheet";
import { CollapsibleSection } from "./SidebarSection";

const SECTIONS: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: "scope", label: "Scope & Deliverables", icon: ClipboardListIcon },
  { key: "features", label: "Features", icon: SparklesIcon },
  { key: "terms", label: "Terms & Milestones", icon: ScrollTextIcon },
  { key: "requirements", label: "Requirements", icon: FileTextIcon },
  { key: "payment", label: "Payment & Sign-off", icon: WalletIcon },
];

const ACCENT_PRESETS = ["#005ef9", "#7c3aed", "#0ea5e9", "#059669", "#e11d48", "#ea580c", "#0a0f1e"];

export function AppSidebar() {
  const { inv, set } = useInvoice();
  const { saveState, pageTotal: pages, onExport, onImport, onReset, onLogo } = useUI();
  const importRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  return (
    <Sidebar collapsible="offcanvas" className="no-print">
      <SidebarHeader className="border-b p-3">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="gap-0 py-1">
        {/* ---- Document pages / section visibility ---- */}
        <CollapsibleSection
          label="Document Pages"
          defaultOpen
          badge={
            <Badge variant="secondary" className="tabular-nums">
              {pages} {pages === 1 ? "page" : "pages"}
            </Badge>
          }
        >
          <div className="flex flex-col gap-0.5">
            <div className="text-muted-foreground flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm">
              <FileTextIcon className="size-4 shrink-0" />
              <span className="flex-1 truncate">Cover</span>
              <Badge variant="outline" className="h-4.5 px-1.5 text-[10px]">
                always
              </Badge>
            </div>
            {SECTIONS.map(({ key, label, icon: Icon }) => {
              const on = inv[key].enabled;
              return (
                <label
                  key={key}
                  className={cn(
                    "hover:bg-sidebar-accent flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                    !on && "text-muted-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  <Switch size="sm" checked={on} onCheckedChange={(checked) => set((d) => (d[key].enabled = checked))} />
                </label>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* ---- Dynamic field editor (opens a form sheet) ---- */}
        <SidebarGroup className="py-1">
          <DetailsSheet />
        </SidebarGroup>

        {/* ---- Branding ---- */}
        <CollapsibleSection label="Branding" defaultOpen>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-hidden transition-colors [&_svg]:size-4 [&_svg]:shrink-0">
                  <PaletteIcon />
                  <span className="flex-1 text-left">Accent colour</span>
                  <span
                    className="border-border size-4 rounded-full border shadow-sm"
                    style={{ background: inv.meta.accent }}
                  />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64">
                  <PopoverHeader>
                    <PopoverTitle>Accent colour</PopoverTitle>
                    <PopoverDescription>Drives the blue highlights across the document.</PopoverDescription>
                  </PopoverHeader>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={c}
                        onClick={() => set((d) => (d.meta.accent = c))}
                        className={cn(
                          "size-7 rounded-full border shadow-sm transition-transform hover:scale-110",
                          inv.meta.accent.toLowerCase() === c.toLowerCase()
                            ? "ring-ring ring-2 ring-offset-2"
                            : "border-border"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <label className="border-input flex items-center gap-3 rounded-md border px-3 py-2">
                    <input
                      type="color"
                      value={inv.meta.accent}
                      onChange={(e) => set((d) => (d.meta.accent = e.target.value))}
                      className="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-muted-foreground font-mono text-xs uppercase">{inv.meta.accent}</span>
                  </label>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Upload logo" onClick={() => logoRef.current?.click()}>
                <ImageIcon />
                <span>Upload logo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleSection>

        {/* ---- Data / file actions ---- */}
        <CollapsibleSection label="Data" defaultOpen>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Import JSON" onClick={() => importRef.current?.click()}>
                <UploadIcon />
                <span>Import JSON</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Export JSON" onClick={onExport}>
                <DownloadIcon />
                <span>Export JSON</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Reset to template"
                onClick={onReset}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcwIcon />
                <span>Reset to template</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleSection>
      </SidebarContent>

      <SidebarFooter className="border-t group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between gap-2 px-1 py-0.5">
          <SaveState state={saveState} />
          <span className="text-muted-foreground truncate font-mono text-[11px]">{inv.meta.docNo}</span>
        </div>
      </SidebarFooter>

      <SidebarRail />

      {/* hidden file inputs (single source) */}
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
    </Sidebar>
  );
}

function SaveState({ state }: { state: "saving" | "saved" | "error" }) {
  if (state === "saving")
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Loader2Icon className="size-3.5 animate-spin" /> Saving…
      </span>
    );
  if (state === "error")
    return (
      <span className="text-destructive flex items-center gap-1.5 text-xs font-medium">
        <TriangleAlertIcon className="size-3.5" /> Not saved
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
      <CheckCircle2Icon className="size-3.5" /> Saved
    </span>
  );
}
