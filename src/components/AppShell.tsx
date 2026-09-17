import { NavLink, Outlet } from "react-router-dom";
import { ClipboardList, LayoutGrid, Package, ShoppingCart, SlidersHorizontal, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Board", icon: LayoutGrid },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/reorder", label: "Order", icon: ShoppingCart },
  { to: "/recount", label: "Recount", icon: ClipboardList },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/pars", label: "Pars", icon: SlidersHorizontal },
] as const;

export function AppShell() {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[1400px]">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border px-4 py-6 md:flex">
          <NavLink to="/" className="px-2">
            <p className="font-display text-xl font-medium tracking-tight text-ink">Court Stock</p>
            <p className="mt-0.5 text-xs text-muted">BJK & ELDO desk</p>
          </NavLink>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150",
                    isActive ? "bg-accent text-accent-fg" : "text-muted hover:bg-accent-soft hover:text-ink",
                  )
                }
              >
                <item.icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <p className="mt-auto px-3 text-xs leading-relaxed text-subtle">
            Everything runs in the browser. Upload CSVs here; nothing is sent to a server.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-4 py-4 md:hidden">
            <div>
              <p className="font-display text-lg font-medium">Court Stock</p>
              <p className="text-xs text-muted">BJK & ELDO</p>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  isActive ? "text-accent" : "text-muted",
                )
              }
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
