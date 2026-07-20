"use client";

import {
  CheckCircle2Icon,
  EyeIcon,
  Loader2Icon,
  MaximizeIcon,
  PencilLineIcon,
  TriangleAlertIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

import { useInvoice, useUI, type SaveState } from "@/lib/state";
import { pageCount } from "@/lib/summary";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;
const clamp = (n: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(n * 100) / 100));

export function DocToolbar() {
  const { inv } = useInvoice();
  const { editing, setEditing, saveState, zoom, setZoom } = useUI();
  const pages = pageCount(inv);

  return (
    <div className="no-print bg-card flex flex-wrap items-center gap-2 rounded-xl border p-2 shadow-xs">
      {/* Edit / Preview segmented control */}
      <div className="bg-muted flex items-center gap-1 rounded-lg p-0.5">
        <SegButton active={editing} onClick={() => setEditing(true)}>
          <PencilLineIcon className="size-4" /> Edit
        </SegButton>
        <SegButton active={!editing} onClick={() => setEditing(false)}>
          <EyeIcon className="size-4" /> Preview
        </SegButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6! max-sm:hidden" />
      <SaveBadge state={saveState} />

      <div className="ml-auto flex items-center gap-1.5">
        <Badge variant="outline" className="mr-1 tabular-nums max-sm:hidden">
          {pages} {pages === 1 ? "page" : "pages"} · A4
        </Badge>

        {/* Zoom cluster */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            title="Zoom out"
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => clamp(z - 0.1))}
          >
            <ZoomOutIcon />
          </Button>

          <button
            type="button"
            onClick={() => setZoom(1)}
            className="hover:bg-muted min-w-14 rounded-md px-1 py-1 text-center text-sm font-medium tabular-nums"
            title="Reset zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            title="Zoom in"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => clamp(z + 0.1))}
          >
            <ZoomInIcon />
          </Button>

          <Button variant="ghost" size="icon-sm" aria-label="Fit to 100%" title="Fit to 100%" onClick={() => setZoom(1)}>
            <MaximizeIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs max-sm:hidden">
        <Loader2Icon className="size-3.5 animate-spin" /> Saving…
      </span>
    );
  if (state === "error")
    return (
      <span className="text-destructive flex items-center gap-1.5 text-xs font-medium max-sm:hidden">
        <TriangleAlertIcon className="size-3.5" /> Not saved
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600 max-sm:hidden dark:text-emerald-500">
      <CheckCircle2Icon className="size-3.5" /> All changes saved
    </span>
  );
}
