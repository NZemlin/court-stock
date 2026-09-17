import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatQty(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function formatMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
  if (n < 0) return `−${abs}`;
  return abs;
}

export function formatSignedMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
  if (n < 0) return `−${abs}`;
  if (n > 0) return `+${abs}`;
  return abs;
}

export function downloadText(filename: string, text: string, mime = "text/plain"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
