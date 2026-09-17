import { useMemo, useState } from "react";
import { SiteToggle } from "@/components/SiteToggle";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { useInventory } from "@/lib/inventory/store";
import type { SiteId, StockStatus } from "@/lib/inventory/types";
import { isConsumable, stockStatus } from "@/lib/inventory/logic";
import { formatQty } from "@/lib/utils";

const FILTERS: { id: "all" | "food" | StockStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & drink" },
  { id: "OUT", label: "Out" },
  { id: "REORDER", label: "Reorder" },
  { id: "OK", label: "On par" },
];

export function StockPage() {
  const [site, setSite] = useState<SiteId>("bjk");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("food");
  const catalog = useInventory((s) => s.catalog);
  const snap = useInventory((s) => s.snapshots[site]);

  const rows = useMemo(() => {
    return catalog
      .map((item) => ({
        item,
        onHand: snap?.rows[item.name],
        status: stockStatus(item, site, snap?.rows[item.name]),
      }))
      .filter(({ item, status }) => {
        if (filter === "food" && !isConsumable(item)) return false;
        if (filter !== "all" && filter !== "food" && status !== filter) return false;
        if (query) {
          const q = query.toLowerCase();
          if (!item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      });
  }, [catalog, snap, site, query, filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Ledger</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Stock</h1>
          <p className="mt-2 max-w-xl text-muted">
            Every SKU from the last upload, compared to par. String reels can be half-units.
          </p>
        </div>
        <SiteToggle value={site} onChange={setSite} />
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`h-11 rounded-md px-3 text-sm ${
                filter === f.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-accent-soft"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-bg/80 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">On hand</th>
              <th className="px-4 py-3 font-medium text-right">Reorder</th>
              <th className="px-4 py-3 font-medium text-right">Target</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ item, onHand, status }) => (
              <tr key={item.name} className="hover:bg-bg/40">
                <td className="px-4 py-2.5 font-medium">{item.name}</td>
                <td className="px-4 py-2.5 text-muted">{item.category}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                  {onHand ? formatQty(onHand.qty) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted">
                  {item.sites[site].reorderPoint || "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted">
                  {item.sites[site].target || "—"}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted">{rows.length} items</p>
    </div>
  );
}
