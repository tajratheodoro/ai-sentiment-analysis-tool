"use client";

import { ExternalLink, FileText, Home, Linkedin, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const LINKEDIN_URL = "https://www.linkedin.com/in/theodoro-tajra/";

export function SiteHeader() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">
            CS
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold tracking-tight sm:text-lg">
              Customer Sentiment
            </span>
            <span className="block truncate text-xs font-medium text-muted-foreground">
              AI feedback intelligence
            </span>
          </span>
        </Link>

        <nav className="grid grid-cols-2 gap-2 min-[460px]:flex min-[460px]:flex-wrap min-[460px]:items-center">
          <Button asChild variant="ghost" className={`px-2 sm:px-3 ${pathname === "/" ? "bg-secondary text-secondary-foreground" : ""}`}>
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className={`px-2 sm:px-3 ${pathname === "/docs" ? "bg-secondary text-secondary-foreground" : ""}`}>
            <Link href="/docs" aria-current={pathname === "/docs" ? "page" : undefined}>
              <FileText className="h-4 w-4" />
              How it works
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
            aria-pressed={mounted ? isDark : undefined}
            className="h-10 w-10 px-0"
            onClick={toggleTheme}
            title={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
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
