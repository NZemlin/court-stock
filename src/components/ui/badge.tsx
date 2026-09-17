import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/inventory/types";

const tones: Record<string, string> = {
  OUT: "bg-danger-soft text-danger",
  REORDER: "bg-warn-soft text-warn",
  LOW: "bg-warn-soft/70 text-warn",
  OK: "bg-ok-soft text-ok",
  UNTRACKED: "bg-border/50 text-muted",
};

export function StatusBadge({ status }: { status: StockStatus }) {
  const label =
    status === "OUT"
      ? "Out"
      : status === "REORDER"
        ? "Reorder"
        : status === "LOW"
          ? "Below target"
          : status === "OK"
            ? "On par"
            : "—";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium tracking-wide",
        tones[status],
      )}
    >
      {label}
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full bg-accent-soft px-2.5 text-xs font-medium text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
