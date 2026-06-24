"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SEQUENCE_STEPS } from "./mock-data";
import { SCORE_COLORS, SCORE_LABELS, type LeadScore } from "./types";
import type { LiveExecution, CompletedExecution } from "@/app/(app)/seguimiento/page";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

/* ── Helpers ───────────────────────────────────────────────────── */
function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
}
function fillTemplate(tpl: string, name: string, property: string, zona: string) {
  return tpl
    .replace(/\{\{nombre\}\}/g, name.split(" ")[0])
    .replace(/\{\{propiedad\}\}/g, property)
    .replace(/\{\{zona\}\}/g, zona || "la zona");
}
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

/* ── Progress timeline ─────────────────────────────────────────── */
function ProgressTimeline({
  currentStep,
  totalSteps = 5,
  compact = false,
}: {
  currentStep: number;
  totalSteps?: number;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center ${compact ? "gap-0" : "gap-0"} w-full`}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const done    = i < currentStep - 1;
        const current = i === currentStep - 1;
        const pct     = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

        return (
          <div key={i} className="flex flex-1 items-center">
            {/* Node */}
            <div className="relative flex-shrink-0">
              <motion.div
                className={`flex items-center justify-center rounded-full font-bold ${compact ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-xs"}`}
                initial={false}
                animate={{
                  backgroundColor: done
                    ? "rgba(34,197,94,0.2)"
                    : current
                    ? "rgba(59,130,246,0.18)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: current
                    ? "0 0 12px rgba(59,130,246,0.35)"
                    : "none",
                }}
                transition={{ duration: 0.3 }}
                style={{
                  border: current
                    ? "1.5px solid rgba(59,130,246,0.5)"
                    : done
                    ? "1.5px solid rgba(34,197,94,0.4)"
                    : "1.5px solid rgba(255,255,255,0.06)",
                }}
              >
                {done ? (
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "#22c55e",
                      fontVariationSettings: "'FILL' 1",
                      fontSize: compact ? "12px" : "14px",
                    }}
                  >
                    check
                  </span>
                ) : (
                  <span style={{ color: current ? "#3b82f6" : "#334155" }}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
              {current && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1.5px solid rgba(59,130,246,0.3)" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Connector */}
            {i < totalSteps - 1 && (
              <div className="relative mx-1 h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                {done && (
                  <motion.div
                    className="absolute inset-0 h-full"
                    style={{ backgroundColor: "rgba(34,197,94,0.4)" }}
                    initial={{ scaleX: 0, transformOrigin: "left" }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step labels (below timeline) ──────────────────────────────── */
function StepLabels({ currentStep }: { currentStep: number }) {
  return (
    <div className="mt-2 flex w-full">
      {SEQUENCE_STEPS.map((step, i) => {
        const done    = i < currentStep - 1;
        const current = i === currentStep - 1;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
            <p
              className="font-label text-center text-[9px] uppercase tracking-widest leading-tight"
              style={{ color: current ? "#3b82f6" : done ? "rgba(34,197,94,0.7)" : "#334155" }}
            >
              D{step.day}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Sequence card ─────────────────────────────────────────────── */
function SequenceCard({
  exec,
  selected,
  onClick,
}: {
  exec: LiveExecution;
  selected: boolean;
  onClick: () => void;
}) {
  const score      = (exec.lead?.urgency ?? "cold") as LeadScore;
  const color      = SCORE_COLORS[score];
  const pct        = Math.round(((exec.current_step - 1) / SEQUENCE_STEPS.length) * 100);
  const days       = daysSince(exec.created_at);
  const isPaused   = exec.status === "paused";

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ x: selected ? 0 : 3 }}
      className="group relative w-full overflow-hidden rounded-2xl p-5 text-left transition-shadow"
      style={{
        backgroundColor: selected ? "#0f1020" : "#08080f",
        border: selected
          ? `1px solid rgba(59,130,246,0.3)`
          : `1px solid rgba(69,70,77,0.18)`,
        boxShadow: selected
          ? "0 4px 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 1px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 rounded-l-2xl"
        style={{ backgroundColor: selected ? "#3b82f6" : color, opacity: selected ? 1 : 0.5 }}
      />

      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {initials(exec.lead?.name ?? "?")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold" style={{ color: "#f1f5f9" }}>
              {exec.lead?.name ?? "Sin nombre"}
            </p>
            {isPaused && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 font-label text-[9px] uppercase tracking-widest"
                style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
              >
                Pausada
              </span>
            )}
          </div>
          <p className="truncate text-xs mt-0.5" style={{ color: "#64748b" }}>
            {exec.lead?.property_type ?? "Propiedad"} · {exec.lead?.zone_interest ?? "Sin zona"}
          </p>
        </div>

        <span
          className="shrink-0 rounded-lg px-2 py-1 font-label text-[9px] uppercase tracking-widest"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {SCORE_LABELS[score]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
            Progreso
          </span>
          <span className="text-[11px] font-semibold" style={{ color: selected ? "#3b82f6" : "#94a3b8" }}>
            Paso {exec.current_step}/{SEQUENCE_STEPS.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: isPaused ? "#f59e0b" : "#3b82f6" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1" style={{ color: "#334155" }}>
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="text-xs">
            {days === 0 ? "Hoy" : `Hace ${days}d`}
          </span>
        </div>
        <div className="flex -space-x-1">
          {SEQUENCE_STEPS.map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full ring-1"
              style={{
                backgroundColor:
                  i < exec.current_step - 1
                    ? "#22c55e"
                    : i === exec.current_step - 1
                    ? "#3b82f6"
                    : "rgba(255,255,255,0.07)",
                outlineColor: "#08080f",
              }}
            />
          ))}
        </div>
      </div>
    </motion.button>
  );
}

/* ── Detail panel ──────────────────────────────────────────────── */
function DetailPanel({
  exec,
  onAction,
  isPending,
}: {
  exec: LiveExecution;
  onAction: (a: "advance" | "pause" | "resume" | "cancel") => void;
  isPending: boolean;
}) {
  const [copiedIdx, setCopied] = useState<number | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<number>(exec.current_step - 1);
  const score      = (exec.lead?.urgency ?? "cold") as LeadScore;
  const color      = SCORE_COLORS[score];
  const isPaused   = exec.status === "paused";
  const currentIdx = exec.current_step - 1;
  const isLast     = exec.current_step >= SEQUENCE_STEPS.length;

  function copy(text: string, idx: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <motion.div
      key={exec.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      {/* ── Lead profile card ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          backgroundColor: "#08080f",
          border: "1px solid rgba(255,255,255,0.06)",
          background: `linear-gradient(135deg, ${color}08 0%, #111827 50%)`,
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: `${color}12` }}
        />

        <div className="relative">
          {/* Avatar + name row */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold shadow-lg"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}30`,
                }}
              >
                {initials(exec.lead?.name ?? "?")}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "#f1f5f9" }}>
                  {exec.lead?.name}
                </h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  {exec.lead?.property_type} · {exec.lead?.zone_interest}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="rounded-xl px-3 py-1.5 font-label text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {SCORE_LABELS[score]}
              </span>
              {isPaused && (
                <span
                  className="rounded-full px-2 py-0.5 font-label text-[9px] uppercase tracking-widest"
                  style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
                >
                  Pausada
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-5 rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="mb-4 font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
              Progreso de secuencia
            </p>
            <ProgressTimeline currentStep={exec.current_step} />
            <StepLabels currentStep={exec.current_step} />
          </div>

          {/* Contact + notes */}
          <div className="mb-5 flex flex-wrap gap-2">
            {exec.lead?.phone && (
              <a
                href={`https://wa.me/${exec.lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                WhatsApp
              </a>
            )}
            {exec.lead?.email && (
              <a
                href={`mailto:${exec.lead.email}`}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                Email
              </a>
            )}
          </div>

          {exec.lead?.notes && (
            <div
              className="mb-5 flex items-start gap-2 rounded-xl p-3 text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#94a3b8" }}
            >
              <span className="material-symbols-outlined shrink-0 text-base" style={{ color: "#64748b" }}>sticky_note_2</span>
              {exec.lead.notes}
            </div>
          )}

          {/* Action buttons */}
          <div
            className="flex flex-wrap gap-2 border-t pt-4"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {!isPaused ? (
              <>
                <button
                  onClick={() => onAction("advance")}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ backgroundColor: "#3b82f6", color: "#ffffff" }}
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isLast ? "check_circle" : "send"}
                  </span>
                  {isLast ? "Completar secuencia" : "Marcar enviado · Avanzar"}
                </button>
                <button
                  onClick={() => onAction("pause")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <span className="material-symbols-outlined text-base">pause</span>
                  Pausar
                </button>
              </>
            ) : (
              <button
                onClick={() => onAction("resume")}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)" }}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Reanudar secuencia
              </button>
            )}
            <button
              onClick={() => onAction("cancel")}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm transition-all hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <span className="material-symbols-outlined text-base">cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Templates ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Tab bar */}
        <div
          className="flex overflow-x-auto"
          style={{ backgroundColor: "#06060e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {SEQUENCE_STEPS.map((step, i) => {
            const done    = i < currentIdx;
            const current = i === currentIdx;
            const isActive = activeTemplate === i;
            return (
              <button
                key={i}
                onClick={() => setActiveTemplate(i)}
                className="relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs transition-colors"
                style={{ color: isActive ? "#3b82f6" : done ? "#22c55e" : "#334155" }}
              >
                {done ? (
                  <span className="material-symbols-outlined text-sm" style={{ color: "#22c55e", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : current ? (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#334155" }} />
                )}
                <span className="whitespace-nowrap">D{step.day}</span>
                {isActive && (
                  <motion.div
                    layoutId="template-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Template body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTemplate}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-5"
            style={{ backgroundColor: "#08080f" }}
          >
            {(() => {
              const step    = SEQUENCE_STEPS[activeTemplate];
              const isDone  = activeTemplate < currentIdx;
              const isCurr  = activeTemplate === currentIdx;
              const filled  = fillTemplate(
                step.template,
                exec.lead?.name ?? "el lead",
                exec.lead?.property_type ?? "la propiedad",
                exec.lead?.zone_interest ?? "la zona"
              );
              return (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-xl px-3 py-1 font-label text-[10px] uppercase tracking-widest"
                        style={{
                          backgroundColor: isCurr
                            ? "rgba(59,130,246,0.12)"
                            : isDone
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(255,255,255,0.05)",
                          color: isCurr ? "#3b82f6" : isDone ? "#22c55e" : "#334155",
                        }}
                      >
                        {step.label}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 font-label text-[9px] uppercase tracking-widest"
                        style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#64748b" }}
                      >
                        {step.channel === "whatsapp" ? "WhatsApp" : "Email"}
                      </span>
                      {isCurr && (
                        <span
                          className="rounded-full px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-widest"
                          style={{ backgroundColor: "#3b82f6", color: "#ffffff" }}
                        >
                          Próximo
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copy(filled, activeTemplate)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor:
                          copiedIdx === activeTemplate
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(59,130,246,0.08)",
                        color: copiedIdx === activeTemplate ? "#22c55e" : "#3b82f6",
                        border:
                          copiedIdx === activeTemplate
                            ? "1px solid rgba(34,197,94,0.2)"
                            : "1px solid rgba(59,130,246,0.15)",
                      }}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {copiedIdx === activeTemplate ? "check" : "content_copy"}
                      </span>
                      {copiedIdx === activeTemplate ? "Copiado" : "Copiar mensaje"}
                    </button>
                  </div>

                  {/* Message bubble */}
                  <div
                    className="rounded-2xl rounded-tl-sm p-4"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.06)",
                      border: "1px solid rgba(34,197,94,0.12)",
                    }}
                  >
                    <pre
                      className="whitespace-pre-wrap text-sm leading-relaxed"
                      style={{ fontFamily: "inherit", color: "#94a3b8" }}
                    >
                      {filled}
                    </pre>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Start sequence modal ──────────────────────────────────────── */
function StartModal({
  leads,
  onStart,
  onClose,
  isPending,
}: {
  leads: Lead[];
  onStart: (id: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = leads.filter((l) =>
    (l.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "#08080f",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(59,130,246,0.1)" }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}>
                playlist_add
              </span>
            </div>
            <div>
              <p className="font-headline font-bold" style={{ color: "#f1f5f9" }}>
                Nueva secuencia
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                Secuencia estándar · 5 pasos · 7 días
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-70"
            style={{ color: "#64748b" }}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: "#334155" }}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border bg-transparent pl-9 pr-4 text-sm outline-none"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "#f1f5f9" }}
              autoFocus
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Lead list */}
        <div className="max-h-72 overflow-y-auto px-3 py-3">
          {leads.length === 0 ? (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined text-3xl" style={{ color: "rgba(59,130,246,0.2)" }}>done_all</span>
              <p className="mt-2 text-sm" style={{ color: "#334155" }}>
                Todos los leads ya tienen secuencia activa.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: "#334155" }}>
              No se encontraron leads.
            </p>
          ) : (
            filtered.map((lead) => {
              const score = (lead.urgency ?? "cold") as LeadScore;
              const color = SCORE_COLORS[score];
              return (
                <button
                  key={lead.id}
                  onClick={() => onStart(lead.id)}
                  disabled={isPending}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {initials(lead.name ?? "?")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "#f1f5f9" }}>
                      {lead.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: "#64748b" }}>
                      {lead.property_type ?? "Propiedad"} · {lead.zone_interest ?? "Sin zona"}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-lg px-2 py-0.5 font-label text-[9px] uppercase tracking-widest"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {SCORE_LABELS[score]}
                  </span>
                  <span className="material-symbols-outlined text-base" style={{ color: "#334155" }}>
                    chevron_right
                  </span>
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── History row ───────────────────────────────────────────────── */
function HistorialTab({ executions }: { executions: CompletedExecution[] }) {
  if (executions.length === 0) {
    return (
      <div
        className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl"
        style={{ backgroundColor: "#08080f", border: "1px solid rgba(69,70,77,0.18)" }}
      >
        <span className="material-symbols-outlined text-4xl" style={{ color: "rgba(59,130,246,0.15)" }}>
          history
        </span>
        <p className="text-sm" style={{ color: "#334155" }}>
          No hay secuencias completadas aún.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {executions.map((exec, i) => {
        const score     = (exec.lead?.urgency ?? "cold") as LeadScore;
        const color     = SCORE_COLORS[score];
        const completed = exec.status === "completed";
        const days      = exec.completed_at
          ? Math.floor(
              (new Date(exec.completed_at).getTime() - new Date(exec.created_at).getTime()) / 864e5
            )
          : 0;

        return (
          <motion.div
            key={exec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              backgroundColor: "#08080f",
              border: "1px solid rgba(69,70,77,0.18)",
            }}
          >
            {/* Avatar */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {initials(exec.lead?.name ?? "?")}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium" style={{ color: "#f1f5f9" }}>
                {exec.lead?.name}
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {exec.lead?.property_type} · {exec.lead?.zone_interest}
              </p>
            </div>

            {/* Step dots */}
            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: SEQUENCE_STEPS.length }).map((_, j) => (
                <div
                  key={j}
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      j < exec.current_step
                        ? completed ? "#22c55e" : "#ef4444"
                        : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>

            {/* Outcome badge */}
            <span
              className="shrink-0 rounded-xl px-3 py-1.5 font-label text-[10px] font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: completed
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.08)",
                color: completed ? "#22c55e" : "#ef4444",
                border: completed
                  ? "1px solid rgba(34,197,94,0.2)"
                  : "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {completed ? "Completada" : "Cancelada"}
            </span>

            {/* Duration */}
            <span className="hidden shrink-0 text-xs sm:block" style={{ color: "#334155" }}>
              {days}d
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Stats row ─────────────────────────────────────────────────── */
function StatsRow({ active, completed }: { active: LiveExecution[]; completed: CompletedExecution[] }) {
  const running   = active.filter((e) => e.status === "active").length;
  const paused    = active.filter((e) => e.status === "paused").length;
  const done      = completed.filter((e) => e.status === "completed").length;
  const rate      = active.length + done > 0
    ? Math.round((done / (active.length + done)) * 100)
    : 0;

  const stats = [
    { label: "En curso",          value: String(running),        icon: "playlist_play",     accent: false, color: "#3b82f6" },
    { label: "Pausadas",          value: String(paused),         icon: "pause_circle",      accent: false, color: "#f59e0b" },
    { label: "Completadas (30d)", value: String(done),           icon: "check_circle",      accent: true,  color: "#22c55e" },
    { label: "Tasa completadas",  value: `${rate}%`,             icon: "conversion_path",   accent: false, color: "#818cf8" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            backgroundColor: "#08080f",
            border: s.accent
              ? "1px solid rgba(34,197,94,0.2)"
              : "1px solid rgba(69,70,77,0.18)",
            background: s.accent
              ? "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, #111827 60%)"
              : "#08080f",
          }}
        >
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl"
            style={{ backgroundColor: `${s.color}08` }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="font-headline text-3xl font-extrabold" style={{ color: "#f1f5f9" }}>
                {s.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
                {s.label}
              </p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ── Main view ─────────────────────────────────────────────────── */
export function SeguimientoView({
  active,
  completed,
  availableLeads,
}: {
  active: LiveExecution[];
  completed: CompletedExecution[];
  availableLeads: Lead[];
}) {
  const router                       = useRouter();
  const [tab, setTab]                = useState<"activos" | "historial">("activos");
  const [selectedId, setSelectedId]  = useState<string | null>(active[0]?.id ?? null);
  const [showModal, setShowModal]    = useState(false);
  const [error, setError]            = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = active.find((e) => e.id === selectedId) ?? null;

  const handleAction = useCallback(
    (execId: string, action: "advance" | "pause" | "resume" | "cancel") => {
      setError(null);
      startTransition(async () => {
        const res  = await fetch(`/api/seguimiento/${execId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Ocurrió un error.");
        } else {
          router.refresh();
          if (action === "advance" || action === "cancel") setSelectedId(null);
        }
      });
    },
    [router]
  );

  const handleStart = useCallback(
    (leadId: string) => {
      setError(null);
      startTransition(async () => {
        const res  = await fetch("/api/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_id: leadId }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "No se pudo iniciar la secuencia.");
        } else {
          setShowModal(false);
          router.refresh();
        }
      });
    },
    [router]
  );

  const TABS = [
    { id: "activos",   label: "Activas",   count: active.length    },
    { id: "historial", label: "Historial", count: completed.length  },
  ] as const;

  return (
    <>
      <div className="flex flex-col flex-1 min-h-svh" style={{ backgroundColor: "#060609", color: "#f1f5f9" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6"
          style={{
            backgroundColor: "#06060e",
            borderColor: "rgba(255,255,255,0.07)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" style={{ color: "#94a3b8" }} />
            <Separator orientation="vertical" className="h-4 opacity-20" />
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(59,130,246,0.1)" }}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}
              >
                mark_chat_read
              </span>
            </div>
            <h1
              className="font-headline text-sm font-bold uppercase tracking-tighter"
              style={{ color: "#f1f5f9" }}
            >
              Seguimiento
            </h1>
            <span
              className="hidden rounded-md px-2 py-0.5 font-label text-[10px] uppercase tracking-widest sm:inline"
              style={{ backgroundColor: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.15)" }}
            >
              AI Sequences
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#3b82f6", color: "#ffffff", boxShadow: "0 2px 12px rgba(59,130,246,0.25)" }}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            Nueva secuencia
          </button>
        </header>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <StatsRow active={active} completed={completed} />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="flex items-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
              >
                <span className="material-symbols-outlined text-base">error</span>
                {error}
                <button onClick={() => setError(null)} className="ml-auto hover:opacity-70">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-1 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-medium transition-colors"
                  style={{ color: isActive ? "#3b82f6" : "#64748b" }}
                >
                  {t.label}
                  <span
                    className="rounded-full px-1.5 py-0.5 font-label text-[9px] font-bold"
                    style={{
                      backgroundColor: isActive ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                      color: isActive ? "#3b82f6" : "#334155",
                    }}
                  >
                    {t.count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="seg-tab-line"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ backgroundColor: "#3b82f6" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {tab === "activos" ? (
              <motion.div
                key="activos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-5 lg:grid-cols-12"
              >
                {/* Left: card list */}
                <div className="flex flex-col gap-3 lg:col-span-4">
                  {active.length === 0 ? (
                    <div
                      className="flex h-56 flex-col items-center justify-center gap-4 rounded-2xl"
                      style={{ backgroundColor: "#08080f", border: "1px dashed rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: "rgba(59,130,246,0.07)" }}
                      >
                        <span className="material-symbols-outlined text-3xl" style={{ color: "rgba(59,130,246,0.35)", fontVariationSettings: "'FILL' 1" }}>
                          mark_chat_read
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="font-medium" style={{ color: "#94a3b8" }}>Sin secuencias activas</p>
                        <p className="mt-1 text-xs" style={{ color: "#334155" }}>
                          Iniciá una para hacer seguimiento automático
                        </p>
                      </div>
                      <button
                        onClick={() => setShowModal(true)}
                        className="rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:scale-105"
                        style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
                      >
                        Iniciar primera secuencia
                      </button>
                    </div>
                  ) : (
                    active.map((exec, i) => (
                      <motion.div
                        key={exec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                      >
                        <SequenceCard
                          exec={exec}
                          selected={selectedId === exec.id}
                          onClick={() => setSelectedId(exec.id)}
                        />
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Right: detail */}
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait">
                    {selected ? (
                      <div
                        key={selected.id}
                        className="overflow-y-auto pr-1"
                        style={{ maxHeight: "calc(100vh - 220px)" }}
                      >
                        <DetailPanel
                          exec={selected}
                          onAction={(a) => handleAction(selected.id, a)}
                          isPending={isPending}
                        />
                      </div>
                    ) : (
                      <motion.div
                        key="empty-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex h-80 flex-col items-center justify-center gap-3 rounded-2xl"
                        style={{ backgroundColor: "#08080f", border: "1px dashed rgba(255,255,255,0.07)" }}
                      >
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: "rgba(59,130,246,0.07)" }}
                        >
                          <span className="material-symbols-outlined text-3xl" style={{ color: "rgba(59,130,246,0.3)", fontVariationSettings: "'FILL' 1" }}>
                            touch_app
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: "#334155" }}>
                          Seleccioná una secuencia para ver los mensajes
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="historial"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <HistorialTab executions={completed} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <StartModal
            leads={availableLeads}
            onStart={handleStart}
            onClose={() => setShowModal(false)}
            isPending={isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}
