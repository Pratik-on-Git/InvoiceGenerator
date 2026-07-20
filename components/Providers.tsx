"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { SidebarProvider } from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delay={200}>
        <SidebarProvider defaultOpen>{children}</SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
