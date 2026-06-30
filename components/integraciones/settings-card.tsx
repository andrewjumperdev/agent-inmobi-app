"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, AlertTriangle } from "lucide-react";

export interface SettingsField {
  key: string;
  label: string;
  secret?: boolean;
  full?: boolean;
  type?: string;
}

const INPUT = "rounded-lg border px-3 py-2 text-sm outline-none w-full";
const INPUT_STYLE = { backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.08)", color: "#f1f5f9" };

/** Card genérica de credenciales por-tenant: GET el estado, edita y PUT.
 *  Los secretos no vuelven del backend (has_<key>): se muestran como "guardado". */
export function SettingsCard({
  title,
  subtitle,
  icon,
  endpoint,
  fields,
  hint,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  endpoint: string;
  fields: SettingsField[];
  hint?: string;
}) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(endpoint);
    if (!res.ok) return;
    const d = (await res.json()) as Record<string, unknown>;
    setData(d);
    const f: Record<string, string> = {};
    for (const fl of fields) if (!fl.secret) f[fl.key] = String(d[fl.key] ?? "");
    setForm(f);
  }, [endpoint, fields]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setBusy(true);
    setMsg(null);
    const body: Record<string, unknown> = { ...form };
    for (const [k, v] of Object.entries(secrets)) if (v) body[k] = v;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      setSecrets({});
      setMsg("Guardado ✓");
      load();
    } else setMsg("No se pudo guardar.");
  }

  const configured = Boolean(data?.configured);

  return (
    <div className="max-w-xl rounded-2xl border p-6" style={{ backgroundColor: "#10101c", borderColor: "rgba(69,70,77,0.5)" }}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>{title}</p>
          <p className="text-xs" style={{ color: "#64748b" }}>{subtitle}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: configured ? "#22c55e" : "#64748b" }}>
          {configured ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} style={{ color: "#eab308" }} />}
          {configured ? "Conectado" : "Sin conectar"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {fields.map((fl) => {
          const hasSaved = Boolean(data?.[`has_${fl.key}`]);
          return (
            <input
              key={fl.key}
              className={`${INPUT} ${fl.full ? "col-span-2" : ""}`}
              style={INPUT_STYLE}
              type={fl.secret ? "password" : fl.type ?? "text"}
              placeholder={fl.secret && hasSaved ? "•••• (guardado)" : fl.label}
              value={fl.secret ? secrets[fl.key] ?? "" : form[fl.key] ?? ""}
              onChange={(e) =>
                fl.secret
                  ? setSecrets((s) => ({ ...s, [fl.key]: e.target.value }))
                  : setForm((f) => ({ ...f, [fl.key]: e.target.value }))
              }
            />
          );
        })}
      </div>

      {hint && <p className="mt-3 text-xs leading-relaxed" style={{ color: "#475569" }}>{hint}</p>}
      {msg && <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>{msg}</p>}

      <button
        onClick={save}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        style={{ backgroundColor: "#3b82f6", color: "#fff" }}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar
      </button>
    </div>
  );
}
