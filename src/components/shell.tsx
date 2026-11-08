import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { IonContent, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// v1 layout kept: one centered column, a three-slot header row (back · title · action), content, footer.
// Ionic owns the page (transitions, safe areas, pull to refresh); the column inside is ours.
// Column width: phone-first; "wide" opens a two-column layout on desktop, "medium" a roomier single column.
const WIDTH = { narrow: "max-w-xl", medium: "max-w-xl lg:max-w-3xl", wide: "max-w-xl lg:max-w-6xl" };
export function Shell({
  children,
  className,
  onRefresh,
  size = "narrow",
}: {
  children: ReactNode;
  className?: string;
  onRefresh?: () => Promise<unknown>;
  size?: keyof typeof WIDTH;
}) {
  return (
    <IonPage className="sky-page">
      <IonContent>
        {onRefresh && (
          <IonRefresher slot="fixed" onIonRefresh={(e) => void onRefresh().finally(() => e.detail.complete())}>
            <IonRefresherContent />
          </IonRefresher>
        )}
        <div className={cn("mx-auto flex min-h-full w-full flex-col px-4 pt-[max(env(safe-area-inset-top),0.75rem)] lg:px-8", WIDTH[size])}>
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

// "Back" pops Ionic's page stack instead of pushing the target again (pushing piled up duplicate pages).
// Opened from a deep link with no history, it goes to `to` with a back transition.
export function BackLink({ to, label = "Volver", children }: { to: string; label?: string; children?: ReactNode }) {
  const router = useIonRouter();
  return (
    <a
      href={to}
      aria-label={label}
      className={buttonVariants({ variant: "ghost", size: "icon" })}
      onClick={(e) => {
        e.preventDefault();
        if (router.canGoBack()) router.goBack();
        else router.push(to, "back", "pop");
      }}
    >
      {children ?? <ChevronLeft className="size-5" />}
    </a>
  );
}

export function HeaderRow({ back, lead, children, action }: { back?: string; lead?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 py-2">
      {back ? (
        <BackLink to={back} />
      ) : (
        (lead ?? <span />)
      )}
      <div className="min-w-0 text-center">{children}</div>
      {action ?? <span />}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-6 mb-2 flex items-center justify-between gap-3">
      <h2 className="text-base font-medium">{children}</h2>
      {action}
    </div>
  );
}

// Mouse users drag the strip sideways (touch and trackpads scroll natively); a drag never fires the click under it.
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, left: 0, moved: false, active: false });
  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
      drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false, active: true };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d.active || !ref.current) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 4) d.moved = true;
      ref.current.scrollLeft = d.left - dx;
    },
    onPointerUp: () => void (drag.current.active = false),
    onPointerLeave: () => void (drag.current.active = false),
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current.moved) e.stopPropagation(), e.preventDefault(), (drag.current.moved = false);
    },
  };
}

export function Strip({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    // Bleeds past the column padding to the screen edge, like a carousel: the cut item at the edge says "swipe".
    // The trailing spacer keeps the last item off the edge (end padding is dropped in some scroll containers).
    <div
      {...useDragScroll()}
      role="list"
      aria-label={label}
      className={cn("strip -mx-4 flex snap-x scroll-px-4 select-none gap-1.5 overflow-x-auto px-4 py-1 after:w-2 after:shrink-0 after:content-['']", className)}
    >
      {children}
    </div>
  );
}
