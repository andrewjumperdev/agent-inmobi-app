"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Phone, Mail, Clock, Bot, User, Loader2 } from "lucide-react";
import type { ContactOut, MessageOut } from "@/lib/kore/client";

const STAGES = [
  { id: "lead", label: "Nuevo", color: "#e2e8f0" },
  { id: "qualified", label: "Calificado", color: "#3b82f6" },
  { id: "in_proposal", label: "Propuesta", color: "#fb923c" },
  { id: "customer", label: "Cliente", color: "#22c55e" },
  { id: "lost", label: "Perdido", color: "#64748b" },
];
const TEMP: Record<string, { label: string; color: string }> = {
  hot: { label: "Caliente", color: "#ef4444" },
  warm: { label: "Tibio", color: "#eab308" },
  cold: { label: "Frío", color: "#94a3b8" },
  unset: { label: "Sin calificar", color: "#475569" },
};
const ATTR_LABELS: Record<string, string> = {
  role: "Cargo",
  company: "Empresa",
  company_size: "Tamaño de empresa",
  pain: "Dolor / necesidad",
  email: "Email",
  budget: "Presupuesto",
  zone: "Zona",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function LeadDetail({
  contact,
  onClose,
  onStageChanged,
}: {
  contact: ContactOut;
  onClose: () => void;
  onStageChanged: (id: string, stage: string) => void;
}) {
  const [stage, setStage] = useState(contact.lifecycle_stage);
  const [msgs, setMsgs] = useState<MessageOut[] | null>(null);

  useEffect(() => {
    setStage(contact.lifecycle_stage);
    setMsgs(null);
    fetch(`/api/crm/contacts/${contact.id}/messages`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setMsgs(Array.isArray(d) ? d : []))
      .catch(() => setMsgs([]));
  }, [contact.id, contact.lifecycle_stage]);

  async function changeStage(s: string) {
    setStage(s);
    onStageChanged(contact.id, s);
    await fetch(`/api/crm/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lifecycle_stage: s }),
    });
  }

  const t = TEMP[contact.temperature] ?? TEMP.unset;
  const attrs = Object.entries(contact.attributes || {}).filter(([, v]) => v);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="flex h-full w-[360px] shrink-0 flex-col border-l"
      style={{ backgroundColor: "#0a0a12", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b p-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-lg font-bold" style={{ color: "#f1f5f9" }}>
            {contact.full_name || contact.phone || "Sin nombre"}
          </p>
          <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${t.color}1f`, color: t.color }}>
            {t.label}
          </span>
        </div>
        <button onClick={onClose}><X size={18} style={{ color: "#64748b" }} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Datos */}
        <div className="flex flex-col gap-2 text-sm" style={{ color: "#cbd5e1" }}>
          {contact.phone && <Row icon={<Phone size={14} />} v={contact.phone} />}
          {contact.email && <Row icon={<Mail size={14} />} v={contact.email} />}
          <Row icon={<Clock size={14} />} v={`Últ. actividad: ${fmt(contact.last_activity_at)}`} />
        </div>

        {/* Capturado por la IA */}
        <p className="mb-2 mt-6 text-[11px] uppercase tracking-widest" style={{ color: "#64748b" }}>
          Capturado por la IA
        </p>
        {attrs.length === 0 ? (
          <p className="text-sm" style={{ color: "#475569" }}>Todavía sin datos. Aparecen a medida que el agente califica.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attrs.map(([k, v]) => (
              <div key={k} className="rounded-lg p-2.5" style={{ backgroundColor: "#10101c" }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>{ATTR_LABELS[k] ?? k}</p>
                <p className="text-sm" style={{ color: "#f1f5f9" }}>{String(v)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Etapa */}
        <p className="mb-2 mt-6 text-[11px] uppercase tracking-widest" style={{ color: "#64748b" }}>Etapa del pipeline</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => changeStage(s.id)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
              style={stage === s.id
                ? { backgroundColor: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55` }
                : { color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Conversación */}
        <p className="mb-2 mt-6 text-[11px] uppercase tracking-widest" style={{ color: "#64748b" }}>Conversación</p>
        {msgs === null ? (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}><Loader2 size={13} className="animate-spin" /> Cargando…</div>
        ) : msgs.length === 0 ? (
          <p className="text-sm" style={{ color: "#475569" }}>Sin mensajes aún.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {msgs.map((m) => {
              const isAgent = m.direction === "outbound";
              return (
                <div key={m.id} className={`flex gap-2 ${isAgent ? "flex-row-reverse" : ""}`}>
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: isAgent ? "rgba(59,130,246,0.15)" : "#1e2536" }}>
                    {isAgent ? <Bot size={12} style={{ color: "#3b82f6" }} /> : <User size={12} style={{ color: "#94a3b8" }} />}
                  </div>
                  <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: isAgent ? "#16213a" : "#10101c", color: "#e2e8f0" }}>
                    {m.body}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Row({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "#475569" }}>{icon}</span>
      <span className="truncate">{v}</span>
    </div>
  );
}
