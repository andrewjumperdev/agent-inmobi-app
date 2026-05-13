"use client";

import { motion } from "framer-motion";
import type { Database } from "@/lib/supabase/types";
import type { Kpis } from "./captacion-view";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

/* ── Color maps ────────────────────────────────────────────── */
const URGENCY_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  hot:  { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", label: "Caliente" },
  warm: { bg: "rgba(234,179,8,0.12)",  text: "#eab308", label: "Tibio"    },
  cold: { bg: "rgba(188,198,224,0.12)", text: "#e2e8f0", label: "Frío"     },
};

const SOURCE_ICON: Record<string, string> = {
  whatsapp: "chat",
  formulario: "article",
  landing: "web",
  directo: "person",
  referido: "group",
};

const OP_LABEL: Record<string, string> = {
  compra: "Comprador",
  venta: "Vendedor",
  inversion: "Inversor",
};

/* ── KPI card ──────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, accent, icon, delay,
}: {
  label: string; value: string | number; sub?: string;
  accent?: boolean; icon: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl p-6"
      style={{ backgroundColor: "#0c0c14", border: accent ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.06)" }}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 60%)" }} />
      )}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-label block text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>{label}</span>
          <p className="font-headline mt-1 text-3xl font-extrabold tracking-tight" style={{ color: accent ? "#3b82f6" : "#f1f5f9" }}>{value}</p>
          {sub && <p className="mt-1 text-xs" style={{ color: "#334155" }}>{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accent ? "rgba(59,130,246,0.12)" : "rgba(188,198,224,0.08)" }}>
          <span className="material-symbols-outlined text-lg" style={{ color: accent ? "#3b82f6" : "#e2e8f0" }}>{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Funnel bar ────────────────────────────────────────────── */
