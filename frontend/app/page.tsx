"use client";

import { AlertCircle, BarChart3, CheckCircle2, Clock3, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Analysis, Report, Sentiment, analyzeFeedback, clearHistory, getHistory, getReport } from "@/lib/api";

const feedbackSchema = z
  .string()
  .trim()
  .min(3, "Feedback must contain at least 3 characters.")
  .max(2000, "Feedback must contain at most 2000 characters.");

const emptyReport: Report = {
  total_feedbacks: 0,
  positive_count: 0,
  neutral_count: 0,
  negative_count: 0,
  positive_percentage: 0,
};

function getRequestErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const successAlertStyles: Record<Sentiment | "Default", string> = {
  Positive: "border-success/25 bg-success/10 text-success",
  Neutral: "border-warning/30 bg-warning/12 text-warning",
  Negative: "border-destructive/25 bg-destructive/10 text-destructive",
  Default: "border-success/25 bg-success/10 text-success",
};

export default function Home() {
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState<Analysis[]>([]);
  const [report, setReport] = useState<Report>(emptyReport);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [successSentiment, setSuccessSentiment] = useState<Sentiment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function refreshDashboard() {
    const [historyData, reportData] = await Promise.all([getHistory(), getReport()]);
    setHistory(historyData);
    setReport(reportData);
  }

  useEffect(() => {
    refreshDashboard()
      .catch((requestError) => {
        setError(getRequestErrorMessage(requestError, "Unable to load the dashboard right now."));
      })
      .finally(() => setDashboardLoading(false));
  }, []);

  const chartData = useMemo(
    () => [
      { name: "Positive", count: report.positive_count, fill: "hsl(var(--chart-positive))" },
      { name: "Neutral", count: report.neutral_count, fill: "hsl(var(--chart-neutral))" },
      { name: "Negative", count: report.negative_count, fill: "hsl(var(--chart-negative))" },
    ],
    [report],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSuccessSentiment(null);

    const parsed = feedbackSchema.safeParse(feedback);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid feedback.");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeFeedback(parsed.data);
      setFeedback("");
      setSuccess(`Analysis completed: ${result.sentiment}`);
      setSuccessSentiment(result.sentiment);
      try {
        await refreshDashboard();
      } catch {
        setError("Analysis was saved, but the dashboard could not refresh automatically.");
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Unable to analyze feedback right now."));
    } finally {
      setLoading(false);
    }
  }

  function handleFeedbackKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    if (!loading) {
      event.currentTarget.form?.requestSubmit();
    }
  }

  async function handleClearHistory() {
    setClearing(true);
    setError("");
    try {
      await clearHistory();
      setDialogOpen(false);
      setHistory([]);
      setReport(emptyReport);
      setSuccess("History cleared successfully.");
      setSuccessSentiment(null);
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Unable to clear history right now."));
    } finally {
      setClearing(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8.75rem)] w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:min-h-[calc(100vh-5.25rem)] sm:gap-6 sm:px-5 sm:py-6 lg:px-7">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-lg border border-border/80 bg-card/88 p-5 shadow-[0_18px_70px_-45px_hsl(var(--primary)/0.65)] backdrop-blur sm:p-6">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-accent/12 blur-3xl" />
          <div className="relative">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI sentiment workspace
            </p>
            <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Turn customer comments into a clear satisfaction signal.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Analyze each feedback, follow sentiment trends, and keep a readable history without leaving the dashboard.
            </p>
          </div>
          <div className="relative mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
            <Metric label="Feedbacks analyzed" value={report.total_feedbacks.toString()} tone="primary" />
            <Metric label="Satisfaction" value={`${report.positive_percentage.toFixed(2)}%`} tone="accent" />
            <Metric label="Positive" value={report.positive_count.toString()} tone="success" />
            <Metric label="Negative" value={report.negative_count.toString()} tone="danger" />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/55 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Analyze Feedback</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Paste one customer comment and get a sentiment label.</p>
              </div>
              <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="text-sm font-semibold" htmlFor="feedback">
                Customer feedback
              </label>
              <Textarea
                id="feedback"
                className="min-h-32 sm:min-h-36"
                maxLength={2000}
                placeholder="Example: The service was fast, but the checkout took too long..."
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                onKeyDown={handleFeedbackKeyDown}
              />
              <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <span className="text-xs text-muted-foreground">{feedback.trim().length}/2000 characters</span>
                <Button className="w-full min-[420px]:w-auto" disabled={loading} type="submit">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? "Analyzing..." : "Analyze Feedback"}
                </Button>
              </div>
            </form>
            {success ? (
              <Alert className={`mt-4 flex items-center gap-2 ${successAlertStyles[successSentiment ?? "Default"]}`}>
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
                Sentiment Distribution
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {dashboardLoading ? "Syncing saved analysis..." : "A quick view of how feedback is trending."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-60 sm:h-64">
              {dashboardLoading ? (
                <ChartSkeleton />
              ) : (
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
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-border/70 bg-surface/45 p-5">
            <div>
              <CardTitle>Recent Feedback</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {dashboardLoading ? "Preparing the latest saved feedback." : "Newest saved analysis appears first."}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!history.length}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear all feedback history?</DialogTitle>
                  <DialogDescription>
                    This removes every saved analysis from the local SQLite database.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-5 flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleClearHistory} disabled={clearing}>
                    {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Clear History
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <div className="max-h-80 space-y-3 overflow-auto pr-1">
                  {dashboardLoading ? (
                    <HistorySkeleton />
                  ) : history.length ? (
                    history.map((item, index) => (
                      <article
                        key={item.id ?? item.feedback}
                        className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm transition duration-200 hover:border-primary/30 hover:bg-surface/45"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <Badge sentiment={item.sentiment}>{item.sentiment}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            #{history.length - index}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.feedback}</p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-primary/30 bg-surface/50 p-6 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold">No feedback history yet</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Analyze your first customer comment to populate this list and update the chart.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="metrics">
                <div className="grid gap-3 min-[420px]:grid-cols-2">
                  <Metric label="Neutral count" value={report.neutral_count.toString()} tone="warning" />
                  <Metric label="Positive percentage" value={`${report.positive_percentage.toFixed(2)}%`} tone="accent" />
                  <Metric label="Positive count" value={report.positive_count.toString()} tone="success" />
                  <Metric label="Negative count" value={report.negative_count.toString()} tone="danger" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </main>
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

function ChartSkeleton() {
  return (
    <div className="flex h-full items-end gap-4 rounded-md border border-border/70 bg-surface/35 px-4 pb-6 pt-8" aria-label="Loading chart">
      {[72, 48, 60].map((height, index) => (
        <div key={height} className="flex flex-1 flex-col items-center justify-end gap-3">
          <div
            className="w-full max-w-20 animate-pulse rounded-t-md bg-gradient-to-t from-primary/28 to-accent/18"
            style={{ height: `${height}%`, animationDelay: `${index * 120}ms` }}
          />
          <span className="h-2 w-16 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading recent feedback">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-md border border-border/70 bg-card/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="h-5 w-20 animate-pulse rounded-full bg-primary/15" />
            <span className="h-3 w-10 animate-pulse rounded-full bg-muted" />
          </div>
          <span className="block h-3 w-full animate-pulse rounded-full bg-muted" />
          <span className="mt-2 block h-3 w-3/4 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
