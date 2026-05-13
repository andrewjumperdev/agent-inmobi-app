"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Database } from "@/lib/supabase/types";
import { STAGES, URGENCY_COLOR, OP_LABEL, SOURCE_ICON } from "./crm-board";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

/* ── Info row ──────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-sm w-5 text-center" style={{ color: "#334155" }}>{icon}</span>
      <span className="font-label text-[10px] uppercase tracking-widest w-20 shrink-0" style={{ color: "#334155" }}>{label}</span>
      <span className="text-sm" style={{ color: "#94a3b8" }}>{value}</span>
    </div>
  );
}

/* ── Stage selector ────────────────────────────────────────── */
function StageSelector({
  current,
  onChange,
}: {
  current: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>Etapa del pipeline</p>
      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((stage) => {
          const active = current === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => onChange(stage.id)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label text-[10px] uppercase tracking-widest transition-all"
              style={{
                backgroundColor: active ? `${stage.color}18` : "rgba(188,198,224,0.04)",
                color: active ? stage.color : "#334155",
                border: active ? `1px solid ${stage.color}40` : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="material-symbols-outlined text-xs">{stage.icon}</span>
              {stage.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Note composer ─────────────────────────────────────────── */
function NoteComposer({ initialNotes }: { initialNotes: string | null }) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function save() {
    if (!note.trim()) return;
    // In production: server action to append note
    setSaved(true);
    setNote("");
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="space-y-2">
      <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>Notas</p>
      {initialNotes && (
        <div
          className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
          style={{ backgroundColor: "#060609", color: "#64748b", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {initialNotes}
        </div>
      )}
      <div
        className="flex gap-2 rounded-xl p-2"
        style={{ backgroundColor: "#060609", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agregar nota…"
          rows={2}
          className="flex-1 resize-none bg-transparent text-xs outline-none placeholder:opacity-30"
          style={{ color: "#f1f5f9", lineHeight: "1.5" }}
        />
        <button
          onClick={save}
          disabled={!note.trim()}
          className="self-end flex h-7 w-7 items-center justify-center rounded-lg transition-all disabled:opacity-30"
          style={{
            backgroundColor: note.trim() ? "#3b82f6" : "#1e2a42",
            color: note.trim() ? "#ffffff" : "#334155",
          }}
        >
          {saved ? (
            <span className="material-symbols-outlined text-sm">check</span>
          ) : (
            <span className="material-symbols-outlined text-sm">send</span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Quick actions ─────────────────────────────────────────── */
function QuickActions({ lead }: { lead: Lead }) {
  const waLink = `https://wa.me/${lead.phone.replace(/\D/g, "")}`;

  const actions = [
    { icon: "chat",          label: "WhatsApp", href: waLink,                  color: "#25d366" },
    { icon: "phone",         label: "Llamar",   href: `tel:${lead.phone}`,    color: "#818cf8" },
    { icon: "mail",          label: "Email",    href: lead.email ? `mailto:${lead.email}` : null, color: "#fb923c" },
    { icon: "calendar_month", label: "Agendar", href: null,                    color: "#3b82f6" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((a) => (
        a.href ? (
          <a
            key={a.label}
            href={a.href}
            target={a.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all"
            style={{ backgroundColor: `${a.color}10`, border: `1px solid ${a.color}25` }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: a.color }}>{a.icon}</span>
            <span className="font-label text-[9px] uppercase tracking-widest" style={{ color: a.color }}>{a.label}</span>
          </a>
        ) : (
          <button
            key={a.label}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all opacity-30 cursor-not-allowed"
            style={{ backgroundColor: `${a.color}10`, border: `1px solid ${a.color}25` }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: a.color }}>{a.icon}</span>
            <span className="font-label text-[9px] uppercase tracking-widest" style={{ color: a.color }}>{a.label}</span>
          </button>
        )
      ))}
    </div>
  );
}

/* ── Main detail panel ─────────────────────────────────────── */
export function LeadDetail({
  lead,
  onClose,
  onStageChange,
}: {
  lead: Lead;
  onClose: () => void;
  onStageChange: (stage: string) => void;
}) {
  const urg = URGENCY_COLOR[lead.urgency ?? "cold"] ?? URGENCY_COLOR.cold;
  const currentStage = STAGES.find((s) => s.id === (lead.pipeline_stage ?? "nuevo")) ?? STAGES[0];

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: "320px",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        backgroundColor: "#080812",
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-3 px-5 py-4 sticky top-0 z-10"
        style={{ backgroundColor: "#0c0c14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-headline text-base font-bold"
            style={{ backgroundColor: `${currentStage.color}18`, color: currentStage.color }}
          >
            {(lead.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>
              {lead.name ?? "Sin nombre"}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {lead.urgency && (
                <span
                  className="rounded-full px-1.5 py-0.5 font-label text-[9px] uppercase tracking-widest"
                  style={{ backgroundColor: urg.bg, color: urg.text }}
                >
                  {urg.label}
                </span>
              )}
              {lead.operation_type && (
                <span className="font-label text-[10px]" style={{ color: "#334155" }}>
                  {OP_LABEL[lead.operation_type] ?? lead.operation_type}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 transition-colors hover:bg-white/5 mt-0.5"
          style={{ color: "#334155" }}
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 px-5 py-5">
        {/* Quick actions */}
        <QuickActions lead={lead} />

        {/* Contact info */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ backgroundColor: "#0c0c14" }}
        >
          <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>Contacto</p>
          <InfoRow icon="phone" label="Teléfono" value={lead.phone} />
          {lead.email && <InfoRow icon="mail" label="Email" value={lead.email} />}
          <InfoRow icon={SOURCE_ICON[lead.source ?? ""] ?? "person"} label="Fuente" value={lead.source ?? "Directo"} />
          <InfoRow icon="schedule" label="Ingresó" value={formatDate(lead.created_at)} />
          {lead.last_contact_at && (
            <InfoRow icon="history" label="Último cont." value={timeAgo(lead.last_contact_at) ?? "—"} />
          )}
          {lead.next_followup_at && (
            <InfoRow
              icon="alarm"
              label="Seguimiento"
              value={formatDate(lead.next_followup_at)}
            />
          )}
        </div>

        {/* Property interest */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ backgroundColor: "#0c0c14" }}
        >
          <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>Interés</p>
          {lead.zone_interest && <InfoRow icon="location_on" label="Zona" value={lead.zone_interest} />}
          {lead.property_type && <InfoRow icon="home" label="Tipo" value={lead.property_type} />}
          <InfoRow
            icon="payments"
            label="Presupuesto"
            value={
              lead.budget_min
                ? `$${lead.budget_min.toLocaleString()}${lead.budget_max ? ` – $${lead.budget_max.toLocaleString()}` : ""}`
                : "No especificado"
            }
          />
          {lead.score && (
            <InfoRow
              icon="star"
              label="Score"
              value={
                lead.score === "qualified" ? "Calificado"
                : lead.score === "unqualified" ? "No calificado"
                : "Pendiente"
              }
            />
          )}
        </div>

        {/* Pipeline stage */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#0c0c14" }}
        >
          <StageSelector
            current={lead.pipeline_stage ?? "nuevo"}
            onChange={onStageChange}
          />
        </div>

        {/* Notes */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#0c0c14" }}
        >
          <NoteComposer initialNotes={lead.notes} />
        </div>
      </div>
    </motion.div>
  );
}
