import { HeaderRow, Shell } from "@/components/shell";
import { DayList } from "@/components/days";
import { useHere, useWeather } from "@/lib/queries";
import { useUnits } from "@/lib/units";

export default function NextDays() {
  const spot = useHere().data;
  const { data: w } = useWeather(spot?.lat ?? 0, spot?.lon ?? 0, !!spot);
  const unit = useUnits();
  return (
    <Shell size="medium">
      <HeaderRow back="/">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">Próximos días</h1>
        {spot && <p className="truncate text-sm text-muted-foreground">{spot.name}</p>}
      </HeaderRow>
      <p className="mt-2 mb-3 text-center text-sm text-muted-foreground">Tocá un día para verlo hora a hora.</p>
      {w && spot ? <DayList w={w} lat={spot.lat} lon={spot.lon} unit={unit} /> : <div className="h-96 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />}
    </Shell>
  );
}
