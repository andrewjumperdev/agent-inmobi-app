"use client";

/**
 * Analytics con datos reales.
 *
 * Reemplaza a `analytics-view.tsx`, que era una maqueta con constantes
 * inventadas. Lo que cambió para que esto sea posible: ahora existen
 * oportunidades con monto y etapa, así que el embudo y el valor del pipeline
 * se pueden calcular en vez de dibujar.
 *
 * Lo que sigue faltando y NO se muestra: costo por lead y rendimiento de
 * campañas. Necesitan la inversión publicitaria de Meta/Google, que no
 * integramos. La pantalla lo dice en vez de rellenar el hueco con un número
 * plausible.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, TrendingUp, Clock, Wallet, Trophy } from "lucide-react";

interface StageSummary {
  stage: string;
  count: number;
  amount_cents: number;
  with_amount: number;
}

interface Datos {
  pipeline: {
    stages: StageSummary[];
    open_amount_cents: number;
    won_amount_cents: number;
    currency: string;
    avg_days_to_close: number | null;
  };
  sources: { source: string; total: number; last_at: string | null }[];
  metrics: {
    leads_daily: { date: string; count: number }[];
    temperature_distribution: Record<string, number>;
    auto_classification_rate: number;
  };
}

const ETAPA_LABEL: Record<string, string> = {
  new: "Nueva",
  qualified: "Calificada",
  proposal: "Propuesta",
  negotiation: "Negociación",
  won: "Ganada",
  lost: "Perdida",
};

const SOURCE_LABEL: Record<string, string> = {
  web: "Formulario web",
  api: "Alta manual",
  whatsapp: "WhatsApp",
  evolution: "WhatsApp",
  email: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
  plaud: "Plaud",
};

const TEMP = {
  hot: { label: "Caliente", token: "var(--temp-hot)" },
  warm: { label: "Tibio", token: "var(--temp-warm)" },
  cold: { label: "Frío", token: "var(--temp-cold)" },
  unset: { label: "Sin calificar", token: "var(--temp-unset)" },
} as const;

/** Centavos → texto corto. Sin decimales: en un tablero, los centavos son
 *  ruido que compite con la magnitud, que es lo que se viene a leer. */
function plata(cents: number, currency: string): string {
  const v = cents / 100;
  const n =
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : v >= 1_000
        ? `${Math.round(v / 1000)}k`
        : Math.round(v).toString();
  return `${currency === "USD" ? "USD " : `${currency} `}${n}`;
}

