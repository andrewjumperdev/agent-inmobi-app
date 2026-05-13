"use client";

import { useState, useOptimistic, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/lib/supabase/types";
import { LeadCard } from "./lead-card";
import { LeadDetail } from "./lead-detail";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

/* ── Pipeline stages ───────────────────────────────────────── */
export const STAGES: {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  { id: "nuevo",        label: "Nuevo",        icon: "fiber_new",       color: "#e2e8f0", bg: "rgba(188,198,224,0.07)" },
  { id: "contactado",   label: "Contactado",   icon: "phone_in_talk",   color: "#818cf8", bg: "rgba(129,140,248,0.07)" },
  { id: "calificado",   label: "Calificado",   icon: "verified",        color: "#3b82f6", bg: "rgba(59,130,246,0.07)"  },
  { id: "cita",         label: "Cita",         icon: "calendar_month",  color: "#fb923c", bg: "rgba(251,146,60,0.07)"  },
  { id: "negociacion",  label: "Negociación",  icon: "handshake",       color: "#eab308", bg: "rgba(234,179,8,0.07)"   },
  { id: "cerrado",      label: "Cerrado",      icon: "check_circle",    color: "#22c55e", bg: "rgba(34,197,94,0.07)"   },
];

/* ── Mock leads for demo ───────────────────────────────────── */
const MOCK_LEADS: Lead[] = [
  { id: "m1",  user_id: "demo", name: "Martín Rodríguez",  phone: "+5491155551111", source: "whatsapp",   urgency: "hot",  operation_type: "compra",    score: "qualified",   pipeline_stage: "nuevo",       budget_min: 80000,  budget_max: 120000, zone_interest: "Palermo",   last_contact_at: null, next_followup_at: null, notes: null, email: null, property_type: "departamento", tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*20).toISOString(), updated_at: null },
  { id: "m2",  user_id: "demo", name: "Ana López",         phone: "+5491155552222", source: "formulario", urgency: "warm", operation_type: "venta",     score: "pending",     pipeline_stage: "nuevo",       budget_min: null,   budget_max: null,   zone_interest: "Belgrano",  last_contact_at: null, next_followup_at: null, notes: null, email: "ana@mail.com", property_type: null, tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60).toISOString(), updated_at: null },
  { id: "m3",  user_id: "demo", name: "Carlos Méndez",     phone: "+5491155553333", source: "landing",    urgency: "cold", operation_type: "inversion", score: "qualified",   pipeline_stage: "contactado",  budget_min: 200000, budget_max: 500000, zone_interest: "Recoleta",  last_contact_at: new Date(Date.now() - 1000*60*60*3).toISOString(), next_followup_at: null, notes: "Interesado en duplex.", email: null, property_type: "casa", tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60*5).toISOString(), updated_at: null },
  { id: "m4",  user_id: "demo", name: "Laura García",      phone: "+5491155554444", source: "referido",   urgency: "hot",  operation_type: "compra",    score: "qualified",   pipeline_stage: "calificado",  budget_min: 150000, budget_max: 250000, zone_interest: "Caballito", last_contact_at: new Date(Date.now() - 1000*60*60*24).toISOString(), next_followup_at: new Date(Date.now() + 1000*60*60*24*2).toISOString(), notes: "Quiere 3 ambientes, piso alto.", email: "laura@mail.com", property_type: "departamento", tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60*48).toISOString(), updated_at: null },
  { id: "m5",  user_id: "demo", name: "Diego Torres",      phone: "+5491155555555", source: "whatsapp",   urgency: "warm", operation_type: "compra",    score: "pending",     pipeline_stage: "calificado",  budget_min: 50000,  budget_max: 80000,  zone_interest: "Flores",    last_contact_at: null, next_followup_at: null, notes: null, email: null, property_type: null, tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60*72).toISOString(), updated_at: null },
  { id: "m6",  user_id: "demo", name: "Valentina Cruz",    phone: "+5491155556666", source: "formulario", urgency: "hot",  operation_type: "compra",    score: "qualified",   pipeline_stage: "cita",        budget_min: 100000, budget_max: 180000, zone_interest: "Nuñez",     last_contact_at: new Date(Date.now() - 1000*60*60*12).toISOString(), next_followup_at: new Date(Date.now() + 1000*60*60*24).toISOString(), notes: "Cita confirmada el viernes 14h.", email: "val@mail.com", property_type: "departamento", tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60*96).toISOString(), updated_at: null },
  { id: "m7",  user_id: "demo", name: "Ramiro Vega",       phone: "+5491155557777", source: "landing",    urgency: "warm", operation_type: "venta",     score: "qualified",   pipeline_stage: "negociacion", budget_min: null,   budget_max: null,   zone_interest: "San Telmo", last_contact_at: new Date(Date.now() - 1000*60*60*6).toISOString(), next_followup_at: null, notes: "Negociando precio de tasación.", email: null, property_type: "PH", tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60*120).toISOString(), updated_at: null },
  { id: "m8",  user_id: "demo", name: "Sofía Beltrán",     phone: "+5491155558888", source: "referido",   urgency: "cold", operation_type: "inversion", score: "qualified",   pipeline_stage: "cerrado",     budget_min: 300000, budget_max: 600000, zone_interest: "Puerto Madero", last_contact_at: new Date(Date.now() - 1000*60*60*24*3).toISOString(), next_followup_at: null, notes: "Compra confirmada. Escritura pendiente.", email: "sofia@mail.com", property_type: "departamento", tags: null, assigned_property_id: null, source_campaign: null, created_at: new Date(Date.now() - 1000*60*60*24*10).toISOString(), updated_at: null },
];

