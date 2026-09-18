import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteToggle } from "@/components/SiteToggle";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/lib/inventory/store";
import type { SiteId } from "@/lib/inventory/types";
import { buildReorderList, instacartPayload, pasteList } from "@/lib/inventory/logic";
import { downloadText, formatMoney, formatQty } from "@/lib/utils";


export function ReorderPage() {
  const [site, setSite] = useState<SiteId>("eldo");
  const catalog = useInventory((s) => s.catalog);
  const snap = useInventory((s) => s.snapshots[site]);
  const lines = useMemo(
    () => (snap ? buildReorderList(catalog, site, snap.rows) : []),
    [catalog, site, snap],
  );
  const insta = lines.filter((l) => l.channel === "instacart");
  const total = insta.reduce((a, l) => a + l.estCost, 0);

  function copyList() {
    const text = pasteList(lines);
    void navigator.clipboard.writeText(text);
    toast.success("Copied Instacart paste list");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Restock</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Order list</h1>
          <p className="mt-2 max-w-xl text-muted">
            Items below reorder point, rounded up to pack size. Copy the list into Instacart, or
            download the payload if you have a developer key. Ice cream, Barebells, LMNT, and
            NOCCO are separate vendors and stay off this list.
          </p>
        </div>
        <SiteToggle value={site} onChange={setSite} />
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">
          <span className="font-medium text-ink tabular-nums">{insta.length}</span> Instacart
          lines · {formatMoney(total)} est. cost
        </p>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <Button variant="secondary" onClick={copyList} disabled={!insta.length}>
            Copy list
          </Button>
          <Button
            variant="secondary"
            disabled={!insta.length}
            onClick={() =>
              downloadText(
                `reorder_${site}_${new Date().toISOString().slice(0, 10)}.txt`,
                pasteList(lines),
              )
            }
          >
            Download .txt
          </Button>
          <Button
            disabled={!insta.length}
            onClick={() =>
              downloadText(
                `instacart_payload_${site}.json`,
                JSON.stringify(instacartPayload(site, lines), null, 2),
                "application/json",
              )
            }
          >
            Instacart JSON
          </Button>
        </div>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-muted">
          Nothing below par at {site.toUpperCase()}. Raise a reorder point on Pars, or upload a
          fresher CSV.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">On hand</th>
                <th className="px-4 py-3 font-medium text-right">Reorder at</th>
                <th className="px-4 py-3 font-medium text-right">Target</th>
                <th className="px-4 py-3 font-medium text-right">Order</th>
                <th className="px-4 py-3 font-medium text-right">Est. cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((l) => (
                <tr key={l.name} className="hover:bg-bg/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted">{l.instacartQuery}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{l.category}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatQty(l.onHand)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatQty(l.reorderPoint)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatQty(l.target)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">
                    {l.orderQty}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {l.estCost ? formatMoney(l.estCost) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
