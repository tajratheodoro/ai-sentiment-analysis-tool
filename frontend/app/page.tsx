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
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
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

const sentimentStyles = {
  Positive: "border-success/25 bg-success/10 text-success",
  Neutral: "border-warning/30 bg-warning/12 text-warning",
  Negative: "border-destructive/25 bg-destructive/10 text-destructive",
};

export default function Home() {
  const { t } = useI18n();
  const chartRef = useRef<HTMLDivElement>(null);
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
      persistAnalysis(nextAnalysis);
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
    <main className="mx-auto flex min-h-[calc(100vh-8.75rem)] w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:min-h-[calc(100vh-5.25rem)] sm:gap-6 sm:px-5 sm:py-6 lg:px-7">
      <section className="rounded-lg border border-primary/25 bg-primary/10 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">{t.dashboard.privacyTitle}</h2>
            <p className="mt-2 max-w-5xl text-sm leading-6 text-foreground/80">{t.dashboard.privacyText}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-lg border border-border/80 bg-card/88 p-5 shadow-[0_18px_70px_-45px_hsl(var(--primary)/0.65)] backdrop-blur sm:p-6">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-accent/12 blur-3xl" />
          <div className="relative">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t.dashboard.eyebrow}
            </p>
            <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{t.dashboard.subtitle}</p>
          </div>
          <div className="relative mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
            <Metric label={t.dashboard.total} value={report.total.toString()} tone="primary" />
            <Metric label={t.dashboard.satisfaction} value={`${report.positivePercentage.toFixed(1)}%`} tone="accent" />
            <Metric label={t.dashboard.positive} value={report.positive.toString()} tone="success" />
            <Metric label={t.dashboard.negative} value={report.negative.toString()} tone="danger" />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/55 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{t.dashboard.formTitle}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.formText}</p>
              </div>
              <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="text-sm font-semibold" htmlFor="feedback">
                {t.dashboard.label}
              </label>
              <Textarea
                id="feedback"
                className="min-h-40 sm:min-h-44"
                maxLength={30000}
                placeholder={t.dashboard.placeholder}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
              />
              <p className="rounded-md border border-border/70 bg-surface/45 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {modelMessage}
              </p>
              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
                <span className="text-xs text-muted-foreground">
                  {feedback.trim().length}/30000 {t.dashboard.chars}
                </span>
                <div className="flex flex-wrap gap-2">
                  <FileControl accept=".csv,text/csv" icon={<Upload className="h-4 w-4" />} label={t.dashboard.csv} onChange={handleCsvUpload} />
                  <FileControl accept=".json,application/json" icon={<FileJson className="h-4 w-4" />} label={t.dashboard.restore} onChange={handleRestoreUpload} />
                  <Button disabled={loading} type="submit">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {loading ? t.dashboard.analyzing : t.dashboard.analyze}
                  </Button>
                </div>
              </div>
            </form>
            {success ? (
              <Alert className="mt-4 flex items-center gap-2 border-success/25 bg-success/10 text-success">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </Alert>
            ) : null}
            {error ? (
              <Alert className="mt-4 flex items-center gap-2 border-destructive/25 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-col gap-2 space-y-0 border-b border-border/70 bg-surface/45 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t.dashboard.chartTitle}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.chartText}</p>
            </div>
            <Button variant="outline" disabled={!analysis} onClick={handleDownload}>
              <Download className="h-4 w-4" />
              {t.dashboard.download}
            </Button>
          </CardHeader>
          <CardContent className="p-5">
            <div ref={chartRef} className="h-60 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 2, 2]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/45 p-5">
            <CardTitle>{t.dashboard.categoriesTitle}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.categoriesText}</p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {report.categories.length ? (
              report.categories.map((category) => (
                <div key={category.category} className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{getCategoryLabel(category.category, t.dashboard)}</p>
                    <p className="text-sm font-bold text-primary">{category.percentage}%</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${category.percentage}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {category.count} {t.dashboard.percent}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title={t.dashboard.emptyHistory} text={t.dashboard.emptyHistoryText} />
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-border/70 bg-surface/45 p-5">
          <div>
            <CardTitle>{t.dashboard.historyTitle}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.historyText}</p>
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
          <div className="max-h-96 space-y-3 overflow-auto pr-1">
            {analysis?.items.length ? (
              analysis.items.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm transition duration-200 hover:border-primary/30 hover:bg-surface/45"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge sentiment={item.sentiment}>{translateSentiment(item.sentiment, t.dashboard)}</Badge>
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${sentimentStyles[item.sentiment]}`}>
                        {getCategoryLabel(item.category, t.dashboard)}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      #{analysis.items.length - index}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.feedback}</p>
                </article>
              ))
            ) : (
              <EmptyState title={t.dashboard.emptyHistory} text={t.dashboard.emptyHistoryText} />
            )}
          </div>
        </CardContent>
      </Card>
    </main>
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
    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-card/80 px-3 text-sm font-semibold text-foreground shadow-sm transition duration-200 hover:border-primary/45 hover:bg-surface focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      {icon}
      {label}
      <input className="sr-only" type="file" accept={accept} onChange={onChange} />
    </label>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-surface/50 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
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
    primary: "from-primary/16 to-primary/5 text-primary",
    accent: "from-accent/18 to-accent/5 text-accent",
    success: "from-success/16 to-success/5 text-success",
    warning: "from-warning/16 to-warning/5 text-warning",
    danger: "from-destructive/16 to-destructive/5 text-destructive",
  };

  return (
    <div className={`rounded-md border border-border/75 bg-gradient-to-br ${tones[tone]} p-4 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
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
