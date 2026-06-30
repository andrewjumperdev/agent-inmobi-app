import { Users, Sparkles, Snowflake, BellRing, DollarSign, AlertTriangle } from "lucide-react";
import type { MetricsSnapshot } from "@/lib/kore/client";

const TEMP_META: { key: string; label: string; color: string }[] = [
  { key: "hot", label: "Caliente", color: "#ef4444" },
  { key: "warm", label: "Tibio", color: "#eab308" },
  { key: "cold", label: "Frío", color: "#94a3b8" },
  { key: "unset", label: "Sin calificar", color: "#475569" },
];

export function DashboardReal({ metrics }: { metrics: MetricsSnapshot }) {
  const dist = metrics.temperature_distribution || {};
  const totalTemp = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

  const cards = [
    { label: "Leads (7 días)", value: String(metrics.leads_new_7d), icon: Users, color: "#3b82f6" },
    {
      label: "Clasificación automática",
      value: `${Math.round((metrics.auto_classification_rate || 0) * 100)}%`,
      icon: Sparkles,
      color: "#a855f7",
    },
    { label: "Frío en pipeline", value: `${Math.round((metrics.cold_share || 0) * 100)}%`, icon: Snowflake, color: "#94a3b8" },
    { label: "Cola humana", value: String(metrics.open_escalations), icon: BellRing, color: "#fb923c" },
    { label: "MRR", value: `$${(metrics.mrr_cents / 100).toLocaleString("es-AR")}`, icon: DollarSign, color: "#22c55e" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col gap-3 rounded-2xl border p-5"
            style={{ backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.color}18` }}>
              <c.icon size={16} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: "#f1f5f9" }}>{c.value}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Distribución de temperatura */}
        <div
          className="rounded-2xl border p-5 lg:col-span-2"
          style={{ backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: "#64748b" }}>
            Distribución del pipeline por temperatura
          </p>
          <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#060609" }}>
            {TEMP_META.map((t) => {
              const v = dist[t.key] || 0;
              const pct = (v / totalTemp) * 100;
              return pct > 0 ? <div key={t.key} style={{ width: `${pct}%`, backgroundColor: t.color }} /> : null;
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {TEMP_META.map((t) => (
              <div key={t.key} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-sm" style={{ color: "#cbd5e1" }}>{t.label}</span>
                <span className="text-sm font-bold" style={{ color: "#f1f5f9" }}>{dist[t.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas del orquestador */}
        <div
          className="rounded-2xl border p-5"
          style={{ backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: "#64748b" }}>
            Alertas del orquestador
          </p>
          {metrics.alerts.length === 0 ? (
            <p className="text-sm" style={{ color: "#22c55e" }}>Todo en orden ✓</p>
          ) : (
            <div className="flex flex-col gap-3">
              {metrics.alerts.map((a) => (
                <div key={a.metric} className="flex gap-2.5">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "#eab308" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{a.issue}</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>{a.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
