import { useEffect } from "react";
import { useInventory } from "@/lib/inventory/store";

/** Loads the bundled Sep 17 sample CSVs once if this browser has no snapshot yet. */
export function SampleLoader() {
  const snapshots = useInventory((s) => s.snapshots);
  const hydrateSeed = useInventory((s) => s.hydrateSeed);

  useEffect(() => {
    if (snapshots.bjk && snapshots.eldo) return;
    void hydrateSeed();
  }, [snapshots.bjk, snapshots.eldo, hydrateSeed]);

  return null;
}
