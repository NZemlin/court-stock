import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CatalogItem,
  OnHand,
  RecountEntry,
  SiteId,
  SitePar,
  Snapshot,
} from "./types";
import { isSeparateVendor } from "./types";
import { parseRetailCsv } from "./parse";
import type { ParsedCsvRow } from "./types";
import { DEFAULT_PARS, INSTACART_QUERIES, seedExportedOn } from "./defaults";

export { seedExportedOn };

const ZERO_PAR: SitePar = { reorderPoint: 0, target: 0 };

function emptySnapshots(): Record<SiteId, Snapshot | null> {
  return { bjk: null, eldo: null };
}

function emptyRecount(): Record<SiteId, Record<string, RecountEntry>> {
  return { bjk: {}, eldo: {} };
}

function applyVendorChannel(item: CatalogItem): CatalogItem {
  if (!isSeparateVendor(item)) return item;
  return {
    ...item,
    orderChannel: "vendor",
    sites: { bjk: { ...ZERO_PAR }, eldo: { ...ZERO_PAR } },
  };
}

function applyDefaults(item: CatalogItem): CatalogItem {
  const pars = DEFAULT_PARS[item.name];
  const vendor = isSeparateVendor(item);
  const foodDrink = item.category === "Snacks" || item.category === "Drinks";
  const par: SitePar = vendor
    ? { ...ZERO_PAR }
    : pars
      ? { reorderPoint: pars.reorderPoint, target: pars.target }
      : { ...ZERO_PAR };
  return applyVendorChannel({
    ...item,
    orderChannel: vendor ? "vendor" : foodDrink ? "instacart" : "none",
    instacartQuery: INSTACART_QUERIES[item.name] || item.name,
    packSize: vendor ? 1 : pars?.packSize || 1,
    sites: { bjk: { ...par }, eldo: { ...par } },
  });
}

function mergeCsvIntoCatalog(catalog: CatalogItem[], rows: ParsedCsvRow[]): CatalogItem[] {
  const byName = new Map(catalog.map((i) => [i.name, i]));
  for (const r of rows) {
    const existing = byName.get(r.name);
    if (existing) {
      byName.set(
        r.name,
        applyVendorChannel({
          ...existing,
          category: r.category || existing.category,
          upc: r.upc || existing.upc,
          itemNumber: r.itemNumber || existing.itemNumber,
          price: r.price || existing.price,
          cost: r.cost || existing.cost,
        }),
      );
    } else {
      byName.set(
        r.name,
        applyDefaults({
          name: r.name,
          category: r.category,
          upc: r.upc,
          itemNumber: r.itemNumber,
          price: r.price,
          cost: r.cost,
          trackQty: !["Parks & Rec", "Ball Machine", "Discount Cards", "Twilight Tennis"].includes(
            r.category,
          ),
          orderChannel: "none",
          instacartQuery: r.name,
          packSize: 1,
          sites: {
            bjk: { ...ZERO_PAR },
            eldo: { ...ZERO_PAR },
          },
        }),
      );
    }
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
}

interface InventoryState {
  catalog: CatalogItem[];
  snapshots: Record<SiteId, Snapshot | null>;
  recount: Record<SiteId, Record<string, RecountEntry>>;
  samplesLoaded: boolean;
  hydrateSeed: () => Promise<void>;
  applyCsv: (site: SiteId, fileName: string, text: string) => { count: number };
  updatePar: (name: string, site: SiteId, patch: Partial<SitePar>) => void;
  updateItemMeta: (
    name: string,
    patch: Partial<Pick<CatalogItem, "orderChannel" | "packSize" | "instacartQuery" | "trackQty">>,
  ) => void;
  setCount: (site: SiteId, name: string, patch: Partial<RecountEntry>) => void;
  clearRecount: (site: SiteId) => void;
  resetParsToSeed: () => void;
  exportBackup: () => string;
  importBackup: (json: string) => void;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      catalog: [],
      snapshots: emptySnapshots(),
      recount: emptyRecount(),
      samplesLoaded: false,
      hydrateSeed: async () => {
        const base = import.meta.env.BASE_URL;
        const [bjkText, eldoText] = await Promise.all([
          fetch(`${base}samples/bjk.csv`).then((r) => r.text()),
          fetch(`${base}samples/eldo.csv`).then((r) => r.text()),
        ]);
        get().applyCsv("bjk", `retail_items-${seedExportedOn}_bjk.csv`, bjkText);
        get().applyCsv("eldo", `retail_items-${seedExportedOn}_eldo.csv`, eldoText);
        set({ samplesLoaded: true });
      },
      applyCsv: (site, fileName, text) => {
        const rows = parseRetailCsv(text);
        const map: Record<string, OnHand> = {};
        for (const r of rows) {
          map[r.name] = {
            qty: r.qty,
            state: r.stockState,
            availabilityRaw: r.availabilityRaw,
            price: r.price,
            cost: r.cost,
          };
        }
        set({
          catalog: mergeCsvIntoCatalog(get().catalog, rows),
          snapshots: {
            ...get().snapshots,
            [site]: {
              site,
              uploadedAt: new Date().toISOString(),
              fileName,
              rows: map,
            },
          },
        });
        return { count: rows.length };
      },
      updatePar: (name, site, patch) =>
        set({
          catalog: get().catalog.map((i) =>
            i.name === name
              ? { ...i, sites: { ...i.sites, [site]: { ...i.sites[site], ...patch } } }
              : i,
          ),
        }),
      updateItemMeta: (name, patch) =>
        set({
          catalog: get().catalog.map((i) => (i.name === name ? { ...i, ...patch } : i)),
        }),
      setCount: (site, name, patch) =>
        set({
          recount: {
            ...get().recount,
            [site]: {
              ...get().recount[site],
              [name]: {
                counted: get().recount[site][name]?.counted ?? "",
                notes: get().recount[site][name]?.notes ?? "",
                ...patch,
              },
            },
          },
        }),
      clearRecount: (site) => set({ recount: { ...get().recount, [site]: {} } }),
      resetParsToSeed: () =>
        set({
          catalog: get().catalog.map((i) => {
            const next = applyDefaults(i);
            return {
              ...i,
              packSize: next.packSize,
              sites: next.sites,
              instacartQuery: next.instacartQuery,
              orderChannel: next.orderChannel,
            };
          }),
        }),
      exportBackup: () =>
        JSON.stringify({ version: 1, catalog: get().catalog, snapshots: get().snapshots }, null, 2),
      importBackup: (json) => {
        const data = JSON.parse(json) as { catalog?: CatalogItem[]; snapshots?: Record<SiteId, Snapshot> };
        if (!data.catalog || !data.snapshots) throw new Error("Not a BTG Stock backup.");
        set({
          catalog: data.catalog.map(applyVendorChannel),
          snapshots: data.snapshots,
          samplesLoaded: true,
        });
      },
    }),
    {
      name: "btg-stock-v3",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { catalog?: CatalogItem[] };
        if (version < 2 && state.catalog) {
          state.catalog = state.catalog.map(applyVendorChannel);
        }
        return state as InventoryState;
      },
      partialize: (s) => ({
        catalog: s.catalog,
        snapshots: s.snapshots,
        recount: s.recount,
      }),
    },
  ),
);
