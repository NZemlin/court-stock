import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Upload } from "lucide-react";
import { useInventory } from "@/lib/inventory/store";
import { SITES, isFoodDrink, isIceCream, isSeparateVendor, type SiteId } from "@/lib/inventory/types";
import { buildReorderList, stockStatus } from "@/lib/inventory/logic";
import { formatQty } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

export function Home() {
  const catalog = useInventory((s) => s.catalog);
  const snapshots = useInventory((s) => s.snapshots);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Desk</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">
            On hand
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Upload a ClubAutomation retail export, recount the cooler, and build a Smart &
            Final list when drinks or snacks drop below par.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/upload">
              <Upload /> Upload CSV
            </Link>
          </Button>
          <Button asChild>
            <Link to="/reorder">
              <ShoppingCart /> Order list
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {SITES.map((site) => (
          <SiteCard key={site.id} site={site.id} name={site.name} />
        ))}
      </div>

      <VendorPanel />

      <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Needs ordering</h2>
          <Link to="/reorder" className="flex items-center gap-1 text-sm text-accent">
            Full list <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {SITES.map((site) => {
            const snap = snapshots[site.id];
            const lines = snap
              ? buildReorderList(catalog.filter(isFoodDrink), site.id, snap.rows)
              : [];
            return (
              <div key={site.id}>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  {site.name}
                </p>
                {lines.length === 0 ? (
                  <p className="text-sm text-muted">Nothing below par.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {lines.slice(0, 8).map((l) => (
                      <li key={l.name} className="flex items-baseline justify-between gap-3 py-2">
                        <span className="min-w-0 truncate text-sm">{l.name}</span>
                        <span className="shrink-0 font-mono text-sm tabular-nums text-muted">
                          {formatQty(l.onHand)} → {l.orderQty}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function VendorPanel() {
  const catalog = useInventory((s) => s.catalog);
  const snapshots = useInventory((s) => s.snapshots);
  const ice = catalog.filter(isIceCream);
  const cooler = catalog
    .filter((i) => isSeparateVendor(i) && !isIceCream(i))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (ice.length === 0 && cooler.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-medium">Separate vendors</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Ice cream, Barebells, LMNT, and NOCCO — on-hand totals only. Not on Pars or the
            Instacart list.
          </p>
        </div>
        <Link to="/stock" className="text-sm text-accent">
          View in stock
        </Link>
      </div>

      {ice.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Ice cream</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {SITES.map((site) => {
              const snap = snapshots[site.id];
              let inStock = 0;
              let units = 0;
              for (const item of ice) {
                const qty = snap?.rows[item.name]?.qty ?? 0;
                units += qty;
                if (qty > 0) inStock += 1;
              }
              return (
                <div key={site.id} className="rounded-md bg-bg px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                    {site.name}
                  </p>
                  <p className="mt-1 font-display text-2xl font-medium tabular-nums">
                    {inStock}
                    <span className="text-lg text-muted">/{ice.length}</span>
                  </p>
                  <p className="text-sm text-muted">
                    flavors in stock · {formatQty(units)} units
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {cooler.length > 0 ? (
        <div className={ice.length > 0 ? "mt-6" : "mt-4"}>
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Barebells · LMNT · NOCCO
          </h3>
          <div className="mt-2 overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Item</th>
                  {SITES.map((s) => (
                    <th key={s.id} className="px-4 py-2 text-right font-medium">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cooler.map((item) => (
                  <tr key={item.name}>
                    <td className="px-4 py-2.5 font-medium">{item.name}</td>
                    {SITES.map((s) => {
                      const qty = snapshots[s.id]?.rows[item.name]?.qty ?? 0;
                      return (
                        <td key={s.id} className="px-4 py-2.5 text-right">
                          {qty <= 0 ? (
                            <span className="text-muted">Out</span>
                          ) : (
                            <span className="font-mono tabular-nums">{formatQty(qty)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SiteCard({ site, name }: { site: SiteId; name: string }) {
  const catalog = useInventory((s) => s.catalog);
  const snap = useInventory((s) => s.snapshots[site]);
  const food = catalog.filter(isFoodDrink);
  let out = 0;
  let reorder = 0;
  let ok = 0;
  for (const item of food) {
    const st = stockStatus(item, site, snap?.rows[item.name]);
    if (st === "OUT") out += 1;
    else if (st === "REORDER") reorder += 1;
    else if (st === "OK" || st === "LOW") ok += 1;
  }
  const uploaded = snap
    ? new Date(snap.uploadedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No file";

  const worst = food
    .map((item) => ({
      item,
      status: stockStatus(item, site, snap?.rows[item.name]),
      qty: snap?.rows[item.name]?.qty ?? 0,
    }))
    .filter((x) => x.status === "OUT" || x.status === "REORDER")
    .slice(0, 5);

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium">{name}</h2>
          <p className="mt-1 text-sm text-muted">
            {snap?.fileName ?? "Waiting for export"} · {uploaded}
          </p>
        </div>
        <StatusBadge status={out > 0 ? "OUT" : reorder > 0 ? "REORDER" : "OK"} />
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Out" value={out} />
        <Stat label="Reorder" value={reorder} />
        <Stat label="On par" value={ok} />
      </dl>
      {worst.length > 0 ? (
        <ul className="mt-5 space-y-2 border-t border-border pt-4">
          {worst.map((x) => (
            <li key={x.item.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{x.item.name}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-muted">{formatQty(x.qty)}</span>
                <StatusBadge status={x.status} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-bg px-3 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-2xl font-medium tabular-nums">{value}</dd>
    </div>
  );
}
