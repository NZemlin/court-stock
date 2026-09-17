import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteId } from "@/lib/inventory/types";
import { detectSiteFromFilename } from "@/lib/inventory/parse";
import { useInventory } from "@/lib/inventory/store";
import { Button } from "@/components/ui/button";

export function CsvDropzone({
  site,
  onSiteGuess,
}: {
  site: SiteId;
  onSiteGuess?: (id: SiteId) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const applyCsv = useInventory((s) => s.applyCsv);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  async function ingest(file: File) {
    setError(null);
    setOk(null);
    const guess = detectSiteFromFilename(file.name);
    if (guess && guess !== site) onSiteGuess?.(guess);
    const target = guess ?? site;
    try {
      const text = await file.text();
      const { count } = applyCsv(target, file.name, text);
      setOk(`Loaded ${count} items into ${target.toUpperCase()} from ${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const file = e.dataTransfer.files[0];
          if (file) void ingest(file);
        }}
        className={cn(
          "flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-card px-6 py-10 text-center transition-colors duration-200",
          drag && "border-accent bg-accent-soft/40",
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
          {drag ? <Upload className="size-5" /> : <FileSpreadsheet className="size-5" />}
        </div>
        <div>
          <p className="font-medium">Drop a retail items CSV</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            ClubAutomation export. Filename with “bjk” or “eldo” is assigned automatically.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void ingest(file);
            e.target.value = "";
          }}
        />
      </div>
      {ok ? <p className="text-sm text-ok">{ok}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
