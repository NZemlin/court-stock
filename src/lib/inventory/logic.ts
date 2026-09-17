import type {
  CatalogItem,
  OnHand,
  OrderChannel,
  ReorderLine,
  SiteId,
  StockStatus,
  VarianceRow,
} from "./types";
import { isFoodDrink } from "./types";

export function stockStatus(item: CatalogItem, site: SiteId, onHand?: OnHand): StockStatus {
  if (item.orderChannel === "none" || !item.trackQty) return "UNTRACKED";
  const par = item.sites[site];
  if (!par || par.target <= 0) return "UNTRACKED";
  const qty = onHand?.qty ?? 0;
  if (qty <= 0) return "OUT";
  if (qty < par.reorderPoint) return "REORDER";
  if (qty < par.target) return "LOW";
  return "OK";
}

export function orderQty(item: CatalogItem, site: SiteId, qty: number): number {
  const target = item.sites[site]?.target ?? 0;
  const pack = Math.max(item.packSize || 1, 1);
  const raw = Math.max(target - qty, 0);
  const packs = Math.ceil(raw / pack);
  return packs * pack;
}

export function needsOrder(item: CatalogItem, site: SiteId, qty: number): boolean {
  if (item.orderChannel === "none" || item.orderChannel === "vendor") return false;
  const par = item.sites[site];
  if (!par || par.target <= 0) return false;
  return qty < par.reorderPoint;
}

export function buildReorderList(
  items: CatalogItem[],
  site: SiteId,
  onHand: Record<string, OnHand>,
  channel?: OrderChannel,
): ReorderLine[] {
  const lines: ReorderLine[] = [];
  for (const item of items) {
    if (channel && item.orderChannel !== channel) continue;
    const rec = onHand[item.name];
    if (!rec) continue;
    if (!needsOrder(item, site, rec.qty)) continue;
    const qty = orderQty(item, site, rec.qty);
    if (qty <= 0) continue;
    lines.push({
      name: item.name,
      category: item.category,
      onHand: rec.qty,
      reorderPoint: item.sites[site].reorderPoint,
      target: item.sites[site].target,
      packSize: item.packSize,
      orderQty: qty,
      unitCost: rec.cost || item.cost,
      estCost: qty * (rec.cost || item.cost),
      channel: item.orderChannel,
      instacartQuery: item.instacartQuery || item.name,
    });
  }
  lines.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return lines;
}

export function instacartPayload(site: SiteId, lines: ReorderLine[]) {
  const insta = lines.filter((l) => l.channel === "instacart");
  return {
    title: `${site.toUpperCase()} pro shop restock ${new Date().toISOString().slice(0, 10)}`,
    link_type: "shopping_list",
    expires_in: 7,
    instructions: [
      "Prefer Smart & Final when available.",
      "Match quantities as closely as possible.",
      "Ice cream is a separate vendor — do not add it here.",
    ],
    line_items: insta.map((l) => ({
      name: l.instacartQuery,
      line_item_measurements: [{ quantity: l.orderQty, unit: "each" }],
      display_text: `${l.name} (POS restock for ${site.toUpperCase()})`,
    })),
  };
}

export function pasteList(lines: ReorderLine[]): string {
  return lines
    .filter((l) => l.channel === "instacart")
    .map((l) => `${String(l.orderQty).padStart(4, " ")}  ${l.instacartQuery}`)
    .join("\n");
}

export function buildVariances(
  items: CatalogItem[],
  onHand: Record<string, OnHand>,
  counts: Record<string, { counted: number | ""; notes: string }>,
): VarianceRow[] {
  const rows: VarianceRow[] = [];
  for (const item of items) {
    const entry = counts[item.name];
    if (!entry || entry.counted === "") continue;
    const rec = onHand[item.name];
    const sys = rec?.qty ?? 0;
    const counted = Number(entry.counted);
    const variance = counted - sys;
    const price = rec?.price ?? item.price;
    const cost = rec?.cost ?? item.cost;
    rows.push({
      name: item.name,
      category: item.category,
      systemQty: sys,
      counted,
      variance,
      notes: entry.notes || "",
      price,
      cost,
      retailImpact: variance * price,
      cogsImpact: variance * cost,
      systemState: rec?.state ?? "unknown",
    });
  }
  rows.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance) || a.name.localeCompare(b.name));
  return rows;
}

/** @deprecated use isFoodDrink — kept so existing imports keep working */
export function isConsumable(item: CatalogItem): boolean {
  return isFoodDrink(item);
}
