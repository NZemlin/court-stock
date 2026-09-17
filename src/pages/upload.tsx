import { useState } from "react";
import { CsvDropzone } from "@/components/CsvDropzone";
import { SiteToggle } from "@/components/SiteToggle";
import { useInventory, seedExportedOn } from "@/lib/inventory/store";
import type { SiteId } from "@/lib/inventory/types";
import { SITES } from "@/lib/inventory/types";
import { formatQty } from "@/lib/utils";


export function UploadPage() {
  const [site, setSite] = useState<SiteId>("bjk");
  const snapshots = useInventory((s) => s.snapshots);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Refresh</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Upload export</h1>
        <p className="mt-2 text-muted">
          Drop the retail items CSV from ClubAutomation. On-hand quantities update for that
          desk; par levels stay as you set them.
        </p>
      </header>

      <SiteToggle value={site} onChange={setSite} />
      <CsvDropzone site={site} onSiteGuess={setSite} />

      <section className="grid gap-3 sm:grid-cols-2">
        {SITES.map((s) => {
          const snap = snapshots[s.id];
          const n = snap ? Object.keys(snap.rows).length : 0;
          const units = snap
            ? Object.values(snap.rows).reduce((a, r) => a + r.qty, 0)
            : 0;
          return (
            <div key={s.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{s.name}</p>
              <p className="mt-2 font-display text-lg">{snap?.fileName ?? "No file yet"}</p>
              <p className="mt-1 text-sm text-muted">
                {snap
                  ? `${n} SKUs · ${formatQty(units)} units · ${new Date(snap.uploadedAt).toLocaleString()}`
                  : `Seeded from ${seedExportedOn} until you upload.`}
              </p>
            </div>
          );
        })}
      </section>

      <p className="text-sm text-muted">
        Sample files from Sep 17 are already loaded so you can try Order and Recount without
        uploading. Your next CSV replaces that snapshot for the matching desk.
      </p>
    </div>
  );
}
