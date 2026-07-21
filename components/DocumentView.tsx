"use client";

import { type CSSProperties } from "react";

import { useUI } from "@/lib/state";
import { cn } from "@/lib/utils";
import { SummaryStrip } from "./shell/SummaryStrip";
import { DocToolbar } from "./shell/DocToolbar";
import { Doc } from "./Doc";

/** The `/` route: live A4 document preview with its summary strip and toolbar. */
export function DocumentView() {
  const { editing, zoom, setPageTotal } = useUI();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-1 flex-col gap-4 p-3 sm:p-4">
      <SummaryStrip />
      <DocToolbar />
      <div className={cn("stage min-w-0 flex-1 rounded-xl border", editing && "editing")}>
        <div className="doc-scaler mx-auto w-fit" style={{ zoom } as CSSProperties}>
          <Doc onPageCountChange={setPageTotal} />
        </div>
      </div>
    </div>
  );
}
