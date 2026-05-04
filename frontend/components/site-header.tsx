"use client";

import { ExternalLink, FileText, Home, Linkedin, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const LINKEDIN_URL = "https://www.linkedin.com/in/theodoro-tajra/";

export function SiteHeader() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle("dark", nextTheme);
    window.localStorage.setItem("theme", nextTheme ? "dark" : "light");
    setIsDark(nextTheme);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            CS
          </span>
          <span className="truncate font-display text-base font-bold sm:text-lg">
            Customer Satisfaction Score System
          </span>
        </Link>

        <nav className="grid grid-cols-2 gap-2 min-[460px]:flex min-[460px]:flex-wrap min-[460px]:items-center">
          <Button asChild variant="ghost" className="px-2 sm:px-3">
            <Link href="/">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="px-2 sm:px-3">
            <Link href="/docs">
              <FileText className="h-4 w-4" />
              How is works?
            </Link>
          </Button>
          <Button asChild variant="outline" className="px-2 sm:px-3">
            <a href={LINKEDIN_URL} rel="noreferrer" target="_blank">
              <Linkedin className="h-4 w-4" />
              LinkedIn
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            aria-label="Toggle dark mode"
            className="h-10 w-10 px-0"
            onClick={toggleTheme}
            type="button"
            variant="outline"
          >
            {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