function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-label text-xs uppercase tracking-widest" style={{ color: "#94a3b8" }}>{label}</span>
        <span className="font-headline text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "#060609" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-[10px]" style={{ color: "#334155" }}>{pct}% del total</span>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function CaptacionOverview({ leads, kpis }: { leads: Lead[]; kpis: Kpis }) {
  const qualifiedPct = kpis.total > 0 ? Math.round((kpis.qualified / kpis.total) * 100) : 0;
  const recent = leads.slice(0, 8);

  // Source breakdown
  const sourceEntries = Object.entries(kpis.sourceCounts).sort((a, b) => b[1] - a[1]);

  // Mock data when empty (so the UI always looks good in testing)
  const showMock = kpis.total === 0;
  const displayKpis = showMock
    ? { total: 48, qualified: 31, hot: 12, unclassified: 5, newToday: 3 }
    : kpis;
  const displayQualifiedPct = showMock ? 65 : qualifiedPct;

  const mockLeads: Partial<Lead>[] = showMock
    ? [
        { id: "1", name: "Martín Rodríguez", phone: "+54911234567", source: "whatsapp", urgency: "hot",  operation_type: "compra",  budget_min: 80000,  budget_max: 120000, zone_interest: "Palermo",   created_at: new Date().toISOString() },
        { id: "2", name: "Ana López",        phone: "+54911234568", source: "formulario", urgency: "warm", operation_type: "venta",   budget_min: null,   budget_max: null,   zone_interest: "Belgrano",  created_at: new Date().toISOString() },
        { id: "3", name: "Carlos Méndez",    phone: "+54911234569", source: "landing",    urgency: "cold", operation_type: "inversion", budget_min: 200000, budget_max: 500000, zone_interest: "Recoleta",  created_at: new Date().toISOString() },
        { id: "4", name: "Laura García",     phone: "+54911234570", source: "referido",   urgency: "hot",  operation_type: "compra",  budget_min: 150000, budget_max: 250000, zone_interest: "Caballito", created_at: new Date().toISOString() },
        { id: "5", name: "Diego Torres",     phone: "+54911234571", source: "whatsapp",   urgency: "warm", operation_type: "compra",  budget_min: 50000,  budget_max: 80000,  zone_interest: "Flores",    created_at: new Date().toISOString() },
      ]
    : recent;

  const mockSources = showMock
    ? [["whatsapp", 22], ["formulario", 14], ["landing", 8], ["referido", 4]] as [string, number][]
    : sourceEntries;

  return (
    <div className="space-y-8">
      {showMock && (
        <div className="rounded-xl border px-4 py-3 text-sm flex items-center gap-2" style={{ borderColor: "rgba(59,130,246,0.2)", backgroundColor: "rgba(59,130,246,0.05)", color: "#3b82f6" }}>
          <span className="material-symbols-outlined text-sm">info</span>
          Datos de demostración — conectá tu fuente de leads para ver datos reales.
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Leads totales"    value={displayKpis.total}           icon="group"        delay={0}    />
        <KpiCard label="Calificados"      value={`${displayQualifiedPct}%`}   icon="verified"     delay={0.06} accent />
        <KpiCard label="Calientes 🔥"     value={displayKpis.hot}             icon="local_fire_department" delay={0.12} sub="Urgencia alta" />
        <KpiCard label="Nuevos hoy"       value={displayKpis.newToday}        icon="add_circle"   delay={0.18} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl p-6 lg:col-span-2"
          style={{ backgroundColor: "#0c0c14" }}
        >
          <h2 className="font-headline mb-6 text-lg font-bold" style={{ color: "#f1f5f9" }}>
            Funnel de Captación
          </h2>
          <div className="space-y-5">
            <FunnelBar label="Total captados"   value={displayKpis.total}     max={displayKpis.total} color="#e2e8f0" />
            <FunnelBar label="Calificados"       value={displayKpis.qualified} max={displayKpis.total} color="#3b82f6" />
            <FunnelBar label="Calientes"         value={displayKpis.hot}       max={displayKpis.total} color="#ef4444" />
            <FunnelBar label="Sin clasificar"    value={displayKpis.unclassified} max={displayKpis.total} color="#eab308" />
          </div>
        </motion.div>

        {/* Sources */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl p-6"
          style={{ backgroundColor: "#0c0c14" }}
        >
          <h2 className="font-headline mb-6 text-lg font-bold" style={{ color: "#f1f5f9" }}>
            Fuentes
          </h2>
          <div className="space-y-3">
            {mockSources.map(([src, count]) => (
              <div key={src} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: "#3b82f6" }}>
                    {SOURCE_ICON[src] ?? "person"}
                  </span>
                  <span className="font-label text-xs capitalize" style={{ color: "#94a3b8" }}>
                    {src}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: "#060609" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#3b82f6" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((count / displayKpis.total) * 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent leads */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-6"
        style={{ backgroundColor: "#0c0c14" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold" style={{ color: "#f1f5f9" }}>
            Leads recientes
          </h2>
          <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>
            Últimos {mockLeads.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Nombre", "Fuente", "Operación", "Urgencia", "Presupuesto", "Zona"].map((h) => (
                  <th key={h} className="pb-3 pr-4 text-left font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(mockLeads as Lead[]).map((lead, i) => {
                const urg = URGENCY_COLOR[lead.urgency ?? "cold"] ?? URGENCY_COLOR.cold;
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                    className="group"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-headline text-xs font-bold" style={{ backgroundColor: "rgba(188,198,224,0.08)", color: "#e2e8f0" }}>
                          {(lead.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: "#f1f5f9" }}>{lead.name ?? "Sin nombre"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ color: "#3b82f6" }}>{SOURCE_ICON[lead.source ?? ""] ?? "person"}</span>
                        <span className="font-label text-xs capitalize" style={{ color: "#64748b" }}>{lead.source ?? "directo"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-label text-xs" style={{ color: "#94a3b8" }}>
                        {OP_LABEL[lead.operation_type ?? ""] ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {lead.urgency ? (
                        <span className="rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-widest" style={{ backgroundColor: urg.bg, color: urg.text }}>
                          {urg.label}
                        </span>
                      ) : (
                        <span style={{ color: "#334155" }}>—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-label text-xs" style={{ color: "#64748b" }}>
                      {lead.budget_min
                        ? `$${Number(lead.budget_min).toLocaleString()} – $${Number(lead.budget_max ?? lead.budget_min).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 font-label text-xs" style={{ color: "#64748b" }}>
                      {lead.zone_interest ?? "—"}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
