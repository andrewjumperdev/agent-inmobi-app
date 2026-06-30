"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Loader2, Save, CheckCircle2 } from "lucide-react";

/** Campos del agente de WhatsApp — el user personaliza TODO el comportamiento. */
const FIELDS: { key: string; label: string; area?: boolean; rows?: number }[] = [
  { key: "agent_name", label: "Nombre del agente" },
  { key: "company_name", label: "Empresa" },
  { key: "company_tagline", label: "Tagline / slogan" },
  { key: "objective", label: "Objetivo del agente", area: true, rows: 2 },
  { key: "about", label: "Sobre la empresa (qué hacen)", area: true, rows: 3 },
  { key: "proof_points", label: "Prueba social / resultados (autoridad)", area: true, rows: 3 },
  { key: "meeting_duration", label: "Duración de la reunión" },
  { key: "availability", label: "Disponibilidad (días y horario)" },
  { key: "tone", label: "Tono" },
  { key: "emojis", label: "Emojis a usar" },
  { key: "language", label: "Idioma" },
  { key: "flow", label: "Flujo obligatorio (pasos)", area: true, rows: 5 },
  { key: "rules", label: "Reglas críticas", area: true, rows: 4 },
];

const STYLE = { backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.08)", color: "#f1f5f9" };

export function AgentConfig() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [configured, setConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/integraciones/whatsapp-agent");
    if (!res.ok) return;
    const d = await res.json();
    setConfigured(Boolean(d.configured));
    const f: Record<string, string> = {};
    for (const fl of FIELDS) f[fl.key] = String(d[fl.key] ?? "");
    setForm(f);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/integraciones/whatsapp-agent", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) { setMsg("Guardado ✓ — el agente ya responde con esta personalidad."); load(); }
    else setMsg("No se pudo guardar.");
  }

  return (
    <div className="max-w-xl rounded-2xl border p-6" style={{ backgroundColor: "#10101c", borderColor: "rgba(69,70,77,0.5)" }}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
          <Bot size={20} style={{ color: "#a855f7" }} />
        </div>
        <div className="flex-1">
          <p className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Agente de WhatsApp</p>
          <p className="text-xs" style={{ color: "#64748b" }}>Personalizá todo lo que el agente dice y cómo califica/agenda.</p>
        </div>
        {configured && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#22c55e" }}>
            <CheckCircle2 size={14} /> Personalizado
          </span>
        )}
      </div>

      <p className="mt-3 text-xs" style={{ color: "#475569" }}>
        Viene pre-cargado con un ejemplo (FAUSTO). Editá lo que quieras y guardá.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {FIELDS.map((fl) => (
          <div key={fl.key}>
            <label className="mb-1 block text-[11px] uppercase tracking-widest" style={{ color: "#64748b" }}>{fl.label}</label>
            {fl.area ? (
              <textarea
                rows={fl.rows ?? 3}
                value={form[fl.key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [fl.key]: e.target.value }))}
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none"
                style={STYLE}
              />
            ) : (
              <input
                value={form[fl.key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [fl.key]: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={STYLE}
              />
            )}
          </div>
        ))}
      </div>

      {msg && <p className="mt-3 text-xs" style={{ color: "#94a3b8" }}>{msg}</p>}

      <button
        onClick={save}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        style={{ backgroundColor: "#3b82f6", color: "#fff" }}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar personalidad
      </button>
    </div>
  );
}
