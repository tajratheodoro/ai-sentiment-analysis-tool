"use client";

import { ExternalLink, FileText, Home, Linkedin, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const LINKEDIN_URL = "https://www.linkedin.com/in/theodoro-tajra/";

export function SiteHeader() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useI18n();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark = savedTheme ? savedTheme === "dark" : true;

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
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-3 py-3 sm:px-6 lg:h-16 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
            <Image src="/images/icone.webp" alt="" width={40} height={40} className="h-full w-full object-cover" priority />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-normal tracking-[-0.03em] text-foreground sm:text-base">
              {t.nav.brand}
            </span>
            <span className="block truncate text-xs font-medium text-muted-foreground">{t.nav.tagline}</span>
          </span>
        </Link>

        <nav className="grid grid-cols-2 gap-2 min-[520px]:flex min-[520px]:items-center lg:justify-center">
          <Button asChild variant={pathname === "/" ? "default" : "ghost"} className="px-3">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
              <Home className="h-4 w-4" />
              {t.nav.dashboard}
            </Link>
          </Button>
          <Button asChild variant={pathname === "/docs" ? "default" : "ghost"} className="px-3">
            <Link href="/docs" aria-current={pathname === "/docs" ? "page" : undefined}>
              <FileText className="h-4 w-4" />
              {t.nav.docs}
            </Link>
          </Button>
        </nav>

        <div className="grid grid-cols-3 gap-2 min-[520px]:flex min-[520px]:items-center lg:justify-end">
          <Button asChild variant="outline" className="px-3">
            <a href={LINKEDIN_URL} rel="noreferrer" target="_blank">
              <Linkedin className="h-4 w-4" />
              {t.nav.linkedin}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            aria-label="Alternar idioma / Toggle language"
            aria-pressed={language === "ptbr"}
            className="px-3 text-xs uppercase tracking-wide"
            onClick={toggleLanguage}
            type="button"
            variant="outline"
          >
            <span className={language === "ptbr" ? "text-accent" : "text-muted-foreground"}>ptbr</span>
            <span className="text-muted-foreground">/</span>
            <span className={language === "eng" ? "text-accent" : "text-muted-foreground"}>eng</span>
          </Button>
          <Button
            aria-label={t.nav.toggleTheme}
            aria-pressed={mounted ? isDark : undefined}
            className="h-10 w-10 px-0"
            onClick={toggleTheme}
            title={mounted && isDark ? t.nav.light : t.nav.dark}
            type="button"
            variant="outline"
          >
            {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
