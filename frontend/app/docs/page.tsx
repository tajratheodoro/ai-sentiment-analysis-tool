"use client";

import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, FileArchive, MessageSquareText, ShieldCheck } from "lucide-react";
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[0.84fr_1.16fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card p-5 sm:p-6">
            <Button asChild variant="ghost" className="mb-10 w-fit px-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {t.docs.back}
              </Link>
            </Button>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
              <ClipboardList className="h-4 w-4" />
              {t.docs.eyebrow}
            </p>
            <h1 className="max-w-3xl font-display text-heading font-normal tracking-[var(--tracking-heading)] text-foreground sm:text-heading-lg">
              {t.docs.title}
            </h1>
            <p className="max-w-3xl text-body-sm leading-6 text-muted-foreground sm:text-body">{t.docs.intro}</p>
          </CardHeader>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="grid gap-4 p-5 sm:p-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-cosmic-gradient)] text-ghost-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-normal tracking-[-0.04em] text-foreground">{t.docs.lgpdTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.docs.lgpdText}</p>
                </div>
              </div>
            </div>
            <GuideRow icon={<FileArchive className="h-5 w-5" />} title={t.dashboard.download} text={t.docs.recommendation} />
            <GuideRow icon={<ClipboardList className="h-5 w-5" />} title={t.docs.eyebrow} text={t.docs.browserStorage} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.76fr_1.24fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card p-5">
            <CardTitle>{t.docs.labelsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <Meaning sentiment="Positive" label={t.dashboard.positive} text={t.docs.positiveText} />
            <Meaning sentiment="Neutral" label={t.dashboard.neutral} text={t.docs.neutralText} />
            <Meaning sentiment="Negative" label={t.dashboard.negative} text={t.docs.negativeText} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card p-5">
            <CardTitle>{t.docs.guideTitle}</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-3 md:grid-cols-3">
              {t.docs.steps.map(([title, text], index) => {
                const Icon = icons[index] ?? MessageSquareText;
                return (
                  <div key={title} className="rounded-xl border border-border bg-card p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 font-medium text-foreground">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-surface/45 p-4">
              <GuideRow icon={<BarChart3 className="h-5 w-5" />} title={t.docs.csvTitle} text={t.docs.csvText} />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Meaning({ sentiment, label, text }: { sentiment: "Positive" | "Neutral" | "Negative"; label: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition duration-200 hover:border-accent/40 hover:bg-surface/45">
      <Badge sentiment={sentiment}>{label}</Badge>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function GuideRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/45 p-4">
      <div className="flex gap-3">
        <span className="mt-0.5 text-accent">{icon}</span>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}
