"use client";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileJson,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  analyzeFeedbackBatch,
  buildReport,
  normalizeFeedbackInput,
  parseCsvFeedback,
  validateImportedAnalysis,
  type CategoryKey,
  type LocalAnalysis,
} from "@/lib/client-analysis";
import { downloadAnalysisZip } from "@/lib/export-analysis";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "customer-sentiment-local-analysis-v1";
const MAX_STORED_ITEMS = 120;

const sentimentStyles = {
  Positive: "border-success/25 bg-success/10 text-success",
  Neutral: "border-warning/30 bg-warning/12 text-warning",
  Negative: "border-destructive/25 bg-destructive/10 text-destructive",
};

export default function Home() {
  const { language, t } = useI18n();
  const chartRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState("");
  const [analysis, setAnalysis] = useState<LocalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      setAnalysis(validateImportedAnalysis(JSON.parse(saved)));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const report = useMemo(() => buildReport(analysis), [analysis]);

  const chartData = useMemo(
    () => [
      { name: t.dashboard.positive, count: report.positive, fill: "hsl(var(--chart-positive))" },
      { name: t.dashboard.neutral, count: report.neutral, fill: "hsl(var(--chart-neutral))" },
      { name: t.dashboard.negative, count: report.negative, fill: "hsl(var(--chart-negative))" },
    ],
    [report, t],
  );

  function persistAnalysis(nextAnalysis: LocalAnalysis) {
    setAnalysis(nextAnalysis);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAnalysis));
  }

  function appendAnalysis(nextAnalysis: LocalAnalysis) {
    setAnalysis((currentAnalysis) => {
      const mergedAnalysis: LocalAnalysis = {
        version: 1,
        createdAt: nextAnalysis.createdAt,
        items: [...nextAnalysis.items, ...(currentAnalysis?.items ?? [])].slice(0, MAX_STORED_ITEMS),
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedAnalysis));
      return mergedAnalysis;
    });
  }

  function handleFeedbackKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || loading) return;

    event.preventDefault();
    formRef.current?.requestSubmit();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const feedbacks = normalizeFeedbackInput(feedback);
    if (!feedbacks.length) {
      setError(t.dashboard.emptyInput);
      return;
    }

    setLoading(true);
    try {
      const nextAnalysis = await analyzeFeedbackBatch(feedbacks, (status) => setModelStatus(status));
      appendAnalysis(nextAnalysis);
      setSuccess(t.dashboard.success);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.dashboard.emptyInput);
    } finally {
      setLoading(false);
    }
  }

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    try {
      const rows = await parseCsvFeedback(file);
      setFeedback(rows.join("\n"));
      setSuccess(t.dashboard.csvLoaded);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t.dashboard.emptyInput);
    }
  }

  async function handleRestoreUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    try {
      const restored = validateImportedAnalysis(JSON.parse(await file.text()));
      persistAnalysis(restored);
      setSuccess(t.dashboard.restoreSuccess);
    } catch {
      setError(t.dashboard.restoreError);
    }
  }

  async function handleDownload() {
    if (!analysis) return;
    setError("");
    try {
      await downloadAnalysisZip(analysis, chartRef.current);
    } catch {
      setError(t.dashboard.downloadError);
    }
  }

  function handleClearAnalysis() {
    setClearing(true);
    window.localStorage.removeItem(STORAGE_KEY);
    setAnalysis(null);
    setDialogOpen(false);
    setSuccess("");
    setError("");
    setClearing(false);
  }

  const modelMessage =
    modelStatus === "loading"
      ? t.dashboard.modelLoading
      : modelStatus === "ready"
        ? t.dashboard.modelReady
        : modelStatus === "fallback"
          ? t.dashboard.modelFallback
          : t.dashboard.modelIdle;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card p-5 sm:p-6">
            <SectionLabel icon={<Sparkles className="h-4 w-4" />} label={t.dashboard.eyebrow} />
            <h1 className="max-w-3xl font-display text-heading font-normal tracking-[var(--tracking-heading)] text-foreground sm:text-heading-lg">
              {t.dashboard.title}
            </h1>
            <p className="max-w-2xl text-body-sm leading-6 text-muted-foreground sm:text-body">{t.dashboard.subtitle}</p>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <label className="text-sm font-medium text-foreground" htmlFor="feedback">
                    {t.dashboard.label}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {feedback.trim().length}/30000 {t.dashboard.chars}
                  </span>
                </div>
                <Textarea
                  id="feedback"
                  className="min-h-[18rem]"
                  maxLength={30000}
                  placeholder={t.dashboard.placeholder}
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  onKeyDown={handleFeedbackKeyDown}
                />
              </div>

              <div className="grid gap-2 rounded-xl border border-border bg-surface/40 p-3 min-[560px]:grid-cols-3">
                <FileControl accept=".csv,text/csv" icon={<Upload className="h-4 w-4" />} label={t.dashboard.csv} onChange={handleCsvUpload} />
                <FileControl accept=".json,application/json" icon={<FileJson className="h-4 w-4" />} label={t.dashboard.restore} onChange={handleRestoreUpload} />
                <Button disabled={loading} type="submit">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? t.dashboard.analyzing : t.dashboard.analyze}
                </Button>
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {success ? (
                <Alert className="flex items-center gap-2 border-success/25 bg-success/10 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </Alert>
              ) : null}
              {error ? (
                <Alert className="flex items-center gap-2 border-destructive/25 bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </Alert>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    {t.dashboard.chartTitle}
                  </CardTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.dashboard.chartText}</p>
                </div>
                <Button variant="outline" disabled={!analysis} onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  {t.dashboard.download}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <Metric label={t.dashboard.total} value={report.total.toString()} />
                <Metric label={t.dashboard.satisfaction} value={`${report.positivePercentage.toFixed(1)}%`} tone="accent" />
                <Metric label={t.dashboard.positive} value={report.positive.toString()} tone="success" />
                <Metric label={t.dashboard.negative} value={report.negative.toString()} tone="danger" />
              </div>
              <div ref={chartRef} className="mt-5 h-72 rounded-xl border border-border bg-card p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--accent) / 0.08)" }}
                      formatter={(value) => [value, language === "ptbr" ? "Contagem:" : "Count:"]}
                      separator=" "
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/25 bg-card">
            <CardContent className="grid gap-4 p-5">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-cosmic-gradient)] text-ghost-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-normal tracking-[-0.04em] text-foreground">{t.dashboard.privacyTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.dashboard.privacyText}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface/45 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{modelMessage}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card p-5">
            <CardTitle>{t.dashboard.categoriesTitle}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">{t.dashboard.categoriesText}</p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {report.categories.length ? (
              report.categories.map((category) => (
                <CategoryRow
                  key={category.category}
                  label={getCategoryLabel(category.category, t.dashboard)}
                  count={category.count}
                  percentage={category.percentage}
                  suffix={t.dashboard.percent}
                />
              ))
            ) : (
              <EmptyState title={t.dashboard.emptyHistory} text={t.dashboard.emptyHistoryText} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-border bg-card p-5">
            <div>
              <CardTitle>{t.dashboard.historyTitle}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.dashboard.historyText}</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!analysis?.items.length}>
                  <Trash2 className="h-4 w-4" />
                  {t.dashboard.clear}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.dashboard.clearTitle}</DialogTitle>
                  <DialogDescription>{t.dashboard.clearText}</DialogDescription>
                </DialogHeader>
                <div className="mt-5 flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">{t.dashboard.cancel}</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleClearAnalysis} disabled={clearing}>
                    {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {t.dashboard.clearHistory}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-5">
            <div className="max-h-[30rem] space-y-3 overflow-auto pr-1">
              {analysis?.items.length ? (
                analysis.items.map((item, index) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-4 transition duration-200 hover:border-accent/40 hover:bg-surface/45"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge sentiment={item.sentiment}>{translateSentiment(item.sentiment, t.dashboard)}</Badge>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${sentimentStyles[item.sentiment]}`}>
                          {getCategoryLabel(item.category, t.dashboard)}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        #{analysis.items.length - index}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{item.feedback}</p>
                  </article>
                ))
              ) : (
                <EmptyState title={t.dashboard.emptyHistory} text={t.dashboard.emptyHistoryText} />
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function SectionLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
      {icon}
      {label}
    </p>
  );
}

