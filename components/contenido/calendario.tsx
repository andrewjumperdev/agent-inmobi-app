"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ContentFormat,
  ContentPillar,
  PiezaGuardada,
  FORMAT_LABELS,
  FORMAT_ICONS,
  PILLAR_LABELS,
  PILLAR_COLORS,
} from "./types";

/* ── Week plan structure ───────────────────────────────────── */
interface SlotPlan {
  format: ContentFormat;
  pillar: ContentPillar;
  label: string;
}

const WEEK_PLAN: Array<{ day: string; short: string; slot: SlotPlan | null }> = [
  {
    day: "Lunes",
    short: "LUN",
    slot: { format: "reel", pillar: "autoridad", label: "Tip del mercado" },
  },
  {
    day: "Martes",
    short: "MAR",
    slot: { format: "historia", pillar: "conversion", label: "Propiedad destacada" },
  },
  {
    day: "Miércoles",
    short: "MIÉ",
    slot: { format: "carrusel", pillar: "autoridad", label: "Guía o lista" },
  },
  {
    day: "Jueves",
    short: "JUE",
    slot: { format: "historia", pillar: "confianza", label: "Caso de éxito" },
  },
  {
    day: "Viernes",
    short: "VIE",
    slot: { format: "post", pillar: "conversion", label: "Propiedad del fin de semana" },
  },
  {
    day: "Sábado",
    short: "SÁB",
    slot: { format: "reel", pillar: "atraccion", label: "Tendencia del sector" },
  },
  {
    day: "Domingo",
    short: "DOM",
    slot: null,
  },
];

