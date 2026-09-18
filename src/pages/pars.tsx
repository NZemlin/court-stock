import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/lib/inventory/store";
import { isFoodDrink, isSeparateVendor } from "@/lib/inventory/types";
import { downloadText } from "@/lib/utils";
import type { SiteId } from "@/lib/inventory/types";


export function ParsPage() {
  const [query, setQuery] = useState("");
  const [foodOnly, setFoodOnly] = useState(true);
  const catalog = useInventory((s) => s.catalog);
  const updatePar = useInventory((s) => s.updatePar);
  const updateItemMeta = useInventory((s) => s.updateItemMeta);
  const resetParsToSeed = useInventory((s) => s.resetParsToSeed);
  const exportBackup = useInventory((s) => s.exportBackup);
  const importBackup = useInventory((s) => s.importBackup);
  const hydrateSeed = useInventory((s) => s.hydrateSeed);

  const rows = useMemo(
    () =>
      catalog.filter((i) => {
        if (isSeparateVendor(i)) return false;
        if (foodOnly && !isFoodDrink(i)) return false;
        if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [catalog, foodOnly, query],
  );

  function onImport(file: File) {
    void file.text().then((t) => {
      try {
        importBackup(t);
        toast.success("Backup restored");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Import failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Master list</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Par levels</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Reorder when on-hand is below the point; order up to target, in pack-size multiples.
          Ice cream, Barebells, LMNT, NOCCO, and pickle bars are separate vendors — totals live
          on the board, not here.
        </p>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          placeholder="Search items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:max-w-xs"
        />
        <label className="flex h-11 items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={foodOnly}
            onChange={(e) => setFoodOnly(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          Food & drink only
        </label>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <Button
            variant="secondary"
            onClick={() => {
              downloadText("btg-stock-backup.json", exportBackup(), "application/json");
              toast.success("Backup downloaded");
            }}
          >
            Export backup
          </Button>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-md border border-border bg-card px-4 text-sm font-medium">
            Import backup
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
          </label>
          <Button
            variant="secondary"
            onClick={() => {
              resetParsToSeed();
              toast.success("Pars reset to starter values");
            }}
          >
            Reset pars
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              hydrateSeed();
              toast.success("Reloaded Sep 17 sample stock");
            }}
          >
            Reload sample CSVs
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-border bg-bg/80 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Pack</th>
              <th className="px-4 py-3 font-medium text-right" colSpan={2}>
                BJK
              </th>
              <th className="px-4 py-3 font-medium text-right" colSpan={2}>
                ELDO
              </th>
              <th className="px-4 py-3 font-medium">Instacart search</th>
            </tr>
            <tr className="border-b border-border text-[10px] uppercase tracking-wide text-subtle">
              <th />
              <th />
              <th className="px-4 py-1 text-right font-medium">Min</th>
              <th className="px-4 py-1 text-right font-medium">Target</th>
              <th className="px-4 py-1 text-right font-medium">Min</th>
              <th className="px-4 py-1 text-right font-medium">Target</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((item) => (
              <tr key={item.name}>
                <td className="px-4 py-2">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted">{item.category}</div>
                </td>
                <td className="px-4 py-2">
                  <Num
                    value={item.packSize}
                    onChange={(n) => updateItemMeta(item.name, { packSize: n })}
                  />
                </td>
                <ParCells name={item.name} site="bjk" item={item} onChange={updatePar} />
                <ParCells name={item.name} site="eldo" item={item} onChange={updatePar} />
                <td className="px-4 py-2">
                  <Input
                    className="h-10"
                    value={item.instacartQuery}
                    onChange={(e) =>
                      updateItemMeta(item.name, { instacartQuery: e.target.value })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParCells({
  name,
  site,
  item,
  onChange,
}: {
  name: string;
  site: SiteId;
  item: { sites: Record<SiteId, { reorderPoint: number; target: number }> };
  onChange: (name: string, site: SiteId, patch: { reorderPoint?: number; target?: number }) => void;
}) {
  return (
    <>
      <td className="px-2 py-2">
        <Num
          value={item.sites[site].reorderPoint}
          onChange={(n) => onChange(name, site, { reorderPoint: n })}
        />
      </td>
      <td className="px-2 py-2">
        <Num
          value={item.sites[site].target}
          onChange={(n) => onChange(name, site, { target: n })}
        />
      </td>
    </>
  );
}

function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <Input
      inputMode="decimal"
      className="h-10 w-20 text-right font-mono tabular-nums"
      value={Number.isFinite(value) ? String(value) : ""}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (!Number.isNaN(n)) onChange(n);
      }}
    />
  );
}
