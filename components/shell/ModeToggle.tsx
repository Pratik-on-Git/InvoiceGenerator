"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStarIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonStarIcon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
