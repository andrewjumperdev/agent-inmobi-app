"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SEQUENCE_STEPS,
  MOCK_ACTIVE,
  MOCK_HISTORIAL,
} from "./mock-data";
import {
  SCORE_COLORS,
  SCORE_LABELS,
  OUTCOME_LABELS,
  OUTCOME_COLORS,
  type ActiveSequence,
  type HistorialEntry,
  type StepOutcome,
} from "./types";

/* ── Helpers ─────────────────────────────────────────────── */
function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function fillTemplate(template: string, seq: ActiveSequence): string {
  return template
    .replace(/\{\{nombre\}\}/g, seq.lead_name.split(" ")[0])
    .replace(/\{\{propiedad\}\}/g, seq.property_interest)
    .replace(/\{\{zona\}\}/g, seq.zona);
}

const STEP_OUTCOME_CONFIG: Record<
  StepOutcome,
  { icon: string; color: string; bg: string }
> = {
  sent:    { icon: "check_circle", color: "#22c55e", bg: "rgba(34,197,94,0.12)"    },
  pending: { icon: "schedule",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)"   },
  skipped: { icon: "remove_circle",color: "#6366f1", bg: "rgba(99,102,241,0.12)"   },
};

/* ── Stats bar ───────────────────────────────────────────── */
function StatsBar() {
  const active   = MOCK_ACTIVE.length;
  const responded = MOCK_ACTIVE.filter((s) => s.steps_done.includes("sent")).length;
  const appts    = MOCK_HISTORIAL.filter((h) => h.outcome === "cita_coordinada").length;
  const closed   = MOCK_HISTORIAL.filter((h) => h.outcome === "cerrado").length;

  const stats = [
    { label: "Secuencias activas", value: String(active),                 icon: "playlist_play",  accent: false },
    { label: "Respondieron",       value: `${responded}/${active}`,       icon: "chat_bubble",    accent: false },
    { label: "Citas coordinadas",  value: String(appts),                  icon: "event_available",accent: true  },
    { label: "Cerrados",           value: String(closed),                 icon: "check_circle",   accent: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-xl px-5 py-4"
          style={{
            backgroundColor: "#131b2e",
            border: s.accent ? "1px solid rgba(188,255,95,0.2)" : "1px solid rgba(69,70,77,0.15)",
            background: s.accent
              ? "linear-gradient(135deg, rgba(188,255,95,0.06) 0%, #131b2e 60%)"
              : "#131b2e",
          }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: s.accent ? "#bcff5f" : "rgba(188,255,95,0.08)" }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{
                color: s.accent ? "#203600" : "#bcff5f",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {s.icon}
            </span>
          </div>
          <div>
            <p className="font-headline text-xl font-bold" style={{ color: "#dae2fd" }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "#909097" }}>
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Step dots ───────────────────────────────────────────── */
function StepDots({
  steps,
  currentStep,
}: {
  steps: StepOutcome[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {SEQUENCE_STEPS.map((step, i) => {
        const outcome = steps[i];
        const isNext  = i === currentStep && outcome === "pending";
        const cfg     = outcome ? STEP_OUTCOME_CONFIG[outcome] : null;

        return (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: cfg ? cfg.bg : "rgba(69,70,77,0.12)",
                border: isNext ? `1px solid ${cfg?.color}` : "none",
              }}
              title={`Día ${step.day} — ${step.label}`}
            >
              {cfg ? (
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ color: cfg.color, fontVariationSettings: "'FILL' 1" }}
                >
                  {cfg.icon}
                </span>
              ) : (
                <span style={{ color: "#45464d" }}>{i + 1}</span>
              )}
            </div>
            {i < SEQUENCE_STEPS.length - 1 && (
              <div
                className="h-px w-3 shrink-0"
                style={{ backgroundColor: outcome === "sent" ? "rgba(34,197,94,0.3)" : "rgba(69,70,77,0.2)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Sequence card ───────────────────────────────────────── */
function SequenceCard({
  seq,
  selected,
  onClick,
}: {
  seq: ActiveSequence;
  selected: boolean;
  onClick: () => void;
}) {
  const scoreColor = SCORE_COLORS[seq.lead_score];
  const days       = daysSince(seq.started_at);
  const nextStep   = SEQUENCE_STEPS[seq.current_step];

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ x: 2 }}
      className="w-full cursor-pointer rounded-xl p-4 text-left transition-colors"
      style={{
        backgroundColor: selected ? "#1a2540" : "#131b2e",
        border: selected
          ? "1px solid rgba(188,255,95,0.25)"
          : "1px solid rgba(69,70,77,0.15)",
        boxShadow: selected ? "0 0 0 1px rgba(188,255,95,0.1)" : "none",
      }}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Score dot */}
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: scoreColor }}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm" style={{ color: "#dae2fd" }}>
              {seq.lead_name}
            </p>
            <p className="truncate text-xs" style={{ color: "#909097" }}>
              {seq.property_interest} · {seq.zona}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded px-2 py-0.5 font-label text-[10px] uppercase tracking-widest"
          style={{
            backgroundColor: `${scoreColor}18`,
            color: scoreColor,
          }}
        >
          {SCORE_LABELS[seq.lead_score]}
        </span>
      </div>

      {/* Step progress */}
      <StepDots steps={seq.steps_done} currentStep={seq.current_step} />

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: "#45464d" }}>
          Iniciada hace {days === 0 ? "hoy" : `${days}d`}
        </span>
        {nextStep && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "#bcff5f" }}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              arrow_forward
            </span>
            Día {nextStep.day}
          </span>
        )}
      </div>
    </motion.button>
  );
}

