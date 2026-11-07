import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/shell";
import { usePref } from "@/lib/prefs";
import { disableAlerts, enableAlerts, notificationsSupported, sendTestAlert } from "@/lib/notify";
import { THRESHOLDS } from "@/lib/alerts";

export function AlertSettings() {
  const [pref] = usePref<"on" | "off">("alerts", "off");
  const [denied, setDenied] = useState(notificationsSupported() && Notification.permission === "denied");
  if (!notificationsSupported())
    return (
      <>
        <SectionTitle>Avisos</SectionTitle>
        <p className="text-sm text-muted-foreground">Este navegador no muestra notificaciones. En iPhone, agregá la app a la pantalla de inicio.</p>
      </>
    );
  const on = pref === "on" && Notification.permission === "granted";
  return (
    <>
      <SectionTitle>Avisos</SectionTitle>
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="alerts" className="flex-col items-start gap-1">
            <span className="text-base">Avisarme de alertas en mis lugares</span>
            <span className="text-xs font-normal text-muted-foreground">
              Ráfagas desde {THRESHOLDS.gustKn} kn, olas desde {THRESHOLDS.waveM} m, tormentas y lluvia intensa en las próximas 24 h.
            </span>
          </Label>
          <Switch
            id="alerts"
            checked={on}
            disabled={denied}
            onCheckedChange={async (v) => {
              if (!v) return disableAlerts();
              setDenied((await enableAlerts()) === "denied");
            }}
          />
        </div>
        {denied && <p className="mt-3 text-sm text-destructive">Las notificaciones están bloqueadas. Habilitalas en la configuración del sitio.</p>}
        {on && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => void sendTestAlert()}>
              Enviar un aviso de prueba
            </Button>
            <p className="text-xs text-muted-foreground">Con la app cerrada, el sistema decide cada cuánto revisa. Abrirla revisa al instante.</p>
          </div>
        )}
      </div>
    </>
  );
}
