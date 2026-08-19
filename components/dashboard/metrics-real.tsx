import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Inbox,
  MessageSquarePlus,
  Snowflake,
  Sparkles,
  Users,
} from "lucide-react";
import type { MetricsSnapshot } from "@/lib/kore/client";

/* ── Temperatura del pipeline ─────────────────────────────────────────
 * El orden es el de la escala (caliente → sin calificar), no alfabético ni
 * por volumen: si el orden cambiara con los datos, la barra se repintaría
 * sola entre recargas y dejaría de ser comparable.
 * Los colores salen de tokens validados por modo (ver globals.css).      */
const TEMP_SCALE = [
  { key: "hot", label: "Caliente", token: "var(--temp-hot)" },
  { key: "warm", label: "Tibio", token: "var(--temp-warm)" },
  { key: "cold", label: "Frío", token: "var(--temp-cold)" },
  { key: "unset", label: "Sin calificar", token: "var(--temp-unset)" },
] as const;

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

const pct = (ratio: number) => `${Math.round((ratio || 0) * 100)}%`;

/* ── Sparkline ────────────────────────────────────────────────────────
 * 14 días reales del backend (los días sin leads vienen en cero, así que el
 * eje temporal no se comprime). Línea de 2px y el último punto marcado: sin
 * ese punto no se distingue dónde termina la serie de dónde se corta el trazo. */
function Sparkline({ series }: { series: { date: string; count: number }[] }) {
  if (series.length < 2) return null;

  const w = 132;
  const h = 34;
  const pad = 3;
  const max = Math.max(...series.map((d) => d.count), 1);
  const step = (w - pad * 2) / (series.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const points = series.map((d, i) => [pad + i * step, y(d.count)] as const);
  const path = points.map(([x, py]) => `${x.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="overflow-visible text-info"
      role="img"
      aria-label={`Tendencia de los últimos ${series.length} días, máximo ${max} en un día`}
    >
      <polyline
        points={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".85"
      />
      <circle cx={lastX} cy={lastY} r="3" fill="currentColor" />
    </svg>
  );
}

/* ── Variación contra el período anterior ─────────────────────────────
 * La flecha acompaña siempre al color: si la variación viajara solo en verde
 * o rojo, quien no distingue esos tonos no leería nada.                  */
function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return current > 0 ? (
      <span className="text-[11px] font-medium text-success">nuevo</span>
    ) : null;
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) {
    return <span className="text-[11px] text-muted-foreground">sin cambios</span>;
  }
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        up ? "text-success" : "text-destructive"
      }`}
    >
      <Icon size={12} aria-hidden />
      {Math.abs(change)}% vs. semana anterior
    </span>
  );
}

/* ── Stat tile ────────────────────────────────────────────────────────
 * Se vuelve un enlace solo cuando hay un lugar real adonde ir. Una tarjeta
 * que parece clickeable y no lleva a ningún lado se siente rota.          */
