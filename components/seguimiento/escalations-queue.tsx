"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Inbox } from "lucide-react";
import type { EscalationOut } from "@/lib/kore/client";

const REASON: Record<string, { label: string; color: string }> = {
  price_signal:         { label: "Pregunta precio",      color: "#22c55e" },
  close_ready:          { label: "Listo para cerrar",    color: "#22c55e" },
  proposal_review:      { label: "Propuesta a revisar",  color: "#3b82f6" },
  content_review:       { label: "Contenido a revisar",  color: "#a855f7" },
  cannot_classify:      { label: "No se pudo clasificar",color: "#eab308" },
  pipeline_stale:       { label: "Pipeline sin avance",  color: "#fb923c" },
  overcontacted:        { label: "Contactado de más",    color: "#fb923c" },
  tech_block:           { label: "Bloqueo técnico",      color: "#ef4444" },
  payment_confirmation: { label: "Confirmar pago",       color: "#3b82f6" },
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "recién";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

export function EscalationsQueue({ items: initial }: { items: EscalationOut[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function resolve(id: string, status: "resolved" | "dismissed") {
    setBusy(id);
    const res = await fetch(`/api/seguimiento/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      setItems((xs) => xs.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <Inbox size={40} style={{ color: "#1e293b" }} />
        <p className="text-sm" style={{ color: "#64748b" }}>
          No hay nada esperando a un humano. La IA está manejando todo ✓
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 p-4 md:p-8">
      <p className="text-sm" style={{ color: "#64748b" }}>
        {items.length} {items.length === 1 ? "caso requiere" : "casos requieren"} tu atención. La IA preparó cada uno.
      </p>
      <AnimatePresence>
        {items.map((e) => {
          const r = REASON[e.reason] ?? { label: e.reason, color: "#64748b" };
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border p-4"
              style={{ backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: `${r.color}1f`, color: r.color }}
                    >
                      {r.label}
                    </span>
                    <span className="text-[11px]" style={{ color: "#475569" }}>{timeAgo(e.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{e.title}</p>
                  {e.executive_summary && (
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                      {e.executive_summary}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => resolve(e.id, "resolved")}
                    disabled={busy === e.id}
                    title="Resuelto"
                    className="flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-40"
                    style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }}
                  >
                    {busy === e.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={() => resolve(e.id, "dismissed")}
                    disabled={busy === e.id}
                    title="Descartar"
                    className="flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-40"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
