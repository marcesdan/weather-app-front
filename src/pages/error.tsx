import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Shell } from "@/components/shell";

export function ErrorPage() {
  return (
    <Shell className="flex flex-col items-center justify-center text-center">
      <h1 className="font-display font-semibold tracking-tight text-3xl">No sabemos dónde estás</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        La ubicación está bloqueada y no hay conexión con el servidor. Activá la ubicación o revisá tu conexión.
      </p>
      <div className="mt-6 flex gap-2">
        <a href="/" className={buttonVariants()}>Reintentar</a>
        <Link to="/ciudades" className={buttonVariants({ variant: "outline" })}>Elegir una ciudad</Link>
      </div>
    </Shell>
  );
}

export function NotFound() {
  return (
    <Shell className="flex flex-col items-center justify-center text-center">
      <h1 className="font-display font-semibold tracking-tight text-3xl">Esta página no existe</h1>
      <Link to="/" className={buttonVariants({ className: "mt-6" })}>Ir al clima de hoy</Link>
    </Shell>
  );
}
