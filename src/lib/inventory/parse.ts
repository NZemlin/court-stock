import type { ParsedCsvRow, StockState } from "./types";

function parseQty(availability: string): { qty: number; state: StockState } {
  const raw = (availability || "").trim();
  const m = /Available\s*\(([\d.]+)\)/i.exec(raw);
  if (m) return { qty: Number(m[1]), state: "available" };
  const low = raw.toLowerCase();
  if (low.includes("out of stock")) return { qty: 0, state: "out_of_stock" };
  if (low.includes("unavailable")) return { qty: 0, state: "unavailable" };
  return { qty: 0, state: raw ? "unknown" : "unknown" };
}

function num(v: string | undefined): number {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseRetailCsv(text: string): ParsedCsvRow[] {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("This file looks empty. Export the retail items CSV and try again.");
  }
  const header = splitCsvLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, ""));
  const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const iName = idx("Item Name");
  const iCat = idx("Category");
  const iAvail = idx("Availability");
  if (iName < 0 || iCat < 0 || iAvail < 0) {
    throw new Error(
      "This does not look like a retail items export. Need columns: Item Name, Category, Availability.",
    );
  }
  const iUpc = idx("UPC Barcode");
  const iNum = idx("Item Number");
  const iSize = idx("Size");
  const iColor = idx("Color");
  const iPrice = idx("Price");
  const iCost = idx("Cost");
  const iStatus = idx("Status");

  const rows: ParsedCsvRow[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const name = (cols[iName] || "").trim();
    if (!name) continue;
    const availabilityRaw = (cols[iAvail] || "").trim();
    const { qty, state } = parseQty(availabilityRaw);
    rows.push({
      name,
      upc: iUpc >= 0 ? (cols[iUpc] || "").trim() : "",
      itemNumber: iNum >= 0 ? (cols[iNum] || "").trim() : "",
      size: iSize >= 0 ? (cols[iSize] || "").trim() : "",
      color: iColor >= 0 ? (cols[iColor] || "").trim() : "",
      category: (cols[iCat] || "").trim(),
      price: iPrice >= 0 ? num(cols[iPrice]) : 0,
      cost: iCost >= 0 ? num(cols[iCost]) : 0,
      availabilityRaw,
      qty,
      stockState: state,
      status: iStatus >= 0 ? (cols[iStatus] || "").trim() : "",
    });
  }
  if (!rows.length) throw new Error("No items found in that CSV.");
  return rows;
}

export function detectSiteFromFilename(name: string): "bjk" | "eldo" | null {
  const n = name.toLowerCase();
  if (n.includes("bjk")) return "bjk";
  if (n.includes("eldo")) return "eldo";
  return null;
}
