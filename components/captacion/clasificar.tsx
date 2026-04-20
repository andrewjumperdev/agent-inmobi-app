"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

/* ── Constants ─────────────────────────────────────────────── */
const OP_OPTIONS = [
  { value: "compra",    label: "Comprador",  icon: "home"        },
  { value: "venta",     label: "Vendedor",   icon: "sell"        },
  { value: "inversion", label: "Inversor",   icon: "trending_up" },
];

const URGENCY_OPTIONS = [
  { value: "hot",  label: "Caliente", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  { value: "warm", label: "Tibio",    color: "#eab308", bg: "rgba(234,179,8,0.12)"  },
  { value: "cold", label: "Frío",     color: "#bec6e0", bg: "rgba(188,198,224,0.12)" },
];

const SCORE_OPTIONS = [
  { value: "qualified",    label: "Calificado"     },
  { value: "unqualified",  label: "No calificado"  },
  { value: "pending",      label: "Pendiente"      },
];

const MOCK_UNCLASSIFIED: Partial<Lead>[] = [
  { id: "u1", name: "Ramiro Vega",      phone: "+5491155551111", source: "whatsapp",   urgency: null, operation_type: null, budget_min: null,   budget_max: null,   zone_interest: "Palermo",   created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: "u2", name: "Sofía Beltrán",    phone: "+5491155552222", source: "formulario", urgency: null, operation_type: null, budget_min: 120000, budget_max: 200000, zone_interest: "Belgrano",  created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "u3", name: "Ignacio Ferreyra", phone: "+5491155553333", source: "landing",    urgency: null, operation_type: null, budget_min: null,   budget_max: null,   zone_interest: null,        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: "u4", name: "Valentina Cruz",   phone: "+5491155554444", source: "referido",   urgency: null, operation_type: null, budget_min: 80000,  budget_max: 150000, zone_interest: "Recoleta",  created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: "u5", name: "Matías Ríos",      phone: "+5491155555555", source: "whatsapp",   urgency: null, operation_type: null, budget_min: null,   budget_max: null,   zone_interest: "Caballito", created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
];

/* ── Time-ago ──────────────────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

/* ── Source icon ───────────────────────────────────────────── */
const SRC_ICON: Record<string, string> = {
  whatsapp: "chat", formulario: "article", landing: "web", directo: "person", referido: "group",
};

/* ── Classification state per lead ─────────────────────────── */
interface Classification {
  operation_type: string;
  urgency: string;
  score: string;
  budget_min: number | null;
  budget_max: number | null;
  zone_interest: string;
  notes: string;
}

function emptyClassification(lead: Partial<Lead>): Classification {
  return {
    operation_type: lead.operation_type ?? "",
    urgency: lead.urgency ?? "",
    score: "",
    budget_min: lead.budget_min ?? null,
    budget_max: lead.budget_max ?? null,
    zone_interest: lead.zone_interest ?? "",
    notes: "",
  };
}

/* ── AI suggestion badge ───────────────────────────────────── */
function AISuggestion({ suggestion, onApply }: { suggestion: Partial<Classification>; onApply: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex items-start justify-between gap-4"
      style={{ backgroundColor: "rgba(188,255,95,0.06)", border: "1px solid rgba(188,255,95,0.2)" }}
    >
      <div className="flex items-start gap-2">
        <span className="material-symbols-outlined text-sm mt-0.5" style={{ color: "#bcff5f" }}>auto_awesome</span>
        <div className="space-y-1">
          <p className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#bcff5f" }}>Sugerencia de ARIA</p>
          <p className="text-xs" style={{ color: "#c6c6cd" }}>
            {suggestion.operation_type && `Operación: ${OP_OPTIONS.find(o => o.value === suggestion.operation_type)?.label}`}
            {suggestion.urgency && ` · Urgencia: ${URGENCY_OPTIONS.find(u => u.value === suggestion.urgency)?.label}`}
            {suggestion.zone_interest && ` · Zona: ${suggestion.zone_interest}`}
          </p>
        </div>
      </div>
      <button
        onClick={onApply}
        className="shrink-0 rounded-lg px-3 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all"
        style={{ backgroundColor: "rgba(188,255,95,0.15)", color: "#bcff5f", border: "1px solid rgba(188,255,95,0.25)" }}
      >
        Aplicar
      </button>
    </motion.div>
  );
}

/* ── Lead row (inbox) ──────────────────────────────────────── */
function LeadRow({
  lead,
  active,
  classified,
  onClick,
}: {
  lead: Partial<Lead>;
  active: boolean;
  classified: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 transition-all"
      style={{
        backgroundColor: active
          ? "rgba(188,255,95,0.07)"
          : classified
          ? "rgba(188,198,224,0.02)"
          : "#131b2e",
        border: active
          ? "1px solid rgba(188,255,95,0.25)"
          : classified
          ? "1px solid rgba(69,70,77,0.12)"
          : "1px solid rgba(69,70,77,0.2)",
        opacity: classified ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-headline text-sm font-bold"
          style={{
            backgroundColor: classified ? "rgba(188,198,224,0.06)" : "rgba(188,255,95,0.1)",
            color: classified ? "#45464d" : "#bcff5f",
          }}
        >
          {(lead.name ?? "?").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-headline text-sm font-bold truncate" style={{ color: classified ? "#45464d" : "#dae2fd" }}>
              {lead.name ?? "Sin nombre"}
            </span>
            <span className="font-label text-[10px] shrink-0" style={{ color: "#45464d" }}>
              {lead.created_at ? timeAgo(lead.created_at) : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="material-symbols-outlined text-xs" style={{ color: "#45464d" }}>
              {SRC_ICON[lead.source ?? ""] ?? "person"}
            </span>
            <span className="font-label text-[10px] capitalize" style={{ color: "#45464d" }}>
              {lead.source ?? "directo"}
            </span>
            {lead.zone_interest && (
              <>
                <span style={{ color: "#45464d" }}>·</span>
                <span className="font-label text-[10px]" style={{ color: "#45464d" }}>
                  {lead.zone_interest}
                </span>
              </>
            )}
          </div>
        </div>

        {classified && (
          <span className="material-symbols-outlined text-sm" style={{ color: "#bcff5f" }}>check_circle</span>
        )}
      </div>
    </button>
  );
}

/* ── Chip selector ─────────────────────────────────────────── */
function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; color?: string; bg?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-widest mb-2" style={{ color: "#909097" }}>{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="rounded-full px-3 py-1 font-label text-xs uppercase tracking-widest transition-all"
              style={{
                backgroundColor: active ? (opt.bg ?? "rgba(188,255,95,0.12)") : "rgba(188,198,224,0.05)",
                color: active ? (opt.color ?? "#bcff5f") : "#909097",
                border: active
                  ? `1px solid ${opt.color ? opt.color + "50" : "rgba(188,255,95,0.3)"}`
                  : "1px solid rgba(69,70,77,0.2)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function ClasificarTab({ leads }: { leads: Lead[] }) {
  // Use real leads if available, fallback to mock
  const unclassified = leads.filter((l) => !l.operation_type || !l.urgency);
  const displayLeads: Partial<Lead>[] = unclassified.length > 0 ? unclassified : MOCK_UNCLASSIFIED;

  const [selectedId, setSelectedId] = useState<string | null>(displayLeads[0]?.id ?? null);
  const [classifications, setClassifications] = useState<Record<string, Classification>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Partial<Classification> | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedLead = displayLeads.find((l) => l.id === selectedId);
  const classification = selectedId
    ? (classifications[selectedId] ?? emptyClassification(selectedLead ?? {}))
    : null;

  function updateField<K extends keyof Classification>(field: K, value: Classification[K]) {
    if (!selectedId) return;
    setClassifications((prev) => ({
      ...prev,
      [selectedId]: { ...(prev[selectedId] ?? emptyClassification(selectedLead ?? {})), [field]: value },
    }));
    setAiSuggestion(null);
  }

  async function requestAI() {
    if (!selectedLead) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch("/api/classify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedLead.name,
          phone: selectedLead.phone,
          source: selectedLead.source,
          zone_interest: selectedLead.zone_interest,
          budget_min: selectedLead.budget_min,
          budget_max: selectedLead.budget_max,
          notes: classification?.notes ?? "",
        }),
      });
      if (res.ok) {
        const data = await res.json() as Partial<Classification>;
        setAiSuggestion(data);
      }
    } catch {}
    setAiLoading(false);
  }

  function applyAISuggestion() {
    if (!selectedId || !aiSuggestion) return;
    setClassifications((prev) => ({
      ...prev,
      [selectedId]: {
        ...(prev[selectedId] ?? emptyClassification(selectedLead ?? {})),
        ...aiSuggestion,
      },
    }));
    setAiSuggestion(null);
  }

  function save() {
    if (!selectedId || !classification) return;
    startTransition(() => {
      // In production, this would call a server action to update Supabase
      setSaveSuccess(selectedId);
      setTimeout(() => setSaveSuccess(null), 2000);
      // Move to next unclassified
      const currentIdx = displayLeads.findIndex((l) => l.id === selectedId);
      const next = displayLeads.find((l, i) => i > currentIdx && !classifications[l.id ?? ""]?.operation_type);
      if (next) setSelectedId(next.id ?? null);
    });
  }

  const classifiedCount = Object.keys(classifications).length;

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* ── Left: Lead inbox ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-72 shrink-0 space-y-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-sm font-bold" style={{ color: "#dae2fd" }}>
            Por clasificar
          </h2>
          <span
            className="rounded-full px-2 py-0.5 font-label text-[10px] font-bold uppercase"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
          >
            {displayLeads.length - classifiedCount}
          </span>
        </div>

        {/* Progress */}
        {classifiedCount > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#45464d" }}>Progreso</span>
              <span className="font-label text-[10px]" style={{ color: "#bcff5f" }}>
                {classifiedCount}/{displayLeads.length}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: "#0b1326" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "#bcff5f" }}
                animate={{ width: `${(classifiedCount / displayLeads.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        {/* Lead list */}
        <div className="space-y-2">
          {displayLeads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              active={selectedId === lead.id}
              classified={!!classifications[lead.id ?? ""]}
              onClick={() => {
                setSelectedId(lead.id ?? null);
                setAiSuggestion(null);
              }}
            />
          ))}
        </div>

        {/* Demo notice */}
        {unclassified.length === 0 && (
          <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: "rgba(188,255,95,0.04)", border: "1px solid rgba(188,255,95,0.1)" }}>
            <span className="material-symbols-outlined text-xs" style={{ color: "#bcff5f" }}>info</span>
            <p className="text-[10px]" style={{ color: "#909097" }}>Datos de demostración</p>
          </div>
        )}
      </motion.div>

      {/* ── Right: Classification panel ──────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedLead && classification ? (
          <motion.div
            key={selectedLead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-5 overflow-y-auto"
          >
            {/* Lead header */}
            <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: "#131b2e" }}>
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-headline text-lg font-bold"
                style={{ backgroundColor: "rgba(188,255,95,0.12)", color: "#bcff5f" }}
              >
                {(selectedLead.name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline text-base font-bold" style={{ color: "#dae2fd" }}>
                  {selectedLead.name ?? "Sin nombre"}
                </h3>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="font-label text-xs" style={{ color: "#909097" }}>
                    {selectedLead.phone ?? "—"}
                  </span>
                  <span style={{ color: "#45464d" }}>·</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ color: "#bcff5f" }}>
                      {SRC_ICON[selectedLead.source ?? ""] ?? "person"}
                    </span>
                    <span className="font-label text-xs capitalize" style={{ color: "#909097" }}>
                      {selectedLead.source ?? "directo"}
                    </span>
                  </div>
                  {selectedLead.created_at && (
                    <>
                      <span style={{ color: "#45464d" }}>·</span>
                      <span className="font-label text-xs" style={{ color: "#45464d" }}>
                        {timeAgo(selectedLead.created_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* AI classify button */}
              <button
                onClick={requestAI}
                disabled={aiLoading}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-label text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "rgba(188,255,95,0.1)",
                  color: "#bcff5f",
                  border: "1px solid rgba(188,255,95,0.25)",
                }}
              >
                {aiLoading ? (
                  <motion.span
                    className="material-symbols-outlined text-sm"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    sync
                  </motion.span>
                ) : (
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                )}
                {aiLoading ? "Analizando…" : "Clasificar con IA"}
              </button>
            </div>

            {/* AI suggestion */}
            <AnimatePresence>
              {aiSuggestion && (
                <AISuggestion suggestion={aiSuggestion} onApply={applyAISuggestion} />
              )}
            </AnimatePresence>

            {/* Classification fields */}
            <div className="rounded-xl p-5 space-y-5" style={{ backgroundColor: "#131b2e" }}>
              <h4 className="font-headline text-sm font-bold" style={{ color: "#dae2fd" }}>Clasificación</h4>

              <ChipGroup
                label="Tipo de operación"
                options={OP_OPTIONS}
                value={classification.operation_type as "compra" | "venta" | "inversion"}
                onChange={(v) => updateField("operation_type", v)}
              />

              <ChipGroup
                label="Urgencia"
                options={URGENCY_OPTIONS}
                value={classification.urgency as "hot" | "warm" | "cold"}
                onChange={(v) => updateField("urgency", v)}
              />

              <ChipGroup
                label="Score"
                options={SCORE_OPTIONS}
                value={classification.score as "qualified" | "unqualified" | "pending"}
                onChange={(v) => updateField("score", v)}
              />
            </div>

            {/* Budget & Zone */}
            <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: "#131b2e" }}>
              <h4 className="font-headline text-sm font-bold" style={{ color: "#dae2fd" }}>Detalles</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: "#909097" }}>
                    Presupuesto mín. (USD)
                  </label>
                  <input
                    type="number"
                    value={classification.budget_min ?? ""}
                    onChange={(e) => updateField("budget_min", e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "#0b1326", border: "1px solid rgba(69,70,77,0.4)", color: "#dae2fd" }}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: "#909097" }}>
                    Presupuesto máx. (USD)
                  </label>
                  <input
                    type="number"
                    value={classification.budget_max ?? ""}
                    onChange={(e) => updateField("budget_max", e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "#0b1326", border: "1px solid rgba(69,70,77,0.4)", color: "#dae2fd" }}
                    placeholder="150000"
                  />
                </div>
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: "#909097" }}>
                  Zona de interés
                </label>
                <input
                  type="text"
                  value={classification.zone_interest}
                  onChange={(e) => updateField("zone_interest", e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "#0b1326", border: "1px solid rgba(69,70,77,0.4)", color: "#dae2fd" }}
                  placeholder="Palermo, Belgrano, etc."
                />
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: "#909097" }}>
                  Notas del agente
                </label>
                <textarea
                  value={classification.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "#0b1326", border: "1px solid rgba(69,70,77,0.4)", color: "#dae2fd" }}
                  placeholder="Detalles adicionales sobre el lead…"
                />
              </div>
            </div>

            {/* Save button */}
            <motion.button
              onClick={save}
              disabled={isPending || !classification.operation_type || !classification.urgency}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-label text-sm uppercase tracking-widest font-bold transition-all disabled:opacity-40"
              style={{
                backgroundColor: saveSuccess === selectedLead.id ? "rgba(188,255,95,0.15)" : "#bcff5f",
                color: saveSuccess === selectedLead.id ? "#bcff5f" : "#203600",
                border: saveSuccess === selectedLead.id ? "1px solid rgba(188,255,95,0.3)" : "none",
              }}
            >
              <AnimatePresence mode="wait">
                {saveSuccess === selectedLead.id ? (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Guardado
                  </motion.span>
                ) : (
                  <motion.span key="save" className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">save</span>
                    Guardar clasificación
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
            style={{ color: "#45464d" }}
          >
            <span className="material-symbols-outlined text-4xl">inbox</span>
            <p className="font-label text-sm uppercase tracking-widest">Seleccioná un lead para clasificar</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
