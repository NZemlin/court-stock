export type SiteId = "bjk" | "eldo";
export type StockState = "available" | "out_of_stock" | "unavailable" | "unknown";
export type OrderChannel = "instacart" | "vendor" | "none";
export type StockStatus = "OUT" | "REORDER" | "LOW" | "OK" | "UNTRACKED";
export type RecountScope = "desk" | "full";

export const SITES: { id: SiteId; name: string; short: string }[] = [
  { id: "bjk", name: "BJK", short: "BJK" },
  { id: "eldo", name: "ELDO", short: "ELDO" },
];

/** Snacks & drinks for Instacart / Smart & Final. Separate-vendor SKUs are excluded. */
export const FOOD_DRINK_CATEGORIES = new Set(["Snacks", "Drinks"]);

/** Walk-the-desk recount: small goods, not bags/shoes/racquets/apparel. */
export const DESK_CATEGORIES = new Set(["String", "Snacks", "Drinks", "Ice Cream", "Balls"]);

const APPAREL_NAME = /\b(hat|visor|hoodie|polo|cap|wristband)\b/i;
const SKIP_DESK_NAME = /\b(labor|rental|hopper)\b/i;
const VENDOR_NAME = /\b(barebells|lmnt|nocco)\b/i;

export function isIceCream(item: { category: string }): boolean {
  return item.category === "Ice Cream";
}

/** Ice cream, Barebells, LMNT, NOCCO — not Instacart, not Pars. */
export function isSeparateVendor(item: { name: string; category: string }): boolean {
  if (isIceCream(item)) return true;
  return VENDOR_NAME.test(item.name);
}

export function isFoodDrink(item: { name: string; category: string }): boolean {
  if (isSeparateVendor(item)) return false;
  return FOOD_DRINK_CATEGORIES.has(item.category);
}

export function isDeskRecount(item: { name: string; category: string }): boolean {
  if (SKIP_DESK_NAME.test(item.name)) return false;
  if (DESK_CATEGORIES.has(item.category)) return true;
  if (item.category === "Accessories" && !APPAREL_NAME.test(item.name)) return true;
  return false;
}

export interface SitePar {
  reorderPoint: number;
  target: number;
}

export interface OnHand {
  qty: number;
  state: StockState;
  availabilityRaw: string;
  price: number;
  cost: number;
}

export interface CatalogItem {
  name: string;
  category: string;
  upc: string;
  itemNumber: string;
  price: number;
  cost: number;
  trackQty: boolean;
  orderChannel: OrderChannel;
  instacartQuery: string;
  packSize: number;
  sites: Record<SiteId, SitePar>;
}

export interface Snapshot {
  site: SiteId;
  uploadedAt: string;
  fileName: string;
  rows: Record<string, OnHand>;
}

export interface RecountEntry {
  counted: number | "";
  notes: string;
}

export interface ParsedCsvRow {
  name: string;
  upc: string;
  itemNumber: string;
  size: string;
  color: string;
  category: string;
  price: number;
  cost: number;
  availabilityRaw: string;
  qty: number;
  stockState: StockState;
  status: string;
}

export interface ReorderLine {
  name: string;
  category: string;
  onHand: number;
  reorderPoint: number;
  target: number;
  packSize: number;
  orderQty: number;
  unitCost: number;
  estCost: number;
  channel: OrderChannel;
  instacartQuery: string;
}

export interface VarianceRow {
  name: string;
  category: string;
  systemQty: number;
  counted: number;
  variance: number;
  notes: string;
  price: number;
  cost: number;
  retailImpact: number;
  cogsImpact: number;
  systemState: StockState;
}
