"use client";

import { type ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * Shared "main button" styling for the sidebar's top-level sections
 * (Document Pages, Edit Details, Branding, Data). A filled navy header so each
 * section reads as one prominent, consistent control.
 */
export const sectionTriggerClass =
  "flex h-9 w-full shrink-0 cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground [&>svg]:size-4 [&>svg]:shrink-0";

/**
 * A collapsible sidebar section: a `sectionTriggerClass` header that toggles a
 * height-animated panel of nested options. Used by Document Pages, Branding and
 * Data so all three share the exact same header + dropdown behaviour.
 */
export function CollapsibleSection({
  label,
  badge,
  defaultOpen = false,
  children,
}: {
  label: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <SidebarGroup className="py-1">
      <Collapsible defaultOpen={defaultOpen}>
        <SidebarGroupLabel render={<CollapsibleTrigger />} className={cn(sectionTriggerClass, "group/sec")}>
          <span className="flex min-w-0 items-center gap-2">
            <ChevronRightIcon className="size-4 shrink-0 transition-transform duration-200 group-data-[panel-open]/sec:rotate-90" />
            <span className="truncate">{label}</span>
          </span>
          {badge}
        </SidebarGroupLabel>
        <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
          <SidebarGroupContent className="mt-1 group-data-[collapsible=icon]:hidden">{children}</SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
