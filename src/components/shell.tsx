import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// v1 layout kept: one centered column, a three-slot header row (back · title · action), content, footer.
export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <main className={cn("flex-1", className)}>{children}</main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        Datos de OpenWeatherMap y Open-Meteo. Hecho por{" "}
        <a className="underline underline-offset-2 hover:text-foreground" href="https://github.com/marcesdan">
          Marces
        </a>
      </footer>
    </div>
  );
}

export function HeaderRow({ back, children, action }: { back?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 py-2">
      {back ? (
        <Button asChild variant="ghost" size="icon" aria-label="Volver">
          <Link to={back}>
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
      ) : (
        <span />
      )}
      <div className="min-w-0 text-center">{children}</div>
      {action ?? <span />}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-medium">{children}</h2>
      {action}
    </div>
  );
}

export function Strip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="list" aria-label={label} className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
      {children}
    </div>
  );
}
