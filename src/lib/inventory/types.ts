export type SiteId = "bjk" | "eldo";
export type StockState = "available" | "out_of_stock" | "unavailable" | "unknown";
export type OrderChannel = "instacart" | "vendor" | "none";
export type StockStatus = "OUT" | "REORDER" | "LOW" | "OK" | "UNTRACKED";

export const SITES: { id: SiteId; name: string; short: string }[] = [
  { id: "bjk", name: "BJK", short: "BJK" },
  { id: "eldo", name: "ELDO", short: "ELDO" },
];

export const CONSUMABLE_CATEGORIES = new Set(["Snacks", "Drinks", "Ice Cream"]);

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
