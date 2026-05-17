"use client";

import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, FileArchive, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function DocsPage() {
  const { t } = useI18n();
  const icons = [MessageSquareText, CheckCircle2, BarChart3];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8.75rem)] w-full max-w-5xl flex-col gap-5 px-3 py-5 sm:min-h-[calc(100vh-5.25rem)] sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <section className="relative overflow-hidden rounded-lg border border-border/80 bg-card/88 p-5 shadow-[0_18px_70px_-45px_hsl(var(--primary)/0.65)] backdrop-blur sm:p-7">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/12 blur-3xl" />
        <div className="relative">
          <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild variant="ghost" className="px-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {t.docs.back}
              </Link>
            </Button>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t.docs.eyebrow}
            </p>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t.docs.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{t.docs.intro}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {t.docs.steps.map(([title, text], index) => {
          const Icon = icons[index] ?? MessageSquareText;
          return (
            <Card key={title} className="group overflow-hidden">
              <CardHeader>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/45">
            <CardTitle>{t.docs.labelsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <Meaning sentiment="Positive" label={t.dashboard.positive} text={t.docs.positiveText} />
            <Meaning sentiment="Neutral" label={t.dashboard.neutral} text={t.docs.neutralText} />
            <Meaning sentiment="Negative" label={t.dashboard.negative} text={t.docs.negativeText} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/45">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {t.docs.guideTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 text-sm leading-6 text-muted-foreground">
            <DashboardGuide icon={<ShieldCheck className="h-5 w-5" />} title={t.docs.lgpdTitle} text={t.docs.lgpdText} />
            <DashboardGuide icon={<FileArchive className="h-5 w-5" />} title={t.dashboard.download} text={t.docs.recommendation} />
            <DashboardGuide icon={<BarChart3 className="h-5 w-5" />} title={t.docs.csvTitle} text={t.docs.csvText} />
            <DashboardGuide icon={<ClipboardList className="h-5 w-5" />} title={t.docs.eyebrow} text={t.docs.browserStorage} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Meaning({ sentiment, label, text }: { sentiment: "Positive" | "Neutral" | "Negative"; label: string; text: string }) {
  return (
    <div className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm transition duration-200 hover:border-primary/30 hover:bg-surface/45">
      <Badge sentiment={sentiment}>{label}</Badge>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function DashboardGuide({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm transition duration-200 hover:border-primary/30 hover:bg-surface/45">
      <div className="flex items-center gap-2 font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <p className="mt-2">{text}</p>
    </div>
  );
}
