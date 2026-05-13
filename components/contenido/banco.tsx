"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ContentFormat,
  ContentPillar,
  PiezaGuardada,
  FORMAT_LABELS,
  FORMAT_ICONS,
  PILLAR_LABELS,
  PILLAR_COLORS,
} from "./types";

/* ── Filter bar ────────────────────────────────────────────── */
function FilterBar({
  formatFilter,
  pillarFilter,
  onFormat,
  onPillar,
}: {
  formatFilter: ContentFormat | "all";
  pillarFilter: ContentPillar | "all";
  onFormat: (v: ContentFormat | "all") => void;
  onPillar: (v: ContentPillar | "all") => void;
}) {
  const formats: Array<ContentFormat | "all"> = [
    "all",
    "reel",
    "carrusel",
    "historia",
    "post",
  ];
  const pillars: Array<ContentPillar | "all"> = [
    "all",
    "autoridad",
    "conversion",
    "confianza",
    "atraccion",
  ];

  return (
    <div className="space-y-2">
      {/* Format filters */}
      <div className="flex flex-wrap gap-1.5">
        {formats.map((f) => {
          const active = formatFilter === f;
          return (
            <button
              key={f}
              onClick={() => onFormat(f)}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-label text-[10px] uppercase tracking-widest transition-all"
              style={{
                borderColor: active
                  ? "rgba(59,130,246,0.4)"
                  : "rgba(255,255,255,0.10)",
                backgroundColor: active
                  ? "rgba(59,130,246,0.08)"
                  : "transparent",
                color: active ? "#3b82f6" : "#64748b",
              }}
            >
              {f !== "all" && (
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {FORMAT_ICONS[f as ContentFormat]}
                </span>
              )}
              {f === "all" ? "Todos" : FORMAT_LABELS[f as ContentFormat]}
            </button>
          );
        })}
      </div>

      {/* Pillar filters */}
      <div className="flex flex-wrap gap-1.5">
        {pillars.map((p) => {
          const active = pillarFilter === p;
          const color = p !== "all" ? PILLAR_COLORS[p as ContentPillar] : "#64748b";
          return (
            <button
              key={p}
              onClick={() => onPillar(p)}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-label text-[10px] uppercase tracking-widest transition-all"
              style={{
                borderColor: active ? `${color}50` : "rgba(255,255,255,0.10)",
                backgroundColor: active ? `${color}10` : "transparent",
                color: active ? color : "#64748b",
              }}
            >
              {p !== "all" && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              {p === "all" ? "Todos" : PILLAR_LABELS[p as ContentPillar]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Pieza card ────────────────────────────────────────────── */
function PiezaCard({ pieza }: { pieza: PiezaGuardada }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const pillarColor = PILLAR_COLORS[pieza.pillar];

  function copy() {
    navigator.clipboard.writeText(pieza.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const preview = pieza.content.slice(0, 180);
  const hasMore = pieza.content.length > 180;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#10101c",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format badge */}
          <div
            className="flex items-center gap-1 rounded-md px-2 py-0.5"
            style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
          >
            <span
              className="material-symbols-outlined text-xs"
              style={{ color: "#64748b", fontVariationSettings: "'FILL' 1" }}
            >
              {FORMAT_ICONS[pieza.format]}
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>
              {FORMAT_LABELS[pieza.format]}
            </span>
          </div>
          {/* Pillar badge */}
          <div
            className="rounded-md px-2 py-0.5"
            style={{ backgroundColor: `${pillarColor}15` }}
          >
            <span
              className="font-label text-[10px] uppercase tracking-widest"
              style={{ color: pillarColor }}
            >
              {PILLAR_LABELS[pieza.pillar]}
            </span>
          </div>
          {/* Zona/context */}
          {(pieza.zona || pieza.context) && (
            <span className="text-[11px]" style={{ color: "#64748b" }}>
              {pieza.zona || pieza.context.slice(0, 30)}
            </span>
          )}
        </div>

        {/* Date + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px]" style={{ color: "#64748b" }}>
            {pieza.createdAt.toLocaleDateString("es-AR", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <button
            onClick={copy}
            className="flex h-7 w-7 items-center justify-center rounded-lg border transition-all"
            style={{
              borderColor: copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.10)",
              backgroundColor: copied ? "rgba(34,197,94,0.08)" : "transparent",
              color: copied ? "#22c55e" : "#64748b",
            }}
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div className="px-4 py-3">
        <pre
          className="whitespace-pre-wrap font-sans text-xs leading-relaxed"
          style={{ color: "#f1f5f9" }}
        >
          {expanded ? pieza.content : preview}
          {!expanded && hasMore && (
            <span style={{ color: "#64748b" }}>…</span>
          )}
        </pre>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 font-label text-[10px] uppercase tracking-widest transition-colors"
            style={{ color: "#3b82f6" }}
          >
            {expanded ? "Ver menos" : "Ver completo"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Empty state ───────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "#10101c",
        }}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ color: "#64748b" }}
        >
          inventory_2
        </span>
      </div>
      <p className="font-headline text-base font-bold" style={{ color: "#f1f5f9" }}>
        El banco está vacío
      </p>
      <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
        Generá contenido en el Generador y guardalo acá
        <br />
        para tenerlo siempre disponible.
      </p>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export function Banco({ piezas }: { piezas: PiezaGuardada[] }) {
  const [formatFilter, setFormatFilter] = useState<ContentFormat | "all">("all");
  const [pillarFilter, setPillarFilter] = useState<ContentPillar | "all">("all");

  const filtered = piezas.filter((p) => {
    if (formatFilter !== "all" && p.format !== formatFilter) return false;
    if (pillarFilter !== "all" && p.pillar !== pillarFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="font-headline text-xl font-bold"
            style={{ color: "#f1f5f9" }}
          >
            Banco de contenido
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
            Tus piezas guardadas listas para publicar
          </p>
        </div>
        {piezas.length > 0 && (
          <div
            className="rounded-xl border px-3 py-1.5 text-center"
            style={{
              borderColor: "rgba(59,130,246,0.2)",
              backgroundColor: "rgba(59,130,246,0.05)",
            }}
          >
            <p
              className="font-headline text-lg font-bold"
              style={{ color: "#3b82f6" }}
            >
              {piezas.length}
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>
              piezas
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      {piezas.length > 0 && (
        <FilterBar
          formatFilter={formatFilter}
          pillarFilter={pillarFilter}
          onFormat={setFormatFilter}
          onPillar={setPillarFilter}
        />
      )}

      {/* List */}
      {piezas.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border py-10 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "#10101c",
          }}
        >
          <p className="text-sm" style={{ color: "#64748b" }}>
            No hay piezas que coincidan con el filtro
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((pieza) => (
              <PiezaCard key={pieza.id} pieza={pieza} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
