"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Loader2, X } from "lucide-react";
import type { ContactOut } from "@/lib/kore/client";
import { LeadDetail } from "./lead-detail";

/* ── Etapas = lifecycle_stage del backend ──────────────────────────── */
const STAGES = [
  { id: "lead",        label: "Nuevo",     color: "var(--foreground)" },
  { id: "qualified",   label: "Calificado",color: "var(--info)" },
  { id: "in_proposal", label: "Propuesta", color: "var(--warning)" },
  { id: "customer",    label: "Cliente",   color: "var(--success)" },
  { id: "lost",        label: "Perdido",   color: "var(--muted-foreground)" },
] as const;

const TEMP: Record<string, { label: string; color: string }> = {
  hot:   { label: "Caliente", color: "var(--destructive)" },
  warm:  { label: "Tibio",    color: "var(--warning)" },
  cold:  { label: "Frío",     color: "var(--muted-foreground)" },
  unset: { label: "Sin calificar", color: "var(--muted-foreground)" },
};

function initials(name: string | null, phone: string | null) {
  if (name) return name.trim().slice(0, 2).toUpperCase();
  if (phone) return phone.slice(-2);
  return "··";
}

/* ── Card ───────────────────────────────────────────────────────────── */
function ContactCard({ c, color, onClick }: { c: ContactOut; color: string; onClick: () => void }) {
  const t = TEMP[c.temperature] ?? TEMP.unset;
  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => (e as unknown as DragEvent).dataTransfer?.setData("contact_id", c.id)}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="cursor-pointer rounded-xl border border-app-border bg-app-surface p-3 transition-colors hover:bg-app-surface-hover"
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg font-headline text-[11px] font-bold"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {initials(c.full_name, c.phone)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-headline text-[13px] font-bold text-foreground">
            {c.full_name || c.phone || c.email || "Sin nombre"}
          </p>
          <p className="truncate font-headline text-[11px] text-muted-foreground">
            {c.attributes?.company
              ? `${c.attributes.company}${c.attributes.role ? ` · ${c.attributes.role}` : ""}`
              : c.phone || c.email || "—"}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 font-label text-[9.5px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: `${t.color}1f`, color: t.color }}
        >
          {t.label}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Board ──────────────────────────────────────────────────────────── */