/* ── Urgency / score color maps ────────────────────────────── */
export const URGENCY_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  hot:  { bg: "rgba(239,68,68,0.12)",   text: "#ef4444", label: "Caliente" },
  warm: { bg: "rgba(234,179,8,0.12)",   text: "#eab308", label: "Tibio"    },
  cold: { bg: "rgba(188,198,224,0.12)", text: "#e2e8f0", label: "Frío"     },
};

export const OP_LABEL: Record<string, string> = {
  compra: "Comprador", venta: "Vendedor", inversion: "Inversor",
};

export const SOURCE_ICON: Record<string, string> = {
  whatsapp: "chat", formulario: "article", landing: "web", directo: "person", referido: "group",
};

/* ── Column ────────────────────────────────────────────────── */
function KanbanColumn({
  stage,
  leads,
  onSelect,
  selectedId,
  onDrop,
  dragOver,
  onDragOver,
  onDragLeave,
}: {
  stage: typeof STAGES[number];
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  selectedId: string | null;
  onDrop: (stageId: string, leadId: string) => void;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-2 min-w-[220px] w-[220px]"
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("lead_id");
        if (id) onDrop(stage.id, id);
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5 sticky top-0 z-10"
        style={{
          backgroundColor: dragOver ? stage.bg : "#060609",
          border: dragOver ? `1px solid ${stage.color}40` : "1px solid rgba(255,255,255,0.06)",
          transition: "all 0.18s ease",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" style={{ color: stage.color }}>{stage.icon}</span>
          <span className="font-label text-[11px] uppercase tracking-widest font-bold" style={{ color: stage.color }}>
            {stage.label}
          </span>
        </div>
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full font-headline text-[10px] font-bold"
          style={{ backgroundColor: `${stage.color}18`, color: stage.color }}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-all"
        style={{
          backgroundColor: dragOver ? `${stage.color}06` : "transparent",
          border: dragOver ? `1px dashed ${stage.color}30` : "1px solid transparent",
        }}
      >
        <AnimatePresence>
          {leads.map((lead, i) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              index={i}
              selected={selectedId === lead.id}
              stageColor={stage.color}
              onClick={() => onSelect(lead)}
            />
          ))}
        </AnimatePresence>

        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-1">
            <span className="material-symbols-outlined text-2xl" style={{ color: "#1e2a42" }}>inbox</span>
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#1e2a42" }}>vacío</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main board ────────────────────────────────────────────── */
export function CrmBoard({ leads: realLeads }: { leads: Lead[] }) {
  const useMock = realLeads.length === 0;
  const baseLeads = useMock ? MOCK_LEADS : realLeads;

  const [optimisticLeads, updateOptimistic] = useOptimistic(
    baseLeads,
    (state, { leadId, newStage }: { leadId: string; newStage: string }) =>
      state.map((l) => (l.id === leadId ? { ...l, pipeline_stage: newStage } : l))
  );

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "hot" | "calificado">("all");
  const [search, setSearch] = useState("");

  function handleDrop(stageId: string, leadId: string) {
    setDragOverStage(null);
    const lead = optimisticLeads.find((l) => l.id === leadId);
    if (!lead || lead.pipeline_stage === stageId) return;

    startTransition(() => {
      updateOptimistic({ leadId, newStage: stageId });
      // In production: call server action to update Supabase
    });
  }

  const filtered = optimisticLeads.filter((l) => {
    if (filter === "hot" && l.urgency !== "hot") return false;
    if (filter === "calificado" && l.score !== "qualified") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.zone_interest?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const leadsForStage = (stageId: string) =>
    filtered.filter((l) => (l.pipeline_stage ?? "nuevo") === stageId);

  const total = optimisticLeads.length;
  const hot   = optimisticLeads.filter((l) => l.urgency === "hot").length;
  const closed = optimisticLeads.filter((l) => l.pipeline_stage === "cerrado").length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 md:px-8 py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Summary pills */}
        <div className="flex items-center gap-2">
          {[
            { label: "Total", value: total, color: "#e2e8f0" },
            { label: "Calientes", value: hot, color: "#ef4444" },
            { label: "Cerrados", value: closed, color: "#22c55e" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: "rgba(188,198,224,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-headline text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)", minWidth: "200px" }}
        >
          <span className="material-symbols-outlined text-sm" style={{ color: "#334155" }}>search</span>
          <input
            type="text"
            placeholder="Buscar lead…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: "#f1f5f9" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <span className="material-symbols-outlined text-xs" style={{ color: "#334155" }}>close</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {(["all", "hot", "calificado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-lg px-3 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all"
              style={{
                backgroundColor: filter === f ? "rgba(59,130,246,0.12)" : "transparent",
                color: filter === f ? "#3b82f6" : "#64748b",
                border: filter === f ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              }}
            >
              {f === "all" ? "Todos" : f === "hot" ? "Calientes" : "Calificados"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Demo banner ─────────────────────────────────────── */}
      {useMock && (
        <div
          className="mx-4 md:mx-8 mt-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 shrink-0"
          style={{ borderColor: "rgba(59,130,246,0.2)", backgroundColor: "rgba(59,130,246,0.05)", color: "#3b82f6" }}
        >
          <span className="material-symbols-outlined text-sm">info</span>
          Datos de demostración — conectá tu fuente de leads para ver datos reales.
        </div>
      )}

      {/* ── Kanban ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Board scroll area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-8">
          <div className="flex gap-4 items-start pb-4" style={{ minWidth: "max-content" }}>
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={leadsForStage(stage.id)}
                onSelect={(lead) => setSelectedLead(lead)}
                selectedId={selectedLead?.id ?? null}
                onDrop={handleDrop}
                dragOver={dragOverStage === stage.id}
                onDragOver={() => setDragOverStage(stage.id)}
                onDragLeave={() => setDragOverStage(null)}
              />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onStageChange={(newStage) => {
                startTransition(() => {
                  updateOptimistic({ leadId: selectedLead.id, newStage });
                  setSelectedLead({ ...selectedLead, pipeline_stage: newStage });
                });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
