import { cn } from "@/lib/utils";

const LOGO = `${import.meta.env.BASE_URL}btg-logo.png`;

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-start">
      <img
        src={LOGO}
        alt="BTG Tennis"
        className={cn(
          "object-contain object-left",
          compact ? "h-12 w-auto max-w-[160px]" : "h-auto w-full max-w-[200px]",
        )}
      />
      <p
        className={cn(
          "font-medium uppercase tracking-[0.18em] text-muted",
          compact ? "mt-0.5 text-[10px]" : "mt-1.5 text-[11px]",
        )}
      >
        BJK & ELDO
      </p>
    </div>
  );
}