export function CrmBoard({ contacts: initial }: { contacts: ContactOut[] }) {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactOut[]>(initial);
  const [search, setSearch] = useState("");
  const [dragStage, setDragStage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<ContactOut | null>(null);

  async function moveTo(stageId: string, contactId: string) {
    setDragStage(null);
    const prev = contacts;
    const target = contacts.find((c) => c.id === contactId);
    if (!target || target.lifecycle_stage === stageId) return;
    // optimista
    setContacts((cs) => cs.map((c) => (c.id === contactId ? { ...c, lifecycle_stage: stageId } : c)));
    const res = await fetch(`/api/crm/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lifecycle_stage: stageId }),
    });
    if (!res.ok) setContacts(prev); // revertir
  }

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });
  const byStage = (id: string) => filtered.filter((c) => (c.lifecycle_stage || "lead") === id);

  const total = contacts.length;
  const hot = contacts.filter((c) => c.temperature === "hot").length;
  const customers = contacts.filter((c) => c.lifecycle_stage === "customer").length;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Top bar */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-8 shrink-0"
        style={{ borderBottom: "1px solid var(--app-border)" }}
      >
        <div className="flex items-center gap-2">
          {[
            { label: "Total", value: total, color: "var(--foreground)" },
            { label: "Calientes", value: hot, color: "var(--destructive)" },
            { label: "Clientes", value: customers, color: "var(--success)" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: "rgba(188,198,224,0.06)", border: "1px solid var(--app-border)" }}
            >
              <span className="font-headline text-[15px] font-extrabold" style={{ color: s.color }}>{s.value}</span>
              <span className="font-label text-[9.5px] font-semibold uppercase tracking-[0.16em] text-app-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)", minWidth: 200 }}
        >
          <Search size={14} style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full bg-transparent font-headline text-[13px] outline-none placeholder:text-app-label"
            style={{ color: "var(--foreground)" }}
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 font-headline text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--info)", color: "#fff" }}
        >
          <Plus size={15} /> Nuevo lead
        </button>
      </div>

      {/* Kanban + panel de detalle */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto p-4 md:p-8">
        {total === 0 && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "color-mix(in oklab, var(--info) 20%, transparent)", backgroundColor: "color-mix(in oklab, var(--info) 5%, transparent)", color: "var(--info)" }}
          >
            Todavía no hay leads. Conectá WhatsApp en <b>Integraciones</b> o cargá uno con “Nuevo lead”.
          </div>
        )}
        <div className="flex gap-4 items-start" style={{ minWidth: "max-content" }}>
          {STAGES.map((stage) => {
            const items = byStage(stage.id);
            return (
              <div
                key={stage.id}
                className="flex w-[230px] min-w-[230px] flex-col gap-2"
                onDragOver={(e) => { e.preventDefault(); setDragStage(stage.id); }}
                onDragLeave={() => setDragStage(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("contact_id");
                  if (id) moveTo(stage.id, id);
                }}
              >
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{
                    backgroundColor: dragStage === stage.id ? `${stage.color}10` : "var(--app-canvas)",
                    border: `1px solid ${dragStage === stage.id ? stage.color + "40" : "var(--app-border)"}`,
                  }}
                >
                  <span className="font-label text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: stage.color }}>
                    {stage.label}
                  </span>
                  <span
                    className="flex size-5 items-center justify-center rounded-full font-label text-[10px] font-bold"
                    style={{ backgroundColor: `${stage.color}18`, color: stage.color }}
                  >
                    {items.length}
                  </span>
                </div>
                <div
                  className="flex min-h-[120px] flex-col gap-2 rounded-xl p-2"
                  style={{ border: dragStage === stage.id ? `1px dashed ${stage.color}30` : "1px solid transparent" }}
                >
                  <AnimatePresence>
                    {items.map((c) => (
                      <ContactCard key={c.id} c={c} color={stage.color} onClick={() => setSelected(c)} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Panel de detalle */}
        <AnimatePresence>
          {selected && (
            <LeadDetail
              contact={selected}
              onClose={() => setSelected(null)}
              onStageChanged={(id, s) =>
                setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, lifecycle_stage: s } : c)))
              }
            />
          )}
        </AnimatePresence>
      </div>

      {showForm && (
        <NewLeadModal
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

/* ── Alta manual ────────────────────────────────────────────────────── */
function NewLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!phone && !email) { setError("Cargá un teléfono o un email."); return; }
    setBusy(true); setError(null);
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name || null, phone: phone || null, email: email || null, channel: "manual", source: "crm" }),
    });
    setBusy(false);
    if (res.ok) onCreated();
    else setError("No se pudo crear el lead.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ backgroundColor: "var(--app-surface-hover)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-headline text-[15px] font-extrabold tracking-[-0.02em] text-foreground">Nuevo lead</p>
          <button onClick={onClose}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { v: name, set: setName, ph: "Nombre" },
            { v: phone, set: setPhone, ph: "Teléfono (+549…)" },
            { v: email, set: setEmail, ph: "Email" },
          ].map((f, i) => (
            <input
              key={i}
              value={f.v}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.ph}
              className="rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)", color: "var(--foreground)" }}
            />
          ))}
          {error && <p className="text-xs" style={{ color: "var(--destructive)" }}>{error}</p>}
          <button
            onClick={submit}
            disabled={busy}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: "var(--info)", color: "#fff" }}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Crear lead
          </button>
          <p className="text-center text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            La IA hace el primer contacto automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