/* ── Template panel ──────────────────────────────────────── */
function TemplatePanel({ seq }: { seq: ActiveSequence }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copyTemplate(text: string, idx: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  }

  const scoreColor = SCORE_COLORS[seq.lead_score];

  return (
    <motion.div
      key={seq.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Lead header */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "#131b2e", border: "1px solid rgba(69,70,77,0.15)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm"
              style={{ backgroundColor: `${scoreColor}18`, color: scoreColor }}
            >
              {seq.lead_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="font-semibold" style={{ color: "#dae2fd" }}>
                {seq.lead_name}
              </p>
              <p className="text-xs" style={{ color: "#909097" }}>
                {seq.property_interest} · {seq.zona}
              </p>
            </div>
          </div>
          <span
            className="rounded-full px-3 py-1 font-label text-[10px] uppercase tracking-widest"
            style={{ backgroundColor: `${scoreColor}18`, color: scoreColor }}
          >
            {SCORE_LABELS[seq.lead_score]}
          </span>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-3">
          {seq.phone && (
            <a
              href={`https://wa.me/${seq.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                chat
              </span>
              WhatsApp
            </a>
          )}
          {seq.email && (
            <a
              href={`mailto:${seq.email}`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "#818cf8" }}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                mail
              </span>
              Email
            </a>
          )}
        </div>

        {seq.notes && (
          <p className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "rgba(69,70,77,0.15)", color: "#c6c6cd" }}>
            <span className="material-symbols-outlined mr-1 align-middle text-sm" style={{ color: "#909097" }}>
              sticky_note_2
            </span>
            {seq.notes}
          </p>
        )}
      </div>

      {/* Message templates */}
      <div>
        <p className="mb-3 font-label text-[10px] uppercase tracking-widest" style={{ color: "#909097" }}>
          Mensajes de la secuencia
        </p>
        <div className="flex flex-col gap-3">
          {SEQUENCE_STEPS.map((step, i) => {
            const outcome = seq.steps_done[i];
            const isCurrent = i === seq.current_step;
            const cfg = outcome ? STEP_OUTCOME_CONFIG[outcome] : null;
            const filled = fillTemplate(step.template, seq);
            const isCopied = copiedIdx === i;

            return (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: isCurrent ? "rgba(188,255,95,0.04)" : "#131b2e",
                  border: isCurrent
                    ? "1px solid rgba(188,255,95,0.2)"
                    : "1px solid rgba(69,70,77,0.12)",
                  opacity: outcome === "skipped" ? 0.5 : 1,
                }}
              >
                {/* Step header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {cfg ? (
                      <span
                        className="material-symbols-outlined text-base"
                        style={{ color: cfg.color, fontVariationSettings: "'FILL' 1" }}
                      >
                        {cfg.icon}
                      </span>
                    ) : (
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: "rgba(69,70,77,0.15)", color: "#45464d" }}
                      >
                        {i + 1}
                      </span>
                    )}
                    <span className="text-xs font-semibold" style={{ color: isCurrent ? "#bcff5f" : "#bec6e0" }}>
                      Día {step.day} — {step.label}
                    </span>
                    {isCurrent && (
                      <span
                        className="rounded px-1.5 py-0.5 font-label text-[9px] uppercase tracking-widest"
                        style={{ backgroundColor: "#bcff5f", color: "#203600" }}
                      >
                        PRÓXIMO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="rounded px-1.5 py-0.5 font-label text-[9px] uppercase tracking-widest"
                      style={{ backgroundColor: "rgba(69,70,77,0.15)", color: "#909097" }}
                    >
                      {step.channel === "whatsapp" ? "WhatsApp" : "Email"}
                    </span>
                    <button
                      onClick={() => copyTemplate(filled, i)}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: isCopied ? "rgba(34,197,94,0.12)" : "rgba(188,255,95,0.08)",
                        color: isCopied ? "#22c55e" : "#bcff5f",
                      }}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isCopied ? "check" : "content_copy"}
                      </span>
                      {isCopied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                {/* Template text */}
                <pre
                  className="whitespace-pre-wrap rounded-lg p-3 font-sans text-xs leading-relaxed"
                  style={{
                    backgroundColor: "rgba(69,70,77,0.08)",
                    color: "#c6c6cd",
                    fontFamily: "inherit",
                  }}
                >
                  {filled}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── History table ───────────────────────────────────────── */
function HistorialTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-xl"
      style={{ border: "1px solid rgba(69,70,77,0.2)" }}
    >
      {/* Table header */}
      <div
        className="grid grid-cols-12 gap-4 px-5 py-3"
        style={{ backgroundColor: "#0f172a", borderBottom: "1px solid rgba(69,70,77,0.2)" }}
      >
        {["Lead", "Interés", "Resultado", "Pasos", "Duración"].map((h) => (
          <span
            key={h}
            className="font-label text-[10px] uppercase tracking-widest col-span-2 first:col-span-4"
            style={{ color: "#909097" }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ backgroundColor: "#131b2e" }}>
        {MOCK_HISTORIAL.map((entry, i) => {
          const scoreColor   = SCORE_COLORS[entry.lead_score];
          const outcomeColor = OUTCOME_COLORS[entry.outcome];
          const days         = Math.floor(
            (entry.ended_at.getTime() - entry.started_at.getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="grid grid-cols-12 items-center gap-4 border-b px-5 py-4 last:border-0"
              style={{ borderColor: "rgba(69,70,77,0.12)" }}
            >
              {/* Lead */}
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: scoreColor }}
                />
                <span className="truncate text-sm font-medium" style={{ color: "#dae2fd" }}>
                  {entry.lead_name}
                </span>
              </div>
              {/* Interest */}
              <div className="col-span-2">
                <span className="truncate text-xs" style={{ color: "#909097" }}>
                  {entry.property_interest}
                </span>
              </div>
              {/* Outcome */}
              <div className="col-span-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: `${outcomeColor}18`, color: outcomeColor }}
                >
                  {OUTCOME_LABELS[entry.outcome]}
                </span>
              </div>
              {/* Steps */}
              <div className="col-span-2 flex items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: entry.total_steps }).map((_, j) => (
                    <div
                      key={j}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          j < entry.steps_completed
                            ? outcomeColor
                            : "rgba(69,70,77,0.25)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: "#909097" }}>
                  {entry.steps_completed}/{entry.total_steps}
                </span>
              </div>
              {/* Duration */}
              <div className="col-span-2">
                <span className="text-xs" style={{ color: "#909097" }}>
                  {days}d
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Main view ───────────────────────────────────────────── */
export function SeguimientoView() {
  const [tab, setTab]         = useState<"activos" | "historial">("activos");
  const [selectedId, setId]   = useState<string | null>(MOCK_ACTIVE[0]?.id ?? null);

  const selected = MOCK_ACTIVE.find((s) => s.id === selectedId) ?? null;

  const TABS = [
    { id: "activos",   label: "Secuencias activas", count: MOCK_ACTIVE.length },
    { id: "historial", label: "Historial",           count: MOCK_HISTORIAL.length },
  ] as const;

  return (
    <div
      className="flex flex-col flex-1 min-h-svh"
      style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6"
        style={{
          backgroundColor: "#0f172a",
          borderColor: "rgba(69,70,77,0.3)",
          boxShadow: "0 0 20px rgba(188,255,95,0.04)",
        }}
      >
        <SidebarTrigger className="-ml-1" style={{ color: "#c6c6cd" }} />
        <Separator orientation="vertical" className="h-4 opacity-30" />
        <span
          className="material-symbols-outlined text-lg"
          style={{ color: "#bcff5f", fontVariationSettings: "'FILL' 1" }}
        >
          mark_chat_read
        </span>
        <h1
          className="font-headline text-sm font-bold uppercase tracking-tighter"
          style={{ color: "#dae2fd" }}
        >
          Seguimiento
        </h1>
        <span
          className="rounded px-2 py-0.5 font-label text-[10px] uppercase tracking-widest"
          style={{ backgroundColor: "rgba(188,255,95,0.1)", color: "#bcff5f" }}
        >
          AI Sequences
        </span>
      </header>

      {/* Content */}
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <StatsBar />

        {/* Tabs */}
        <div className="flex gap-1 border-b" style={{ borderColor: "rgba(69,70,77,0.2)" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm transition-colors"
                style={{ color: active ? "#bcff5f" : "#909097" }}
              >
                {t.label}
                <span
                  className="rounded-full px-1.5 py-0.5 font-label text-[9px] font-bold"
                  style={{
                    backgroundColor: active ? "rgba(188,255,95,0.15)" : "rgba(69,70,77,0.15)",
                    color: active ? "#bcff5f" : "#45464d",
                  }}
                >
                  {t.count}
                </span>
                {active && (
                  <motion.div
                    layoutId="tab-underline-seg"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ backgroundColor: "#bcff5f" }}
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
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-5 lg:grid-cols-12"
            >
              {/* Sequence list */}
              <div className="flex flex-col gap-2 lg:col-span-4">
                {MOCK_ACTIVE.map((seq, i) => (
                  <motion.div
                    key={seq.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <SequenceCard
                      seq={seq}
                      selected={selectedId === seq.id}
                      onClick={() => setId(seq.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {selected ? (
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
                      <TemplatePanel key={selected.id} seq={selected} />
                    </div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-64 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "#131b2e", border: "1px solid rgba(69,70,77,0.15)" }}
                    >
                      <div className="text-center">
                        <span
                          className="material-symbols-outlined text-4xl"
                          style={{ color: "rgba(188,255,95,0.2)" }}
                        >
                          mark_chat_read
                        </span>
                        <p className="mt-2 text-sm" style={{ color: "#45464d" }}>
                          Seleccioná una secuencia para ver los mensajes
                        </p>
                      </div>
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
              transition={{ duration: 0.25 }}
            >
              <HistorialTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
