import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteToggle } from "@/components/SiteToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/lib/inventory/store";
import type { SiteId } from "@/lib/inventory/types";
import { buildVariances } from "@/lib/inventory/logic";
import { downloadText, formatQty, formatSignedMoney } from "@/lib/utils";

export function RecountPage() {
  const [site, setSite] = useState<SiteId>("bjk");
  const [query, setQuery] = useState("");
  const [onlyDiff, setOnlyDiff] = useState(false);
  const catalog = useInventory((s) => s.catalog);
  const snap = useInventory((s) => s.snapshots[site]);
  const counts = useInventory((s) => s.recount[site]);
  const setCount = useInventory((s) => s.setCount);
  const clearRecount = useInventory((s) => s.clearRecount);

  const tracked = catalog.filter((i) => i.trackQty);
  const filtered = tracked.filter((i) => {
    if (query && !i.name.toLowerCase().includes(query.toLowerCase()) && !i.category.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });

  const variances = useMemo(
    () => (snap ? buildVariances(catalog, snap.rows, counts) : []),
    [catalog, snap, counts],
  );
  const diffs = variances.filter((v) => v.variance !== 0);
  const filled = variances.length;
  const retail = diffs.reduce((a, v) => a + v.retailImpact, 0);
  const cogs = diffs.reduce((a, v) => a + v.cogsImpact, 0);

  const visible = onlyDiff
    ? filtered.filter((i) => {
        const c = counts[i.name];
        if (!c || c.counted === "") return false;
        const sys = snap?.rows[i.name]?.qty ?? 0;
        return Number(c.counted) !== sys;
      })
    : filtered;

  function exportAdjustments() {
    const payload = {
      site,
      counted_on: new Date().toISOString().slice(0, 10),
      file: snap?.fileName,
      adjustments: diffs.map((r) => ({
        item_name: r.name,
        system_qty: r.systemQty,
        counted_qty: r.counted,
        delta: r.variance,
        reason: "physical_recount",
      })),
    };
    downloadText(
      `recount_${site}_${payload.counted_on}.adjustments.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    const csv = [
      "Item Name,System qty,Counted,Change,Reason",
      ...diffs.map(
        (r) =>
          `"${r.name.replace(/"/g, '""')}",${r.systemQty},${r.counted},${r.variance},Physical recount`,
      ),
    ].join("\n");
    downloadText(`recount_${site}_${payload.counted_on}.csv`, csv, "text/csv");
    toast.success("Downloaded POS adjustment files");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Physical</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Recount</h1>
          <p className="mt-2 max-w-xl text-muted">
            Walk the cooler and pro shop. Type what you see. Blank rows are skipped. Then
            download the adjustment list for CourtReserve stock adjustment.
          </p>
        </div>
        <SiteToggle value={site} onChange={setSite} />
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Counted" value={String(filled)} />
        <Metric label="Differences" value={String(diffs.length)} />
        <Metric label="Retail impact" value={formatSignedMoney(retail)} />
        <Metric label="Cost impact" value={formatSignedMoney(cogs)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <label className="flex h-11 items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlyDiff}
            onChange={(e) => setOnlyDiff(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          Differences only
        </label>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Button variant="secondary" onClick={() => clearRecount(site)}>
            Clear counts
          </Button>
          <Button onClick={exportAdjustments} disabled={!diffs.length}>
            Download adjustments
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-border bg-bg/80 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">System</th>
              <th className="px-4 py-3 font-medium">Counted</th>
              <th className="px-4 py-3 font-medium text-right">Δ</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((item) => {
              const sys = snap?.rows[item.name]?.qty ?? 0;
              const entry = counts[item.name];
              const counted = entry?.counted ?? "";
              const delta =
                counted === "" ? null : Number(counted) - sys;
              return (
                <tr key={item.name} className="hover:bg-bg/40">
                  <td className="px-4 py-2 font-medium">{item.name}</td>
                  <td className="px-4 py-2 text-muted">{item.category}</td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-muted">
                    {formatQty(sys)}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      inputMode="decimal"
                      className="h-10 w-24 bg-warn-soft/40 font-mono tabular-nums"
                      value={counted}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          setCount(site, item.name, { counted: "" });
                          return;
                        }
                        const n = Number(v);
                        if (!Number.isNaN(n)) setCount(site, item.name, { counted: n });
                      }}
                    />
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-mono tabular-nums ${
                      delta == null
                        ? "text-subtle"
                        : delta > 0
                          ? "text-ok"
                          : delta < 0
                            ? "text-danger"
                            : "text-muted"
                    }`}
                  >
                    {delta == null ? "—" : `${delta > 0 ? "+" : ""}${formatQty(delta)}`}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      className="h-10"
                      placeholder="Damaged, back room…"
                      value={entry?.notes ?? ""}
                      onChange={(e) => setCount(site, item.name, { notes: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
