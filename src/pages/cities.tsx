import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Pencil, Plus, Search, X } from "lucide-react";
import { HeaderRow, SectionTitle, Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeName, searchCities } from "@/lib/api";
import { coordKey, places, usePlaces, type Place } from "@/lib/places";
import { useHere, useNearby } from "@/lib/queries";
import { AlertSettings } from "@/components/alert-settings";

type Candidate = Omit<Place, "id">;

export default function Cities() {
  const [text, setText] = useState("");
  const [term, setTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setTerm(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);

  const search = useQuery({
    queryKey: ["search", term.toLowerCase()],
    queryFn: () => searchCities(term),
    enabled: term.length >= 2,
    staleTime: Infinity,
  });
  const here = useHere().data;
  const nearby = useNearby(here?.lat, here?.lon);
  const saved = usePlaces();
  const savedKeys = new Set(saved.map((p) => coordKey(p.lat, p.lon)));

  const results: Candidate[] = (search.data ?? []).map((g) => ({
    name: placeName(g),
    detail: [g.state, g.country].filter(Boolean).join(", "),
    lat: g.lat,
    lon: g.lon,
    kind: "city",
  }));
  const suggestions: Candidate[] = (nearby.data ?? [])
    .filter((n) => n.name !== here?.name)
    .slice(0, 6)
    .map((n) => ({ name: n.name, detail: n.kind === "city" ? "Ciudad cercana" : "Pueblo cercano", lat: n.lat, lon: n.lon, kind: "city" }));

  const showing = term.length >= 2 ? results : suggestions;

  return (
    <Shell>
      <HeaderRow back="/">
        <h1 className="font-display font-semibold tracking-tight text-2xl leading-tight">Ciudades</h1>
      </HeaderRow>

      <Label htmlFor="city-search" className="mt-4 block">
        Buscar una ciudad
      </Label>
      <div className="relative mt-2">
        <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="city-search"
          className="h-11 pl-9"
          placeholder="Mar del Plata, Rosario, Montevideo…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
      </div>

      <p className="mt-4 mb-2 text-sm text-muted-foreground" aria-live="polite">
        {term.length >= 2
          ? search.isFetching
            ? "Buscando…"
            : search.isError
              ? "La búsqueda falló. Probá de nuevo en un minuto."
              : results.length
                ? `${results.length} resultado${results.length > 1 ? "s" : ""}`
                : "No encontramos esa ciudad. Revisá cómo se escribe."
          : here
            ? nearby.isSuccess && suggestions.length
              ? `Cerca de ${here.name}`
              : nearby.isFetching
                ? "Buscando ciudades cercanas…"
                : "Escribí al menos dos letras."
            : "Escribí al menos dos letras."}
      </p>
      {showing.length > 0 && (
        <ul className="divide-y glass rounded-2xl" data-testid={term.length >= 2 ? "search-results" : "nearby"}>
          {showing.map((c) => {
            const added = savedKeys.has(coordKey(c.lat, c.lon));
            return (
              <li key={`${c.lat},${c.lon}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate">{c.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{c.detail}</span>
                </span>
                <Button size="sm" variant={added ? "ghost" : "outline"} disabled={added} onClick={() => places.add(c)} aria-label={`Agregar ${c.name}`}>
                  {added ? <Check /> : <Plus />}
                  {added ? "Agregada" : "Agregar"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <SectionTitle>Tus lugares</SectionTitle>
      {saved.length ? (
        <ul className="divide-y glass rounded-2xl" data-testid="saved">
          {saved.map((p) => (
            <SavedRow key={p.id} p={p} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Todavía no guardaste lugares. También podés guardar zonas en el mar desde el observatorio.</p>
      )}

      <AlertSettings />
    </Shell>
  );
}

function SavedRow({ p }: { p: Place }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name);
  const save = () => {
    if (name.trim()) places.rename(p.id, name.trim());
    setEditing(false);
  };
  return (
    <li className="flex items-center justify-between gap-2 px-4 py-2.5">
      {editing ? (
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <Input aria-label="Nombre del lugar" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={60} />
          <Button type="submit" size="icon" variant="outline" aria-label="Guardar nombre">
            <Check />
          </Button>
        </form>
      ) : (
        <span className="min-w-0">
          <span className="block truncate">{p.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{p.kind === "zone" ? `Zona · ${p.detail}` : p.detail}</span>
        </span>
      )}
      {!editing && (
        <span className="flex shrink-0">
          <Button size="icon" variant="ghost" aria-label={`Renombrar ${p.name}`} onClick={() => setEditing(true)}>
            <Pencil />
          </Button>
          <Button size="icon" variant="ghost" aria-label={`Quitar ${p.name}`} onClick={() => places.remove(p.id)}>
            <X />
          </Button>
        </span>
      )}
    </li>
  );
}
