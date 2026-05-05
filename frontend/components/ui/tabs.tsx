"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-md border border-border/70 bg-muted/75 p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  onClick,
  onKeyDown,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;
  const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, "-");

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    const tabs = Array.from(event.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0) return;

    event.preventDefault();
    const lastIndex = tabs.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (currentIndex - 1 + tabs.length) % tabs.length
            : (currentIndex + 1) % tabs.length;

    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  }

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${safeValue}`}
      aria-controls={`panel-${safeValue}`}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={cn(
        "rounded-sm px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:bg-card/45 hover:text-foreground",
        className,
      )}
      onClick={(event) => {
        context?.setValue(value);
        onClick?.(event);
      }}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, "-");
  return <div role="tabpanel" id={`panel-${safeValue}`} aria-labelledby={`tab-${safeValue}`} className={cn("mt-4", className)} {...props} />;
}
