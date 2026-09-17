import { cn } from "@/lib/utils";
import { SITES, type SiteId } from "@/lib/inventory/types";

export function SiteToggle({
  value,
  onChange,
}: {
  value: SiteId;
  onChange: (id: SiteId) => void;
}) {
  return (
    <div className="inline-flex h-11 rounded-md border border-border bg-card p-1">
      {SITES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={cn(
            "min-w-16 rounded-sm px-4 text-sm font-medium transition-colors duration-150",
            value === s.id ? "bg-accent text-accent-fg" : "text-muted hover:text-ink",
          )}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
