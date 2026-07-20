"use client";

import { DownloadIcon, EyeIcon, PencilLineIcon } from "lucide-react";

import { useInvoice, useUI } from "@/lib/state";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./ModeToggle";

export function AppHeader() {
  const { inv } = useInvoice();
  const { editing, setEditing, onDownload } = useUI();

  return (
    <header className="bg-card/80 supports-[backdrop-filter]:bg-card/60 no-print sticky top-0 z-40 border-b backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        <SidebarTrigger className="[&_svg]:size-5!" />
        <Separator orientation="vertical" className="h-5!" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="text-muted-foreground hidden sm:inline-flex">Documents</BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[38vw] truncate font-medium">
                {inv.cover.titleA} {inv.cover.titleB}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <EyeIcon /> : <PencilLineIcon />}
            {editing ? "Preview" : "Edit"}
          </Button>
          <ModeToggle />
          <Button size="sm" onClick={onDownload}>
            <DownloadIcon />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
