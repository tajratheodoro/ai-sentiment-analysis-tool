import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, Eraser, MessageSquareText, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: MessageSquareText,
    title: "Write or paste a customer comment",
    text: "Use the dashboard text box for one piece of feedback at a time. It can be a compliment, a complaint, or a mixed comment.",
  },
  {
    icon: CheckCircle2,
    title: "Analyze the feedback",
    text: "The system reads the comment and labels it as Positive, Neutral, or Negative.",
  },
  {
    icon: BarChart3,
    title: "Review the dashboard",
    text: "Metrics, chart, and history update so you can follow how customer satisfaction is changing.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8.75rem)] w-full max-w-5xl flex-col gap-5 px-3 py-5 sm:min-h-[calc(100vh-5.25rem)] sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <section className="relative overflow-hidden rounded-lg border border-border/80 bg-card/88 p-5 shadow-[0_18px_70px_-45px_hsl(var(--primary)/0.65)] backdrop-blur sm:p-7">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/12 blur-3xl" />
        <div className="relative">
          <Button asChild variant="ghost" className="mb-5 px-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            How it works
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            A clear guide for reading customer feedback
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            This app helps you quickly understand whether customer comments sound happy, mixed, or unhappy. You do not need to know the technical details to use the dashboard.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="group overflow-hidden">
              <CardHeader>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/45">
            <CardTitle>What the labels mean</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <Meaning
              sentiment="Positive"
              text="The customer sounds satisfied, thankful, or happy with the experience."
              words="Common signals include excellent, great, love, perfect, fast, helpful, amazing, satisfied, and thank you."
            />
            <Meaning
              sentiment="Neutral"
              text="The comment is mixed, unclear, or does not strongly sound happy or unhappy."
              words="Balanced comments often use words such as okay, fine, average, decent, normal, maybe, or mixed. The word but matters because it often changes the direction of a sentence, such as 'the app is good, but the checkout is slow.'"
            />
            <Meaning
              sentiment="Negative"
              text="The customer sounds frustrated, disappointed, or unhappy with the experience."
              words="Warning signals include bad, terrible, slow, broken, disappointed, hate, difficult, problem, issue, refund, and never."
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-surface/45">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              How to read the dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
            <DashboardGuide
              title="Feedback form"
              text="Paste one customer comment and press Analyze Feedback. You can also press Enter to send it, or Shift+Enter for a new line."
            />
            <DashboardGuide
              title="Result message"
              text="After analysis, the message shows the selected label with a matching success, warning, or error color."
            />
            <DashboardGuide
              title="Metric cards"
              text="The top cards summarize volume, satisfaction, positive feedback, and negative feedback."
            />
            <DashboardGuide
              title="Sentiment counts"
              text="Positive, Neutral, and Negative counts show how many comments are in each group."
            />
            <DashboardGuide
              title="Bar chart"
              text="The chart compares the three groups side by side. The tallest bar shows what appears most often."
            />
            <DashboardGuide
              title="Recent Feedback"
              text="The history list shows saved comments from newest to oldest, with a readable sentiment badge."
            />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-surface/45">
          <CardTitle className="flex items-center gap-2">
            <Eraser className="h-5 w-5 text-primary" />
            Clearing history
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            Use Clear History when you want to remove all saved feedback and start fresh. The app asks for confirmation first so you do not erase history by accident.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function Meaning({
  sentiment,
  text,
  words,
}: {
  sentiment: "Positive" | "Neutral" | "Negative";
  text: string;
  words: string;
}) {
  return (
    <div className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm transition duration-200 hover:border-primary/30 hover:bg-surface/45">
      <Badge sentiment={sentiment}>{sentiment}</Badge>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{words}</p>
    </div>
  );
}

function DashboardGuide({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-border/75 bg-card/80 p-4 shadow-sm transition duration-200 hover:border-primary/30 hover:bg-surface/45">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2">{text}</p>
    </div>
  );
}
