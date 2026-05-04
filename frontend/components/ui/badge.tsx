import * as React from "react";

import { cn } from "@/lib/utils";

const styles = {
  Positive: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Neutral: "bg-amber-100 text-amber-800 border-amber-200",
  Negative: "bg-rose-100 text-rose-800 border-rose-200",
};

export function Badge({
  sentiment,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { sentiment?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        sentiment ? styles[sentiment] : "border-border bg-muted text-foreground",
        className,
      )}
      {...props}
    />
  );
}
