import * as React from "react";

import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn("rounded-xl border border-border bg-card/90 px-4 py-3 text-sm shadow-none", className)}
      {...props}
    />
  );
}
