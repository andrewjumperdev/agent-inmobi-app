"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Phone, Mail, Clock, Bot, User, Loader2 } from "lucide-react";
import type { ContactOut, MessageOut } from "@/lib/kore/client";

const STAGES = [
  { id: "lead", label: "Nuevo", color: "var(--foreground)" },
  { id: "qualified", label: "Calificado", color: "var(--info)" },
  { id: "in_proposal", label: "Propuesta", color: "var(--warning)" },
  { id: "customer", label: "Cliente", color: "var(--success)" },
  { id: "lost", label: "Perdido", color: "var(--muted-foreground)" },
];
const TEMP: Record<string, { label: string; color: string }> = {
  hot: { label: "Caliente", color: "var(--destructive)" },
  warm: { label: "Tibio", color: "var(--warning)" },
  cold: { label: "Frío", color: "var(--muted-foreground)" },
  unset: { label: "Sin calificar", color: "var(--muted-foreground)" },
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
  // `paused_until` en el futuro = una persona tomó la conversación.
  const [pausedUntil, setPausedUntil] = useState<string | null>(
    contact.paused_until ?? null
  );
  const [switching, setSwitching] = useState(false);

  const isPaused = pausedUntil !== null && new Date(pausedUntil) > new Date();

  useEffect(() => {
    setStage(contact.lifecycle_stage);
    setPausedUntil(contact.paused_until ?? null);
    setMsgs(null);
    fetch(`/api/crm/contacts/${contact.id}/messages`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setMsgs(Array.isArray(d) ? d : []))
      .catch(() => setMsgs([]));
  }, [contact.id, contact.lifecycle_stage, contact.paused_until]);

  async function changeStage(s: string) {
    setStage(s);
    onStageChanged(contact.id, s);
    await fetch(`/api/crm/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lifecycle_stage: s }),
    });
  }

  async function toggleAgent() {
    setSwitching(true);
    // Optimista al revés: NO adelantamos el estado. Si el corte falla, mostrar
    // "pausado" cuando el agente sigue contestando es peor que un botón lento.
    try {
      const res = await fetch(`/api/crm/contacts/${contact.id}/pause`, {
        method: isPaused ? "DELETE" : "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as { paused_until?: string | null };
        setPausedUntil(data.paused_until ?? null);
      }
    } finally {
      setSwitching(false);
    }
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
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b p-5" style={{ borderColor: "var(--app-border)" }}>
        <div>
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {contact.full_name || contact.phone || "Sin nombre"}
          </p>
          <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${t.color}1f`, color: t.color }}>
            {t.label}
          </span>
        </div>
        <button onClick={onClose} aria-label="Cerrar detalle">
          <X size={18} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Control del agente. Va arriba de todo y no escondido en un menú: es lo
          que alguien busca con urgencia cuando el agente dice algo que no debía. */}
      <div
        className="flex items-center justify-between gap-3 border-b px-5 py-3"
        style={{
          borderColor: "var(--app-border)",
          backgroundColor: isPaused
            ? "color-mix(in oklab, var(--warning) 8%, transparent)"
            : "transparent",
        }}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            {isPaused ? "Lo atendés vos" : "Lo atiende el agente"}
          </p>
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            {isPaused
              ? `El agente vuelve el ${new Date(pausedUntil!).toLocaleString("es-AR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}`
              : "Responde solo por WhatsApp"}
          </p>
        </div>
        <button
          onClick={toggleAgent}
          disabled={switching}
          className="shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
          style={{
            borderColor: isPaused ? "var(--success)" : "var(--warning)",
            color: isPaused ? "var(--success)" : "var(--warning)",
          }}
        >
          {switching ? "…" : isPaused ? "Reanudar agente" : "Tomar control"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Datos */}
        <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--foreground)" }}>
          {contact.phone && <Row icon={<Phone size={14} />} v={contact.phone} />}
          {contact.email && <Row icon={<Mail size={14} />} v={contact.email} />}
          <Row icon={<Clock size={14} />} v={`Últ. actividad: ${fmt(contact.last_activity_at)}`} />
        </div>

        {/* Capturado por la IA */}
        <p className="mb-2 mt-6 text-[11px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
          Capturado por la IA
        </p>
        {attrs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Todavía sin datos. Aparecen a medida que el agente califica.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attrs.map(([k, v]) => (
              <div key={k} className="rounded-lg p-2.5" style={{ backgroundColor: "var(--app-surface-hover)" }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{ATTR_LABELS[k] ?? k}</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{String(v)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Etapa */}
        <p className="mb-2 mt-6 text-[11px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Etapa del pipeline</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => changeStage(s.id)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
              style={stage === s.id
                ? { backgroundColor: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55` }
                : { color: "var(--muted-foreground)", border: "1px solid var(--app-border)" }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Conversación */}
        <p className="mb-2 mt-6 text-[11px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Conversación</p>
        {msgs === null ? (
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}><Loader2 size={13} className="animate-spin" /> Cargando…</div>
        ) : msgs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin mensajes aún.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {msgs.map((m) => {
              const isAgent = m.direction === "outbound";
              return (
                <div key={m.id} className={`flex gap-2 ${isAgent ? "flex-row-reverse" : ""}`}>
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: isAgent ? "color-mix(in oklab, var(--info) 15%, transparent)" : "var(--muted)" }}>
                    {isAgent ? <Bot size={12} style={{ color: "var(--info)" }} /> : <User size={12} style={{ color: "var(--muted-foreground)" }} />}
                  </div>
                  <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: isAgent ? "color-mix(in oklab, var(--info) 12%, var(--app-surface-hover))" : "var(--app-surface-hover)", color: "var(--foreground)" }}>
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
      <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>
      <span className="truncate">{v}</span>
    </div>
  );
}
