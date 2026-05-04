import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, Eraser, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: MessageSquareText,
    title: "Write or paste a customer comment",
    text: "Use the text box on the dashboard for one piece of feedback at a time. It can be a compliment, a complaint, or a mixed comment.",
  },
  {
    icon: CheckCircle2,
    title: "Click Analyze Feedback",
    text: "The system reads the comment and labels it as Positive, Neutral, or Negative.",
  },
  {
    icon: BarChart3,
    title: "Review the dashboard",
    text: "The numbers and chart update so you can see how customer satisfaction is changing.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <Button asChild variant="ghost" className="mb-5 px-0">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">A simple guide for reading customer feedback</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          This app helps you quickly understand whether customer comments sound happy, mixed, or unhappy. You do not need to know how the technology works to use it.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>What the labels mean</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Meaning sentiment="Positive" text="The customer sounds satisfied, thankful, or happy with the experience." />
            <Meaning sentiment="Neutral" text="The comment is mixed, unclear, or does not strongly sound happy or unhappy." />
            <Meaning sentiment="Negative" text="The customer sounds frustrated, disappointed, or unhappy with the experience." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              How to read the dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              <strong className="text-foreground">Total feedbacks analyzed</strong> shows how many comments are saved.
            </p>
            <p>
              <strong className="text-foreground">Customer Satisfaction</strong> shows the percentage of saved comments that were marked Positive.
            </p>
            <p>
              The bar chart compares Positive, Neutral, and Negative comments so patterns are easier to spot.
            </p>
            <p>
              Recent Feedback keeps the latest comments visible, with a label beside each one.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eraser className="h-5 w-5 text-primary" />
            Clearing history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Use Clear History when you want to remove all saved feedback and start fresh. The app asks for confirmation first so you do not erase the history by accident.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function Meaning({ sentiment, text }: { sentiment: "Positive" | "Neutral" | "Negative"; text: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <Badge sentiment={sentiment}>{sentiment}</Badge>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