function FileControl({
  accept,
  icon,
  label,
  onChange,
}: {
  accept: string;
  icon: ReactNode;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition duration-200 hover:border-accent/55 hover:bg-secondary/70 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      {icon}
      {label}
      <input className="sr-only" type="file" accept={accept} onChange={onChange} />
    </label>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/45 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-accent">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string;
  tone?: "primary" | "accent" | "success" | "warning" | "danger";
}) {
  const tones = {
    primary: "text-foreground",
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-normal tracking-[-0.04em] ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function CategoryRow({
  label,
  count,
  percentage,
  suffix,
}: {
  label: string;
  count: number;
  percentage: number;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm font-medium text-accent">{percentage}%</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {count} {suffix}
      </p>
    </div>
  );
}

function getCategoryLabel(category: CategoryKey, labels: ReturnType<typeof useI18n>["t"]["dashboard"]) {
  const categoryLabels: Record<CategoryKey, string> = {
    delivery: labels.categoryDelivery,
    quality: labels.categoryQuality,
    service: labels.categoryService,
    price: labels.categoryPrice,
    checkout: labels.categoryCheckout,
    other: labels.categoryOther,
  };

  return categoryLabels[category];
}

function translateSentiment(sentiment: "Positive" | "Neutral" | "Negative", labels: ReturnType<typeof useI18n>["t"]["dashboard"]) {
  if (sentiment === "Positive") return labels.positive;
  if (sentiment === "Negative") return labels.negative;
  return labels.neutral;
}