/* ── Slot card ─────────────────────────────────────────────── */
function SlotCard({
  dayLabel,
  shortLabel,
  slot,
  pieza,
  isToday,
  onGenerate,
}: {
  dayLabel: string;
  shortLabel: string;
  slot: SlotPlan | null;
  pieza?: PiezaGuardada;
  isToday: boolean;
  onGenerate?: (format: ContentFormat, pillar: ContentPillar) => void;
}) {
  if (!slot) {
    return (
      <div
        className="flex flex-col rounded-xl border p-3"
        style={{
          borderColor: "rgba(69,70,77,0.2)",
          backgroundColor: "#0f172a",
          opacity: 0.4,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="font-label text-xs uppercase tracking-widest"
            style={{ color: "#909097" }}
          >
            {shortLabel}
          </span>
        </div>
        <p
          className="mt-3 text-xs italic"
          style={{ color: "#909097" }}
        >
          Descanso
        </p>
      </div>
    );
  }

  const pillarColor = PILLAR_COLORS[slot.pillar];
  const hasContent = !!pieza;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col rounded-xl border p-3 transition-all"
      style={{
        borderColor: isToday
          ? "rgba(188,255,95,0.35)"
          : hasContent
          ? `${pillarColor}30`
          : "rgba(69,70,77,0.3)",
        backgroundColor: isToday
          ? "rgba(188,255,95,0.04)"
          : "#171f33",
      }}
    >
      {/* Day header */}
      <div className="flex items-center justify-between">
        <span
          className="font-label text-xs uppercase tracking-widest"
          style={{ color: isToday ? "#bcff5f" : "#909097" }}
        >
          {shortLabel}
          {isToday && (
            <span
              className="ml-1.5 rounded-full px-1.5 py-0.5 font-label text-[9px]"
              style={{ backgroundColor: "rgba(188,255,95,0.15)", color: "#bcff5f" }}
            >
              HOY
            </span>
          )}
        </span>
        <span
          className="material-symbols-outlined text-sm"
          style={{
            color: hasContent ? "#22c55e" : "#909097",
            fontVariationSettings: hasContent ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {hasContent ? "check_circle" : "radio_button_unchecked"}
        </span>
      </div>

      {/* Format + Pillar badges */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <div
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5"
          style={{ backgroundColor: "rgba(69,70,77,0.3)" }}
        >
          <span
            className="material-symbols-outlined text-xs"
            style={{ color: "#909097", fontVariationSettings: "'FILL' 1" }}
          >
            {FORMAT_ICONS[slot.format]}
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#909097" }}>
            {FORMAT_LABELS[slot.format]}
          </span>
        </div>
        <div
          className="rounded-md px-1.5 py-0.5"
          style={{ backgroundColor: `${pillarColor}15` }}
        >
          <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: pillarColor }}>
            {PILLAR_LABELS[slot.pillar]}
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-2 text-xs font-medium" style={{ color: "#dae2fd" }}>
        {slot.label}
      </p>

      {/* Content preview or generate CTA */}
      {hasContent ? (
        <p
          className="mt-2 line-clamp-2 text-[11px] leading-relaxed"
          style={{ color: "#909097" }}
        >
          {pieza!.content.slice(0, 100)}…
        </p>
      ) : (
        <button
          onClick={() => onGenerate?.(slot.format, slot.pillar)}
          className="mt-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all"
          style={{
            borderColor: "rgba(188,255,95,0.2)",
            backgroundColor: "rgba(188,255,95,0.04)",
            color: "#bcff5f",
          }}
        >
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          Generar
        </button>
      )}
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export function Calendario({
  banco,
  onGuardar,
}: {
  banco: PiezaGuardada[];
  onGuardar: (pieza: PiezaGuardada) => void;
}) {
  // Map saved pieces to day slots (by format+pillar match)
  const [generating, setGenerating] = useState<string | null>(null);

  // Get current day index (0=Mon ... 6=Sun)
  const today = new Date().getDay(); // 0=Sun
  const todayIndex = today === 0 ? 6 : today - 1; // convert to Mon=0

  // Match banco pieces to slots
  function getPiezaForSlot(slot: SlotPlan | null): PiezaGuardada | undefined {
    if (!slot) return undefined;
    return banco.find(
      (p) => p.format === slot.format && p.pillar === slot.pillar
    );
  }

  async function handleGenerate(
    format: ContentFormat,
    pillar: ContentPillar,
    dayLabel: string
  ) {
    setGenerating(dayLabel);
    try {
      const res = await fetch("/api/contenido/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, pillar }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const { text } = JSON.parse(payload) as { text: string };
            content += text;
          } catch {}
        }
      }

      onGuardar({
        id: Math.random().toString(36).slice(2),
        format,
        pillar,
        context: "",
        zona: "",
        content,
        createdAt: new Date(),
      });
    } finally {
      setGenerating(null);
    }
  }

  // Summary stats
  const totalSlots = WEEK_PLAN.filter((w) => w.slot !== null).length;
  const completed = WEEK_PLAN.filter(
    (w) => w.slot && getPiezaForSlot(w.slot)
  ).length;
  const pct = Math.round((completed / totalSlots) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="font-headline text-xl font-bold"
            style={{ color: "#dae2fd" }}
          >
            Calendario semanal
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#909097" }}>
            Plan de contenido para la semana — 4 a 5 piezas
          </p>
        </div>

        {/* Progress */}
        <div className="shrink-0 text-right">
          <p
            className="font-headline text-2xl font-bold"
            style={{ color: "#bcff5f" }}
          >
            {completed}/{totalSlots}
          </p>
          <p className="text-xs" style={{ color: "#909097" }}>
            piezas listas
          </p>
          <div
            className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(69,70,77,0.4)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "#bcff5f" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {WEEK_PLAN.map((day, i) => (
          <SlotCard
            key={day.day}
            dayLabel={day.day}
            shortLabel={day.short}
            slot={day.slot}
            pieza={getPiezaForSlot(day.slot)}
            isToday={i === todayIndex}
            onGenerate={(format, pillar) =>
              handleGenerate(format, pillar, day.day)
            }
          />
        ))}
      </div>

      {/* Pillar legend */}
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: "rgba(69,70,77,0.3)",
          backgroundColor: "#171f33",
        }}
      >
        <p
          className="mb-3 font-label text-xs uppercase tracking-widest"
          style={{ color: "#909097" }}
        >
          Distribución de pilares esta semana
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["autoridad", "conversion", "confianza", "atraccion"] as ContentPillar[]).map(
            (p) => {
              const count = WEEK_PLAN.filter(
                (w) => w.slot?.pillar === p
              ).length;
              return (
                <div key={p} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: PILLAR_COLORS[p] }}
                  />
                  <span className="text-xs" style={{ color: "#909097" }}>
                    {PILLAR_LABELS[p]}
                  </span>
                  <span
                    className="ml-auto font-label text-xs font-bold"
                    style={{ color: "#dae2fd" }}
                  >
                    {count}x
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Loading overlay hint */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 rounded-xl border px-4 py-3"
          style={{
            borderColor: "rgba(188,255,95,0.2)",
            backgroundColor: "rgba(188,255,95,0.05)",
          }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#bcff5f" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-sm" style={{ color: "#bcff5f" }}>
            Generando contenido para {generating}…
          </span>
        </motion.div>
      )}
    </div>
  );
}
