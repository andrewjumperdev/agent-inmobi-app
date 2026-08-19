"use client";

/**
 * ⚠️ MAQUETA — TODOS LOS DATOS DE ESTE ARCHIVO SON INVENTADOS. NO CONECTAR.
 *
 * Componente huérfano: `app/(app)/analytics/page.tsx` renderiza <ComingSoon />,
 * así que hoy ningún cliente ve esto. Se conserva como referencia de diseño
 * para cuando la feature exista de verdad.
 *
 * Antes de darle uso hay que reemplazar TODAS las constantes de abajo por datos
 * del backend. Ojo con lo que hoy no existe en el backend y no se puede
 * simplemente "conectar":
 *   - FUNNEL_DATA      → no hay conteo por etapa del pipeline expuesto.
 *   - LEADS_OVER_TIME  → generado con Math.random(); no hay serie temporal.
 *   - SOURCE_DATA      → no hay atribución de fuente agregada.
 *   - CAMPAIGN_DATA    → no hay integración con Meta/Google Ads. Es ficción.
 *   - KPIS             → "costo por lead" y "pipeline proyectado" no se calculan
 *                        en ningún lado.
 *
 * Lo que el backend SÍ expone hoy es GET /metrics (MetricsSnapshot): leads de
 * los últimos 7 días, distribución de temperatura, tasa de clasificación
 * automática, escalaciones abiertas y MRR. El Dashboard ya lo consume.
 *
 * Publicar estos números tal cual sería mostrarle a un cliente que paga métricas
 * fabricadas sobre su propio negocio.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ── Mock data ───────────────────────────────────────────── */
const FUNNEL_DATA = [
  { stage: "Nuevo",       leads: 142, fill: "var(--foreground)" },
  { stage: "Contactado",  leads: 98,  fill: "var(--ai)" },
  { stage: "Calificado",  leads: 67,  fill: "var(--info)" },
  { stage: "Cita",        leads: 38,  fill: "var(--warning)" },
  { stage: "Negociación", leads: 21,  fill: "var(--warning)" },
  { stage: "Cerrado",     leads: 11,  fill: "var(--success)" },
];

const LEADS_OVER_TIME = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
  const label = date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  return {
    date: label,
    leads:   Math.floor(3 + Math.random() * 9),
    citas:   Math.floor(0 + Math.random() * 3),
    cerrados: Math.random() > 0.75 ? 1 : 0,
  };
});

const SOURCE_DATA = [
  { name: "WhatsApp",  value: 38, color: "var(--success)" },
  { name: "Landing",   value: 27, color: "var(--info)" },
  { name: "Formulario",value: 18, color: "var(--ai)" },
  { name: "Referido",  value: 11, color: "var(--warning)" },
  { name: "Directo",   value: 6,  color: "#6366f1"  },
];

const CAMPAIGN_DATA = [
  { name: "Palermo — Dept 3 amb", platform: "Meta", leads: 42, cpl: 3.8, ctr: "2.4%", status: "active"   },
  { name: "San Isidro — Casas",   platform: "Meta", leads: 31, cpl: 5.2, ctr: "1.9%", status: "active"   },
  { name: "Microcentro — Local",  platform: "Google",leads: 19, cpl: 7.1, ctr: "3.1%", status: "active"  },
  { name: "Belgrano — Dpto",      platform: "Meta", leads: 14, cpl: 6.4, ctr: "1.5%", status: "paused"   },
  { name: "Recoleta — PH",        platform: "Google",leads: 8,  cpl: 9.8, ctr: "2.8%", status: "paused"  },
];

/* ── Custom tooltip ──────────────────────────────────────── */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ backgroundColor: "var(--app-topbar)", border: "1px solid var(--app-border)", color: "var(--foreground)" }}
    >
      <p className="mb-1 font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ── KPI cards ───────────────────────────────────────────── */
const KPIS = [
  { label: "Leads este mes",      value: "357",    change: "+14%",  up: true,  icon: "person_add",       accent: false },
  { label: "Tasa de conversión",  value: "7.7%",   change: "+0.9%", up: true,  icon: "conversion_path",  accent: true  },
  { label: "Costo por lead",      value: "$5.4",   change: "-0.6",  up: true,  icon: "payments",         accent: false },
  { label: "Pipeline proyectado", value: "$2.1M",  change: "+$320k",up: true,  icon: "trending_up",      accent: false },
];

function KpiCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {KPIS.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl p-5"
          style={{
            backgroundColor: "var(--app-surface)",
            border: kpi.accent
              ? "1px solid color-mix(in oklab, var(--info) 20%, transparent)"
              : "1px solid var(--app-border)",
            background: kpi.accent
              ? "linear-gradient(135deg, color-mix(in oklab, var(--info) 6%, transparent) 0%, var(--app-surface) 60%)"
              : "var(--app-surface)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: kpi.accent ? "var(--info)" : "color-mix(in oklab, var(--info) 8%, transparent)" }}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{
                  color: kpi.accent ? "#ffffff" : "var(--info)",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                {kpi.icon}
              </span>
            </div>
            <span
              className="flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: kpi.up ? "var(--success)" : "var(--destructive)" }}
            >
              <span className="material-symbols-outlined text-sm">
                {kpi.up ? "arrow_upward" : "arrow_downward"}
              </span>
              {kpi.change}
            </span>
          </div>
          <p className="font-headline text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {kpi.value}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            {kpi.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ── Section wrapper ─────────────────────────────────────── */
function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-5"
      style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="material-symbols-outlined text-base"
          style={{ color: "var(--info)", fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <h2 className="font-headline text-sm font-bold" style={{ color: "var(--foreground)" }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Funnel chart ────────────────────────────────────────── */
function FunnelChart() {
  return (
    <Section title="Embudo de conversión" icon="filter_alt" delay={0.1}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={FUNNEL_DATA}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke="var(--app-border)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="stage"
            width={82}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--app-border)" }} />
          <Bar dataKey="leads" radius={[0, 4, 4, 0]} name="Leads">
            {FUNNEL_DATA.map((entry, i) => (
              <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Conversion rates */}
      <div className="mt-4 flex flex-wrap gap-3">
        {FUNNEL_DATA.slice(0, -1).map((stage, i) => {
          const next = FUNNEL_DATA[i + 1];
          const rate = Math.round((next.leads / stage.leads) * 100);
          return (
            <div
              key={stage.stage}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ backgroundColor: "var(--app-border)" }}
            >
              <span className="text-[11px]" style={{ color: stage.fill }}>
                {stage.stage}
              </span>
              <span className="material-symbols-outlined text-xs" style={{ color: "var(--muted-foreground)" }}>
                arrow_forward
              </span>
              <span className="text-[11px] font-semibold" style={{ color: next.fill }}>
                {rate}%
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── Trend chart ─────────────────────────────────────────── */
function TrendChart() {
  const [range, setRange] = useState<7 | 14 | 30>(30);
  const data = LEADS_OVER_TIME.slice(-range);

  return (
    <Section title="Leads en el tiempo" icon="show_chart" delay={0.15}>
      {/* Range selector */}
      <div className="mb-4 flex gap-1">
        {([7, 14, 30] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="rounded px-2.5 py-1 font-label text-[10px] uppercase tracking-widest transition-colors"
            style={{
              backgroundColor: range === r ? "color-mix(in oklab, var(--info) 12%, transparent)" : "transparent",
              color: range === r ? "var(--info)" : "var(--muted-foreground)",
              border: range === r ? "1px solid color-mix(in oklab, var(--info) 20%, transparent)" : "1px solid transparent",
            }}
          >
            {r}d
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--info)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--info)" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gradCitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--warning)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--app-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={range === 30 ? 6 : range === 14 ? 3 : 1}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "color-mix(in oklab, var(--info) 20%, transparent)" }} />
          <Area
            type="monotone"
            dataKey="leads"
            name="Leads"
            stroke="var(--info)"
            strokeWidth={2}
            fill="url(#gradLeads)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--info)" }}
          />
          <Area
            type="monotone"
            dataKey="citas"
            name="Citas"
            stroke="var(--warning)"
            strokeWidth={1.5}
            fill="url(#gradCitas)"
            dot={false}
            activeDot={{ r: 3, fill: "var(--warning)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Section>
  );
}

/* ── Source pie chart ────────────────────────────────────── */
function SourceChart() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const total = SOURCE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <Section title="Fuente de leads" icon="hub" delay={0.2}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={SOURCE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              stroke="none"
            >
              {SOURCE_DATA.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  fillOpacity={activeIdx === null || activeIdx === i ? 0.9 : 0.35}
                  style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2">
          {SOURCE_DATA.map((item, i) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div
                key={item.name}
                className="flex items-center gap-2"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color, opacity: activeIdx === null || activeIdx === i ? 1 : 0.35 }}
                />
                <span className="flex-1 text-xs" style={{ color: activeIdx === i ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {item.name}
                </span>
                <span className="font-label text-xs font-semibold" style={{ color: item.color }}>
                  {pct}%
                </span>
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${pct * 0.8}px`,
                    minWidth: "8px",
                    backgroundColor: item.color,
                    opacity: activeIdx === null || activeIdx === i ? 0.6 : 0.2,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ── Campaign table ──────────────────────────────────────── */
function CampaignTable() {
  return (
    <Section title="Rendimiento de campañas" icon="campaign" delay={0.25}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--app-border)" }}>
              {["Campaña", "Plataforma", "Leads", "CPL", "CTR", "Estado"].map((h) => (
                <th
                  key={h}
                  className="pb-2 text-left font-label text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAMPAIGN_DATA.map((row, i) => {
              const isActive = row.status === "active";
              return (
                <motion.tr
                  key={row.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  style={{ borderBottom: "1px solid var(--app-border)" }}
                >
                  <td className="py-3 pr-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {row.name}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className="rounded px-1.5 py-0.5 font-label text-[9px] uppercase tracking-widest"
                      style={{
                        backgroundColor: row.platform === "Meta" ? "rgba(129,140,248,0.12)" : "rgba(251,146,60,0.12)",
                        color: row.platform === "Meta" ? "var(--ai)" : "var(--warning)",
                      }}
                    >
                      {row.platform}
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-semibold" style={{ color: "var(--info)" }}>
                    {row.leads}
                  </td>
                  <td className="py-3 pr-3" style={{ color: "var(--muted-foreground)" }}>
                    ${row.cpl}
                  </td>
                  <td className="py-3 pr-3" style={{ color: "var(--muted-foreground)" }}>
                    {row.ctr}
                  </td>
                  <td className="py-3">
                    <span
                      className="flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-label text-[9px] uppercase tracking-widest"
                      style={{
                        backgroundColor: isActive ? "color-mix(in oklab, var(--success) 12%, transparent)" : "var(--app-border)",
                        color: isActive ? "var(--success)" : "var(--muted-foreground)",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isActive ? "var(--success)" : "var(--muted-foreground)" }}
                      />
                      {isActive ? "Activa" : "Pausada"}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ── Period selector ─────────────────────────────────────── */
const PERIODS = ["Hoy", "7d", "30d", "90d", "Este año"] as const;
type Period = (typeof PERIODS)[number];

/* ── Main analytics view ─────────────────────────────────── */
export function AnalyticsView() {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <div
      className="flex flex-col flex-1 min-h-svh"
      style={{ backgroundColor: "var(--app-canvas)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6"
        style={{
          backgroundColor: "var(--app-topbar)",
          borderColor: "var(--app-border)",
          boxShadow: "0 0 20px color-mix(in oklab, var(--info) 4%, transparent)",
        }}
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" style={{ color: "var(--muted-foreground)" }} />
          <Separator orientation="vertical" className="h-4 opacity-30" />
          <span
            className="material-symbols-outlined text-lg"
            style={{ color: "var(--info)", fontVariationSettings: "'FILL' 1" }}
          >
            bar_chart_4_bars
          </span>
          <h1
            className="font-headline text-sm font-bold uppercase tracking-tighter"
            style={{ color: "var(--foreground)" }}
          >
            Analytics
          </h1>
        </div>

        {/* Period selector */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-1"
          style={{ backgroundColor: "var(--app-border)" }}
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="rounded-md px-3 py-1 font-label text-[11px] transition-colors"
              style={{
                backgroundColor: period === p ? "var(--app-surface)" : "transparent",
                color: period === p ? "var(--info)" : "var(--muted-foreground)",
                boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <KpiCards />

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FunnelChart />
          <TrendChart />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SourceChart />
          <div className="lg:col-span-2">
            <CampaignTable />
          </div>
        </div>
      </div>
    </div>
  );
}