function Card({
  title,
  children,
  nota,
}: {
  title: string;
  children: React.ReactNode;
  nota?: string;
}) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-[18px]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-label text-[10px] uppercase tracking-[0.18em] text-app-label">
          {title}
        </h2>
        {nota && (
          <span className="font-headline text-[11px] text-muted-foreground">{nota}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Tile({
  icon: Icon,
  value,
  label,
  token,
}: {
  icon: typeof Wallet;
  value: string;
  label: string;
  token: string;
}) {
  return (
    <div className="flex min-h-[126px] flex-col justify-between gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
      <span
        className="flex size-[34px] items-center justify-center rounded-[11px]"
        style={{ backgroundColor: `color-mix(in oklab, ${token} 13%, transparent)` }}
      >
        <Icon size={17} style={{ color: token }} />
      </span>
      <div>
        <p className="font-headline text-2xl font-extrabold leading-none tracking-[-0.02em] text-foreground">
          {value}
        </p>
        <p className="mt-1 font-headline text-[11.5px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/** El embudo. Cada etapa es una barra proporcional a la más grande, no al
 *  total: con un embudo real la primera etapa se lleva casi todo y las demás
 *  quedarían invisibles. */
function Embudo({ stages, currency }: { stages: StageSummary[]; currency: string }) {
  const abiertas = stages.filter((s) => s.stage !== "lost");
  const max = Math.max(...abiertas.map((s) => s.count), 1);

  if (abiertas.every((s) => s.count === 0)) {
    return (
      <p className="py-6 text-center font-headline text-[13px] text-muted-foreground">
        Todavía no cargaste ninguna oportunidad.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {abiertas.map((s) => {
        const pct = Math.round((s.count / max) * 100);
        const ganada = s.stage === "won";
        return (
          <li key={s.stage}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-headline text-[13px] font-bold text-foreground">
                {ETAPA_LABEL[s.stage] ?? s.stage}
              </span>
              <span className="font-headline text-[11.5px] text-muted-foreground">
                {s.count}
                {s.amount_cents > 0 && ` · ${plata(s.amount_cents, currency)}`}
                {/* Cuántas no tienen monto. Sin esto, un total bajo parece un
                    mal mes cuando en realidad faltan datos de carga. */}
                {s.count > s.with_amount && (
                  <span className="text-app-label">
                    {" "}
                    ({s.count - s.with_amount} sin monto)
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-app-canvas">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: ganada ? "var(--success)" : "var(--info)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Serie diaria de leads. El backend rellena los días sin actividad, así que
 *  el eje no se comprime y la línea no dibuja una tendencia que no ocurrió. */
function Serie({ datos }: { datos: { date: string; count: number }[] }) {
  if (datos.length < 2) {
    return (
      <p className="py-6 text-center font-headline text-[13px] text-muted-foreground">
        Hacen falta un par de días de datos para dibujar la tendencia.
      </p>
    );
  }
  const max = Math.max(...datos.map((d) => d.count), 1);
  const w = 100;
  const h = 40;
  const puntos = datos
    .map((d, i) => {
      const x = (i / (datos.length - 1)) * w;
      const y = h - (d.count / max) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const total = datos.reduce((a, d) => a + d.count, 0);

  return (
    <div>
      <p className="font-headline text-2xl font-extrabold leading-none tracking-[-0.02em] text-foreground">
        {total}
      </p>
      <p className="mt-1 font-headline text-[11.5px] text-muted-foreground">
        leads en {datos.length} días
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-3 h-12 w-full"
        aria-hidden
      >
        <polyline
          points={puntos}
          fill="none"
          stroke="var(--info)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function AnalyticsReal() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Datos) => vigente && setDatos(d))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, []);

  if (error) {
    return (
      <div className="p-8 font-headline text-[13px] text-muted-foreground">
        No pudimos cargar tus métricas. Recargá la página.
      </div>
    );
  }
  if (!datos) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="animate-spin text-info" />
      </div>
    );
  }

  const { pipeline, sources, metrics } = datos;
  const totalFuentes = sources.reduce((a, s) => a + s.total, 0);
  const temps = Object.entries(TEMP)
    .map(([k, v]) => ({ ...v, key: k, n: metrics.temperature_distribution[k] ?? 0 }))
    .filter((t) => t.n > 0);
  const totalTemp = temps.reduce((a, t) => a + t.n, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-7">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={Wallet}
          value={plata(pipeline.open_amount_cents, pipeline.currency)}
          label="En el pipeline abierto"
          token="var(--info)"
        />
        <Tile
          icon={Trophy}
          value={plata(pipeline.won_amount_cents, pipeline.currency)}
          label="Ganado"
          token="var(--success)"
        />
        <Tile
          icon={Clock}
          value={
            pipeline.avg_days_to_close === null
              ? "—"
              : `${pipeline.avg_days_to_close} d`
          }
          label="Ciclo de venta promedio"
          token="var(--temp-warm)"
        />
        <Tile
          icon={TrendingUp}
          value={`${Math.round(metrics.auto_classification_rate * 100)}%`}
          label="Calificado automáticamente"
          token="var(--ai)"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Embudo de oportunidades">
          <Embudo stages={pipeline.stages} currency={pipeline.currency} />
        </Card>

        <div className="flex flex-col gap-3">
          <Card title="Leads en el tiempo">
            <Serie datos={metrics.leads_daily} />
          </Card>

          <Card title="Temperatura">
            {totalTemp === 0 ? (
              <p className="py-4 text-center font-headline text-[13px] text-muted-foreground">
                Sin contactos clasificados todavía.
              </p>
            ) : (
              <>
                <div className="flex h-2.5 overflow-hidden rounded-full">
                  {temps.map((t) => (
                    <div
                      key={t.key}
                      style={{
                        width: `${(t.n / totalTemp) * 100}%`,
                        backgroundColor: t.token,
                      }}
                    />
                  ))}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {temps.map((t) => (
                    <li key={t.key} className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: t.token }}
                      />
                      <span className="font-headline text-[11.5px] text-muted-foreground">
                        {t.label} · {t.n}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      </div>

      <Card
        title="De dónde vienen"
        nota={totalFuentes > 0 ? `${totalFuentes} leads` : undefined}
      >
        {sources.length === 0 ? (
          <p className="py-4 font-headline text-[13px] text-muted-foreground">
            Todavía no entró ningún lead.{" "}
            <Link href="/captacion" className="font-semibold text-info hover:opacity-80">
              Conectá una fuente
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sources.map((s) => {
              const pct = totalFuentes ? Math.round((s.total / totalFuentes) * 100) : 0;
              return (
                <li key={s.source}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-headline text-[13px] font-bold text-foreground">
                      {SOURCE_LABEL[s.source] ?? s.source}
                    </span>
                    <span className="font-headline text-[11.5px] text-muted-foreground">
                      {s.total} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-app-canvas">
                    <div
                      className="h-full rounded-full bg-info"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* El hueco declarado. Mostrar un "costo por lead" sin la inversión
          publicitaria sería inventarle al cliente una métrica sobre su propio
          negocio — y la descubriría al cruzarla con su cuenta de Meta. */}
      <p className="px-1 font-headline text-[11.5px] leading-relaxed text-muted-foreground">
        Costo por lead y rendimiento de campañas necesitan la inversión de Meta
        o Google Ads, que todavía no integramos. Cuando conectes esas cuentas,
        aparecen acá.
      </p>
    </div>
  );
}
