"use client";

import { AlertCircle, BarChart3, CheckCircle2, Loader2, Trash2 } from "lucide-react";
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

const successAlertStyles: Record<Sentiment | "Default", string> = {
  Positive: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200",
  Neutral: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200",
  Negative: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200",
  Default: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200",
};

export default function Home() {
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState<Analysis[]>([]);
  const [report, setReport] = useState<Report>(emptyReport);
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
    refreshDashboard().catch(() => {
      setError("Could not connect to the sentiment API.");
    });
  }, []);

  const chartData = useMemo(
    () => [
      { name: "Positive", count: report.positive_count, fill: "#12847d" },
      { name: "Neutral", count: report.neutral_count, fill: "#c08a1d" },
      { name: "Negative", count: report.negative_count, fill: "#c94f5d" },
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
      const message = requestError instanceof Error ? requestError.message : "Unable to analyze feedback right now.";
      setError(message);
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
    } catch {
      setError("Unable to clear history right now.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Customer feedback dashboard</p>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              Paste a customer comment to see if it sounds positive, neutral, or negative. Use the dashboard to follow satisfaction and recent feedback over time.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total feedbacks analyzed" value={report.total_feedbacks.toString()} />
            <Metric label="Customer Satisfaction" value={`${report.positive_percentage.toFixed(2)}%`} />
            <Metric label="Positive" value={report.positive_count.toString()} />
            <Metric label="Negative" value={report.negative_count.toString()} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyze Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Textarea
                maxLength={2000}
                placeholder="Paste customer feedback here..."
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                onKeyDown={handleFeedbackKeyDown}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{feedback.trim().length}/2000 characters</span>
                <Button disabled={loading} type="submit">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Analyze Feedback
                </Button>
              </div>
            </form>
            {success ? (
              <Alert className={`mt-4 ${successAlertStyles[successSentiment ?? "Default"]}`}>
                {success}
              </Alert>
            ) : null}
            {error ? (
              <Alert className="mt-4 border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                {error}
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(18, 132, 125, 0.08)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Feedback</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!history.length}>
                  <Trash2 className="h-4 w-4" />
                  Clear History
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
          <CardContent>
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <div className="max-h-96 space-y-3 overflow-auto pr-1">
                  {history.length ? (
                    history.map((item) => (
                      <article key={item.id ?? item.feedback} className="rounded-md border border-border bg-card p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <Badge sentiment={item.sentiment}>{item.sentiment}</Badge>
                          <span className="text-xs text-muted-foreground">#{item.id}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.feedback}</p>
                      </article>
                    ))
                  ) : (
                    <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                      No feedback history yet.
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="metrics">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric label="Neutral count" value={report.neutral_count.toString()} />
                  <Metric label="Positive percentage" value={`${report.positive_percentage.toFixed(2)}%`} />
                  <Metric label="Positive count" value={report.positive_count.toString()} />
                  <Metric label="Negative count" value={report.negative_count.toString()} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/75 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
