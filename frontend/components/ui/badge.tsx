import * as React from "react";

import { cn } from "@/lib/utils";

const styles = {
  Positive: "border-success/25 bg-success/12 text-success",
  Neutral: "border-warning/30 bg-warning/14 text-warning",
  Negative: "border-destructive/25 bg-destructive/12 text-destructive",
};

export function Badge({
  sentiment,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { sentiment?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium shadow-none",
        sentiment ? styles[sentiment] : "border-border bg-muted text-foreground",
        className,
      )}
      {...props}
    />
  );
}
