"use client";

import { MoonStarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact brand mark for the sidebar header. */
export function Logo({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
        <MoonStarIcon className="size-4.5" />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">Blue Moon</span>
          <span className="text-muted-foreground truncate text-xs">Invoice Studio</span>
        </div>
      )}
    </div>
  );
}