function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  href,
  children,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  icon: React.ElementType;
  tone: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex size-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)` }}
        >
          <Icon size={16} style={{ color: tone }} aria-hidden />
        </div>
        {children}
      </div>
      <div className="space-y-0.5">
        <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint && <div className="pt-0.5">{hint}</div>}
      </div>
    </>
  );

  const shell =
    "flex flex-col justify-between gap-3 rounded-2xl border border-app-border bg-app-surface p-5 min-h-[132px]";

  if (!href) return <div className={shell}>{body}</div>;

  return (
    <Link
      href={href}
      className={`${shell} group transition-colors hover:bg-app-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info`}
    >
      {body}
    </Link>
  );
}

function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-app-border bg-app-surface p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-label text-[11px] uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ── Lo primero que hay que mirar ─────────────────────────────────────
 * Un dashboard que solo informa obliga a decidir qué hacer. Este arranca por
 * la única cosa que espera acción de una persona: la cola humana.          */
function NextAction({ pending }: { pending: number }) {
  if (pending === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface px-5 py-4">
        <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden />
        <p className="text-sm text-muted-foreground">
          No hay nada esperándote. El sistema está atendiendo solo.
        </p>
      </div>
    );
  }

  return (
    <Link
      href="/seguimiento"
      className="group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
      style={{
        borderColor: "color-mix(in oklab, var(--warning) 35%, transparent)",
        backgroundColor: "color-mix(in oklab, var(--warning) 8%, transparent)",
      }}
    >
      <Inbox size={18} className="shrink-0 text-warning" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {pending === 1
            ? "Tenés 1 cosa esperando tu revisión"
            : `Tenés ${pending} cosas esperando tu revisión`}
        </p>
        <p className="text-xs text-muted-foreground">
          Los agentes las prepararon; falta que las apruebes vos.
        </p>
      </div>
      <ArrowRight
        size={16}
        className="shrink-0 text-warning transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

/* ── Barra apilada de temperatura ─────────────────────────────────────── */
function TemperatureBar({ dist }: { dist: Record<string, number> }) {
  const segments = TEMP_SCALE.map((t) => ({ ...t, value: dist[t.key] || 0 }));
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="py-1">
        <div className="h-3 w-full rounded-full bg-app-canvas" />
        <p className="mt-4 text-sm text-muted-foreground">
          Todavía no hay contactos clasificados. En cuanto entre el primero vas a
          ver acá cómo se reparte tu pipeline.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* gap-0.5 = la separación de 2px entre segmentos que exige la spec de
          marcas: sin ella, dos colores contiguos se leen como uno solo. */}
      <div
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={segments
          .filter((s) => s.value > 0)
          .map((s) => `${s.label}: ${s.value}`)
          .join(", ")}
      >
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              className="first:rounded-l-full last:rounded-r-full"
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.token }}
            />
          ) : null
        )}
      </div>

      {/* Leyenda con valor y % SIEMPRE visibles. No es adorno: el ámbar queda
          por debajo de 3:1 sobre la superficie clara, y la regla de relief
          exige que el significado no dependa solo del color. */}
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {segments.map((s) => (
          <div key={s.key} className="flex items-start gap-2">
            <span
              className="mt-1 size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.token }}
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="truncate text-xs text-muted-foreground">{s.label}</dt>
              <dd className="text-sm font-semibold text-foreground">
                {s.value}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {Math.round((s.value / total) * 100)}%
                </span>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Alerts({ alerts }: { alerts: MetricsSnapshot["alerts"] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-start gap-2.5">
        {/* Icono + texto: el estado nunca viaja solo en el color. */}
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">Todo en orden</p>
          <p className="text-xs text-muted-foreground">
            Ninguna métrica cruzó su umbral.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3.5">
      {alerts.map((a) => (
        <li key={a.metric} className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{a.issue}</p>
            <p className="text-xs text-muted-foreground">{a.action}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Cuenta recién creada ─────────────────────────────────────────────
 * Una pantalla de ceros no distingue "todavía no arrancaste" de "arrancaste y
 * no está funcionando". Son situaciones opuestas y necesitan respuestas
 * opuestas, así que el primer día se muestra qué hacer, no métricas vacías. */
function FirstRun() {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-info/10">
        <MessageSquarePlus size={22} className="text-info" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-foreground">
        Conectá WhatsApp para arrancar
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Todavía no entró ningún contacto. Escaneá el QR desde Integraciones y el
        agente empieza a atender y a calificar solo — los leads van a aparecer acá
        con su temperatura.
      </p>
      <Link
        href="/integraciones"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-info px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
      >
        Conectar WhatsApp
        <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}

export function DashboardReal({ metrics }: { metrics: MetricsSnapshot }) {
  const dist = metrics.temperature_distribution || {};
  const totalContacts = Object.values(dist).reduce((a, b) => a + b, 0);
  const series = metrics.leads_daily ?? [];

  // "Sin datos" ≠ "mal desempeño": sin ningún contacto todavía, lo útil es
  // decirle a la persona cómo empezar, no mostrarle cinco ceros.
  if (totalContacts === 0 && metrics.leads_new_7d === 0) {
    return (
      <div className="space-y-5">
        <FirstRun />
        <SectionCard title="Alertas del orquestador">
          <Alerts alerts={metrics.alerts} />
        </SectionCard>
      </div>
    );
  }

  const tiles = [
    {
      label: "Leads (7 días)",
      value: String(metrics.leads_new_7d),
      icon: Users,
      tone: "var(--temp-cold)",
      hint: <Delta current={metrics.leads_new_7d} previous={metrics.leads_prev_7d ?? 0} />,
      children: series.length > 1 ? <Sparkline series={series} /> : undefined,
    },
    {
      label: "Clasificación automática",
      value: pct(metrics.auto_classification_rate),
      icon: Sparkles,
      tone: "var(--ai)",
      hint: (
        <span className="text-[11px] text-muted-foreground">
          sin intervención humana
        </span>
      ),
    },
    {
      label: "Frío en pipeline",
      value: pct(metrics.cold_share),
      icon: Snowflake,
      tone: "var(--temp-unset)",
      href: "/crm",
    },
    {
      label: "Cola humana",
      value: String(metrics.open_escalations),
      icon: Inbox,
      tone: "var(--warning)",
      href: "/seguimiento",
    },
    {
      label: "MRR",
      value: money(metrics.mrr_cents),
      icon: DollarSign,
      tone: "var(--success)",
      hint:
        metrics.subscription_status !== "none" ? (
          <span className="text-[11px] text-muted-foreground">
            {metrics.subscription_status}
          </span>
        ) : undefined,
    },
  ];

  return (
    <div className="space-y-5">
      <NextAction pending={metrics.open_escalations} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiles.map(({ children, ...t }) => (
          <StatTile key={t.label} {...t}>
            {children}
          </StatTile>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard
          title="Pipeline por temperatura"
          className="lg:col-span-2"
          action={
            <Link
              href="/crm"
              className="text-xs font-medium text-info transition-opacity hover:opacity-80"
            >
              Ver CRM
            </Link>
          }
        >
          <TemperatureBar dist={dist} />
        </SectionCard>

        <SectionCard title="Alertas del orquestador">
          <Alerts alerts={metrics.alerts} />
        </SectionCard>
      </div>
    </div>
  );
}
