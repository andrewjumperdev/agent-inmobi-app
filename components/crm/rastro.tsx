"use client";

/**
 * El rastro del agente sobre un contacto.
 *
 * Dos cosas distintas y las dos necesarias: qué hizo el sistema (las corridas)
 * y qué cree saber (los hechos, con su respaldo). Hasta acá el agente actuaba
 * sin dejar nada legible, así que cuando se equivocaba no había por dónde
 * empezar a mirar — solo un contacto con datos raros y ninguna explicación.
 */

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface TrailStep {
  id: string;
  agent: string;
  status: string;
  created_at: string;
  latency_ms: number;
  reply: string | null;
  error: string | null;
}

interface TrailFact {
  key: string;
  value: Record<string, unknown>;
  basis: string;
  source: string;
  evidence: string | null;
  observed_at: string | null;
}

/* ── Cómo se estableció cada hecho ─────────────────────────────────────
 *
 * El color y la etiqueta tienen que dejar clara la diferencia entre "lo dijo"
 * y "lo dedujo". Si se vieran igual, una inferencia del modelo pesaría lo
 * mismo que una afirmación del cliente a los ojos de quien lee — que es
 * exactamente la confusión que esto viene a evitar. */
const BASIS: Record<string, { label: string; token: string; ayuda: string }> = {
  operator: {
    label: "Cargado a mano",
    token: "var(--success)",
    ayuda: "Lo cargó una persona de tu equipo.",
  },
  stated: {
    label: "Lo dijo",
    token: "var(--info)",
    ayuda: "La persona lo afirmó explícitamente.",
  },
  imported: {
    label: "Importado",
    token: "var(--temp-cold)",
    ayuda: "Vino de un formulario o una fuente externa.",
  },
  inferred: {
    label: "Deducido",
    token: "var(--temp-warm)",
    ayuda: "El agente lo dedujo de la conversación. Puede estar mal.",
  },
};

const AGENTE: Record<string, string> = {
  sdr: "Primer contacto",
  qualification: "Calificación",
  followup: "Seguimiento",
  proposal: "Propuesta",
  customer_service: "Atención",
  setter: "Agendamiento",
  coach: "Coach",
  orchestrator: "Orquestador",
};

function cuando(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.floor(min / 60)} h`;
  return `hace ${Math.floor(min / 1440)} d`;
}

/** Un valor JSON como texto corto. Los hechos son objetos arbitrarios, así que
 *  no se puede asumir forma: se muestra lo que haya, recortado. */
function resumir(value: Record<string, unknown>): string {
  const entries = Object.entries(value ?? {});
  if (entries.length === 0) return "—";
  if (entries.length === 1 && "value" in value) return String(value.value);
  return entries
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ")
    .slice(0, 160);
}

export function Rastro({ contactId }: { contactId: string }) {
  const [datos, setDatos] = useState<{ steps: TrailStep[]; facts: TrailFact[] } | null>(
    null
  );
  const [error, setError] = useState(false);

  // Sin reseteo de estado acá: el componente se monta con `key={contactId}`
  // desde el detalle, así que cambiar de contacto lo remonta limpio. Resetear
  // dentro del efecto haría que el rastro del contacto anterior se vea por un
  // frame antes de limpiarse.
  useEffect(() => {
    let vigente = true;
    fetch(`/api/crm/contacts/${contactId}/trail`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => vigente && setDatos(d))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, [contactId]);

  if (error) {
    return (
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        No pudimos cargar el rastro.
      </p>
    );
  }
  if (!datos) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <Loader2 size={13} className="animate-spin" /> Cargando…
      </div>
    );
  }

  const { steps, facts } = datos;

  if (steps.length === 0 && facts.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        El agente todavía no intervino con este contacto.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {facts.length > 0 && (
        <div>
          <p className="mb-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Lo que el sistema cree saber
          </p>
          <ul className="flex flex-col gap-2">
            {facts.map((f) => {
              const b = BASIS[f.basis] ?? BASIS.inferred;
              return (
                <li
                  key={f.key}
                  className="rounded-xl px-3 py-2"
                  style={{ backgroundColor: "var(--app-surface-hover)" }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {f.key}
                    </span>
                    <span
                      title={b.ayuda}
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${b.token} 15%, transparent)`,
                        color: b.token,
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "var(--foreground)" }}>
                    {resumir(f.value)}
                  </p>
                  {/* La cita que lo sostiene. Es lo que convierte "el sistema
                      dice X" en algo que se puede verificar. */}
                  {f.evidence && (
                    <p
                      className="mt-1.5 border-l-2 pl-2 text-[11px] italic"
                      style={{
                        borderColor: "var(--app-border)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      “{f.evidence.slice(0, 180)}”
                    </p>
                  )}
                  <p className="mt-1 text-[10px]" style={{ color: "var(--app-label)" }}>
                    {AGENTE[f.source] ?? f.source}
                    {f.observed_at && ` · ${cuando(f.observed_at)}`}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <p className="mb-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Qué hizo el agente
          </p>
          <ul className="flex flex-col gap-1.5">
            {steps.map((s) => {
              const fallo = s.status !== "ok";
              return (
                <li key={s.id} className="flex gap-2.5">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: fallo ? "var(--temp-hot)" : "var(--info)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {AGENTE[s.agent] ?? s.agent}
                      </span>
                      <span className="shrink-0 text-[10px]" style={{ color: "var(--app-label)" }}>
                        {cuando(s.created_at)}
                      </span>
                    </div>
                    {/* Un fallo se muestra, no se esconde: un paso que no
                        aparece se lee como un paso que no pasó. */}
                    {fallo ? (
                      <p
                        className="mt-0.5 flex items-start gap-1 text-[11px]"
                        style={{ color: "var(--temp-hot)" }}
                      >
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        {s.error?.slice(0, 140) || "Falló sin detalle"}
                      </p>
                    ) : (
                      s.reply && (
                        <p
                          className="mt-0.5 text-[11px]"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {s.reply}
                        </p>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
