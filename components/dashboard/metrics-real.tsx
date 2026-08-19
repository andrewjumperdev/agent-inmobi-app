import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Flame,
  Inbox,
  MessageSquarePlus,
  Sparkles,
  Users,
} from "lucide-react";
import type { ContactOut, MetricsSnapshot } from "@/lib/kore/client";

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

const TEMP_CHIP: Record<string, { label: string; token: string }> = {
  hot: { label: "Caliente", token: "var(--temp-hot)" },
  warm: { label: "Tibio", token: "var(--temp-warm)" },
  cold: { label: "Frío", token: "var(--temp-cold)" },
  unset: { label: "Sin calificar", token: "var(--temp-unset)" },
};

const HOT_WAIT_HOURS = 2;

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

const pct = (ratio: number) => `${Math.round((ratio || 0) * 100)}%`;

/** "hace 4 min" en la unidad más grande que siga siendo precisa. */
function waited(since: string | null): string {
  if (!since) return "—";
  const mins = Math.max(0, Math.round((Date.now() - new Date(since).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)} h`;
  return `${Math.floor(mins / 1440)} d`;
}

function isStale(since: string | null, hours = HOT_WAIT_HOURS): boolean {
  if (!since) return false;
  return Date.now() - new Date(since).getTime() > hours * 3600_000;
}

/* ── Sparkline ────────────────────────────────────────────────────────
 * 14 días reales del backend (los días sin leads vienen en cero, así que el
 * eje temporal no se comprime). Línea de 2px y el último punto marcado: sin
 * ese punto no se distingue dónde termina la serie de dónde se corta el trazo. */
function Sparkline({ series }: { series: { date: string; count: number }[] }) {
  if (series.length < 2) return null;

  const w = 110;
  const h = 32;
  const pad = 3;
  const max = Math.max(...series.map((d) => d.count), 1);
  const step = (w - pad * 2) / (series.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const points = series.map((d, i) => [pad + i * step, y(d.count)] as const);
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="shrink-0 overflow-visible text-info"
      role="img"
      aria-label={`Tendencia de los últimos ${series.length} días, máximo ${max} en un día`}
    >
      <polyline
        points={points.map(([x, py]) => `${x.toFixed(1)},${py.toFixed(1)}`).join(" ")}
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
      <span className="font-headline text-[11px] font-semibold text-success">nuevo</span>
    ) : null;
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) {
    return (
      <span className="font-headline text-[11px] text-muted-foreground">sin cambios</span>
    );
  }
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-headline text-[11px] font-semibold ${
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
        <span
          className="flex size-[34px] items-center justify-center rounded-[11px]"
          style={{ backgroundColor: `color-mix(in oklab, ${tone} 13%, transparent)` }}
        >
          <Icon size={17} style={{ color: tone }} aria-hidden />
        </span>
        {children}
      </div>
      <div>
        <p className="font-headline text-2xl font-extrabold leading-none tracking-[-0.02em] text-foreground">
          {value}
        </p>
        <p className="mt-1 font-headline text-[11.5px] text-muted-foreground">{label}</p>
        {hint && <div className="mt-[3px]">{hint}</div>}
      </div>
    </>
  );

  const shell =
    "flex min-h-[126px] flex-col justify-between gap-3 rounded-2xl border border-app-border bg-app-surface p-4";

  if (!href) return <div className={shell}>{body}</div>;

  return (
    <Link
      href={href}
      className={`${shell} transition-colors hover:bg-app-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info`}
    >
      {body}
    </Link>
  );
}

function Card({
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
      className={`rounded-2xl border border-app-border bg-app-surface p-[18px] ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-label text-[10px] uppercase tracking-[0.18em] text-app-label">
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
      <div className="flex items-center gap-3.5 rounded-2xl border border-app-border bg-app-surface px-[18px] py-3.5">
        <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden />
        <p className="font-headline text-[13px] text-muted-foreground">
          No hay nada esperándote. El sistema está atendiendo solo.
        </p>
      </div>
    );
  }

  return (
    <Link
      href="/seguimiento"
      className="group flex items-center gap-3.5 rounded-2xl border px-[18px] py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
      style={{
        borderColor: "color-mix(in oklab, var(--temp-warm) 35%, transparent)",
        backgroundColor: "color-mix(in oklab, var(--temp-warm) 8%, transparent)",
      }}
    >
      <Inbox size={20} className="shrink-0 text-warning" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block font-headline text-[13.5px] font-bold text-foreground">
          {pending === 1
            ? "Tenés 1 cosa esperando tu revisión"
            : `Tenés ${pending} cosas esperando tu revisión`}
        </span>
        <span className="block font-headline text-xs text-muted-foreground">
          Los agentes las prepararon; falta que las apruebes vos.
        </span>
      </span>
      <span className="shrink-0 font-headline text-xs font-semibold text-warning">
        Revisar ahora{" "}
        <ArrowRight size={12} className="inline transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

/* ── Leads por atender ────────────────────────────────────────────────
 * Orden por urgencia real: primero la temperatura (caliente manda), y dentro
 * de cada nivel el que más tiempo lleva esperando. Ordenar solo por fecha
 * pondría arriba a un frío recién llegado por encima de un caliente de ayer. */
const TEMP_RANK: Record<string, number> = { hot: 0, warm: 1, cold: 2, unset: 3 };

function pending(contacts: ContactOut[]): ContactOut[] {
  return [...contacts]
    .filter((c) => c.lifecycle_stage !== "customer" && c.lifecycle_stage !== "lost")
    .sort((a, b) => {
      const rank = (TEMP_RANK[a.temperature] ?? 9) - (TEMP_RANK[b.temperature] ?? 9);
      if (rank !== 0) return rank;
      return (
        new Date(a.last_activity_at ?? a.created_at).getTime() -
        new Date(b.last_activity_at ?? b.created_at).getTime()
      );
    });
}

/** Resumen corto de los atributos que el agente capturó (zona, presupuesto…).
 *  Son propios del nicho y pueden faltar: se muestra lo que haya. */
function attrSummary(attributes: Record<string, string>): string {
  const keys = ["zona", "zone", "zone_interest", "presupuesto", "budget", "company", "role"];
  const vals = keys.map((k) => attributes?.[k]).filter(Boolean);
  return vals.length ? vals.join(" · ") : "—";
}

function PendingLeads({ contacts }: { contacts: ContactOut[] }) {
  const rows = pending(contacts).slice(0, 5);

  if (rows.length === 0) {
    return (
      <p className="font-headline text-[13px] text-muted-foreground">
        No hay contactos abiertos. Todo lo que entró está cerrado o convertido.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr>
            {["Contacto", "Datos capturados", "Último mensaje", "Espera"].map((h) => (
              <th
                key={h}
                className="border-b border-app-border pb-2.5 pr-4 text-left font-label text-[9.5px] uppercase tracking-[0.16em] text-app-label last:pr-0 last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const chip = TEMP_CHIP[c.temperature] ?? TEMP_CHIP.unset;
            const stale = c.temperature === "hot" && isStale(c.last_activity_at);
            return (
              <tr key={c.id} className="border-b border-app-border last:border-0">
                <td className="py-3 pr-4 align-top">
                  <Link
                    href="/crm"
                    className="font-headline text-[13px] font-semibold text-foreground hover:text-info"
                  >
                    {c.full_name || c.phone || c.email || "Sin nombre"}
                  </Link>
                  <span
                    className="ml-2 inline-block rounded-full px-1.5 py-0.5 align-middle font-label text-[9px] uppercase tracking-wider"
                    style={{
                      color: chip.token,
                      backgroundColor: `color-mix(in oklab, ${chip.token} 13%, transparent)`,
                    }}
                  >
                    {chip.label}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top font-headline text-xs text-muted-foreground">
                  {attrSummary(c.attributes)}
                </td>
                <td className="max-w-[240px] py-3 pr-4 align-top font-headline text-xs text-muted-foreground">
                  <span className="line-clamp-2">
                    {c.last_message ? `“${c.last_message}”` : "—"}
                  </span>
                </td>
                <td className="py-3 text-right align-top">
                  <span
                    className={`font-headline text-xs ${
                      stale ? "font-semibold text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {waited(c.last_activity_at)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
        <p className="mt-4 font-headline text-[13px] text-muted-foreground">
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
              <dt className="truncate font-headline text-[11.5px] text-muted-foreground">
                {s.label}
              </dt>
              <dd className="font-headline text-[13px] font-bold text-foreground">
                {s.value}
                <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
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

function Alerts({
  alerts,
  hotStale,
}: {
  alerts: MetricsSnapshot["alerts"];
  hotStale: number;
}) {
  const items = [
    ...(hotStale > 0
      ? [
          {
            metric: "hot_stale",
            issue: `${hotStale} lead${hotStale === 1 ? "" : "s"} caliente${
              hotStale === 1 ? "" : "s"
            } esperando hace más de ${HOT_WAIT_HOURS} h`,
            action: "Contestales vos o revisá que el agente esté activo.",
          },
        ]
      : []),
    ...alerts,
  ];

  if (items.length === 0) {
    return (
      <div className="flex items-start gap-2.5">
        {/* Icono + texto: el estado nunca viaja solo en el color. */}
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-headline text-[13px] font-medium text-foreground">
            Todo en orden
          </p>
          <p className="font-headline text-[11.5px] text-muted-foreground">
            Ninguna métrica cruzó su umbral.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((a) => (
        <li key={a.metric} className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0">
            <p className="font-headline text-[13px] font-medium text-foreground">{a.issue}</p>
            <p className="font-headline text-[11.5px] text-muted-foreground">{a.action}</p>
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
      <h2 className="font-headline text-lg font-extrabold tracking-[-0.02em] text-foreground">
        Conectá WhatsApp para arrancar
      </h2>
      <p className="mx-auto mt-2 max-w-md font-headline text-[13px] leading-relaxed text-muted-foreground">
        Todavía no entró ningún contacto. Escaneá el QR desde Integraciones y el
        agente empieza a atender y a calificar solo — los leads van a aparecer acá
        con su temperatura.
      </p>
      <Link
        href="/integraciones"
        className="mt-5 inline-flex items-center gap-1.5 rounded-[9px] bg-info px-4 py-2 font-headline text-[13px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
      >
        Conectar WhatsApp
        <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}

export function DashboardReal({
  metrics,
  contacts,
}: {
  metrics: MetricsSnapshot;
  contacts: ContactOut[];
}) {
  const dist = metrics.temperature_distribution || {};
  const totalContacts = Object.values(dist).reduce((a, b) => a + b, 0);
  const series = metrics.leads_daily ?? [];

  const hot = contacts.filter((c) => c.temperature === "hot");
  const hotStale = hot.filter((c) => isStale(c.last_activity_at)).length;

  // "Sin datos" ≠ "mal desempeño": sin ningún contacto todavía, lo útil es
  // decirle a la persona cómo empezar, no mostrarle cinco ceros.
  if (totalContacts === 0 && metrics.leads_new_7d === 0) {
    return (
      <div className="space-y-4">
        <FirstRun />
        <Card title="Alertas del orquestador">
          <Alerts alerts={metrics.alerts} hotStale={0} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NextAction pending={metrics.open_escalations} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile
          label="Leads (7 días)"
          value={String(metrics.leads_new_7d)}
          icon={Users}
          tone="var(--temp-cold)"
          hint={<Delta current={metrics.leads_new_7d} previous={metrics.leads_prev_7d ?? 0} />}
        >
          {series.length > 1 && <Sparkline series={series} />}
        </StatTile>

        <StatTile
          label="Calientes esperando"
          value={String(hot.length)}
          icon={Flame}
          tone="var(--temp-hot)"
          href="/crm"
          hint={
            hotStale > 0 ? (
              <span className="font-headline text-[11px] font-semibold text-destructive">
                {hotStale} hace más de {HOT_WAIT_HOURS} h
              </span>
            ) : (
              <span className="font-headline text-[11px] text-muted-foreground">
                todos al día
              </span>
            )
          }
        />

        <StatTile
          label="Clasificación automática"
          value={pct(metrics.auto_classification_rate)}
          icon={Sparkles}
          tone="var(--ai)"
          hint={
            <span className="font-headline text-[11px] text-muted-foreground">
              sin intervención humana
            </span>
          }
        />

        <StatTile
          label="Cola humana"
          value={String(metrics.open_escalations)}
          icon={Inbox}
          tone="var(--temp-warm)"
          href="/seguimiento"
          hint={
            <span className="font-headline text-[11px] text-muted-foreground">
              esperando tu revisión
            </span>
          }
        />

        <StatTile
          label="MRR"
          value={money(metrics.mrr_cents)}
          icon={DollarSign}
          tone="var(--success)"
          hint={
            metrics.subscription_status !== "none" ? (
              <span className="font-headline text-[11px] text-muted-foreground">
                {metrics.subscription_status}
              </span>
            ) : undefined
          }
        />
      </div>

      <Card
        title="Leads por atender"
        action={
          <Link
            href="/crm"
            className="font-headline text-[11.5px] font-semibold text-info transition-opacity hover:opacity-80"
          >
            Ver los {contacts.length}
          </Link>
        }
      >
        <PendingLeads contacts={contacts} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Pipeline por temperatura" className="lg:col-span-2">
          <TemperatureBar dist={dist} />
        </Card>

        <Card title="Alertas del orquestador">
          <Alerts alerts={metrics.alerts} hotStale={hotStale} />
        </Card>
      </div>
    </div>
  );
}
