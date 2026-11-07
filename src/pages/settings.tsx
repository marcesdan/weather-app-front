import { useState } from "react";
import { Link } from "react-router-dom";
import { BellRing } from "lucide-react";
import { HeaderRow, SectionTitle, Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setPref } from "@/lib/prefs";
import { useUnits } from "@/lib/units";
import { ensureAlertPermission, notificationsSupported, sendTestAlert } from "@/lib/notify";
import { THRESHOLDS } from "@/lib/alerts";
import { UNIT_LABEL, type TempUnit, type WindUnit } from "@/lib/format";

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <span id={`l-${label}`}>{label}</span>
      <ToggleGroup
        aria-labelledby={`l-${label}`}
        value={[value]}
        onValueChange={(v: string[]) => v[0] && onChange(v[0] as T)}
        className="rounded-lg bg-muted p-0.5"
        spacing={0.5}
      >
        {options.map(([v, text]) => (
          <ToggleGroupItem key={v} value={v} className="h-8 px-3 data-[pressed]:bg-primary data-[pressed]:text-primary-foreground data-[pressed]:[text-shadow:none]">
            {text}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export default function Settings() {
  const units = useUnits();
  const [permission, setPermission] = useState(notificationsSupported() ? Notification.permission : "denied");
  return (
    <Shell>
      <HeaderRow back="/">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">Ajustes</h1>
      </HeaderRow>

      <SectionTitle>Unidades</SectionTitle>
      <div className="glass divide-y divide-border rounded-2xl">
        <Choice<TempUnit> label="Temperatura" value={units.temp} options={[["c", "°C"], ["f", "°F"]]} onChange={(v) => setPref("temp", v)} />
        <Choice<WindUnit>
          label="Viento"
          value={units.wind}
          options={(["kmh", "ms", "kn", "mph"] as WindUnit[]).map((u) => [u, UNIT_LABEL[u]])}
          onChange={(v) => setPref("unit", v)}
        />
      </div>

      <SectionTitle>Avisos</SectionTitle>
      <div className="glass space-y-3 rounded-2xl p-4 text-sm">
        <p>
          Elegís qué lugares te avisan desde{" "}
          <Link to="/ciudades" className="text-primary-ink underline underline-offset-2">
            Ciudades
          </Link>
          , con la campana de cada uno. Avisamos ráfagas desde {THRESHOLDS.gustKn} kn, olas desde {THRESHOLDS.waveM} m, tormentas y lluvia intensa en las próximas 24 h.
        </p>
        {!notificationsSupported() ? (
          <p className="text-muted-foreground">Este navegador no muestra notificaciones. En iPhone, agregá la app a la pantalla de inicio.</p>
        ) : permission === "denied" ? (
          <p className="text-[oklch(0.85_0.12_25)]">Las notificaciones están bloqueadas. Habilitalas en la configuración del sitio.</p>
        ) : permission === "granted" ? (
          <Button variant="outline" size="sm" onClick={() => void sendTestAlert()}>
            <BellRing /> Enviar un aviso de prueba
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={async () => setPermission(await ensureAlertPermission())}>
            <BellRing /> Permitir notificaciones
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Con la app cerrada, el sistema decide cada cuánto revisa. Abrirla revisa al instante.</p>
      </div>
    </Shell>
  );
}
