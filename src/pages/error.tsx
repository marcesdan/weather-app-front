import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/shell";

export function ErrorPage() {
  return (
    <Shell className="flex flex-col items-center justify-center text-center">
      <h1 className="font-display font-semibold tracking-tight text-3xl">No sabemos dónde estás</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        La ubicación está bloqueada y no hay conexión con el servidor. Activá la ubicación o revisá tu conexión.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <a href="/">Reintentar</a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/ciudades">Elegir una ciudad</Link>
        </Button>
      </div>
    </Shell>
  );
}

export function NotFound() {
  return (
    <Shell className="flex flex-col items-center justify-center text-center">
      <h1 className="font-display font-semibold tracking-tight text-3xl">Esta página no existe</h1>
      <Button asChild className="mt-6">
        <Link to="/">Ir al clima de hoy</Link>
      </Button>
    </Shell>
  );
}
