import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IonContent, IonPage, IonRefresher, IonRefresherContent } from "@ionic/react";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// v1 layout kept: one centered column, a three-slot header row (back · title · action), content, footer.
// Ionic owns the page (transitions, safe areas, pull to refresh); the column inside is ours.
export function Shell({ children, className, onRefresh }: { children: ReactNode; className?: string; onRefresh?: () => Promise<unknown> }) {
  return (
    <IonPage>
      <IonContent>
        {onRefresh && (
          <IonRefresher slot="fixed" onIonRefresh={(e) => void onRefresh().finally(() => e.detail.complete())}>
            <IonRefresherContent />
          </IonRefresher>
        )}
        <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
          <main className={cn("flex-1", className)}>{children}</main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        Datos de OpenWeatherMap y Open-Meteo. Hecho por{" "}
        <a className="underline underline-offset-2 hover:text-foreground" href="https://github.com/marcesdan">
          Marces
        </a>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
}

export function HeaderRow({ back, children, action }: { back?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 py-2">
      {back ? (
        <Link to={back} aria-label="Volver" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ChevronLeft className="size-5" />
          </Link>
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
