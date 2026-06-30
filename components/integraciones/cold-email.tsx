"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Loader2, Upload, Send, AlertTriangle, CheckCircle2, ChevronDown, Save } from "lucide-react";

interface Stats {
  pending: number; sent: number; failed: number; skipped: number; total: number; smtp_configured: boolean;
}
interface SmtpCfg {
  configured: boolean; host: string; port: number; user: string; from_email: string;
  use_tls: boolean; has_password: boolean; sender_name: string; company: string; cta_url: string;
}
type Row = { email: string; web?: string; company_name?: string };

function parseLines(text: string): Row[] {
  const rows: Row[] = [];
  for (const line of text.split("\n")) {
    const parts = line.split(/[,;\t]+/).map((p) => p.trim()).filter(Boolean);
    const email = parts.find((p) => p.includes("@"));
    if (!email) continue;
    const web = parts.find((p) => !p.includes("@") && p.includes("."));
    const company = parts.find((p) => p !== email && p !== web);
    rows.push({ email, web, company_name: company });
  }
  return rows;
}

const INPUT = "rounded-lg border px-3 py-2 text-sm outline-none w-full";
const INPUT_STYLE = { backgroundColor: "#0c0c14", borderColor: "rgba(255,255,255,0.08)", color: "#f1f5f9" };

export function ColdEmail() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [cfg, setCfg] = useState<SmtpCfg | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [pwd, setPwd] = useState("");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"import" | "run" | "save" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [s, c] = await Promise.all([
      fetch("/api/prospeccion/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/integraciones/smtp").then((r) => (r.ok ? r.json() : null)),
    ]);
    if (s) setStats(s);
    if (c) {
      setCfg(c);
      setForm({
        host: c.host, port: String(c.port || 587), user: c.user, from_email: c.from_email,
        sender_name: c.sender_name, company: c.company, cta_url: c.cta_url,
      });
      if (!c.configured) setOpen(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function saveCfg() {
    setBusy("save"); setMsg(null);
    const body: Record<string, unknown> = {
      host: form.host, port: Number(form.port) || 587, user: form.user,
      from_email: form.from_email, sender_name: form.sender_name, company: form.company, cta_url: form.cta_url,
    };
    if (pwd) body.password = pwd;
    const res = await fetch("/api/integraciones/smtp", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setBusy(null);
    if (res.ok) { setPwd(""); setMsg("Configuración guardada."); refresh(); }
    else setMsg("No se pudo guardar.");
  }

  async function importlist() {
    const rows = parseLines(text);
    if (rows.length === 0) { setMsg("No detecté correos. Formato: empresa, web, correo."); return; }
    setBusy("import"); setMsg(null);
    const res = await fetch("/api/prospeccion/import", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospects: rows }),
    });
    setBusy(null);
    if (res.ok) { const d = await res.json(); setText(""); setMsg(`Importados ${d.added}${d.skipped ? `, ${d.skipped} duplicados omitidos` : ""}.`); refresh(); }
    else setMsg("No se pudo importar.");
  }

  async function run() {
    setBusy("run"); setMsg(null);
    const res = await fetch("/api/prospeccion/run", { method: "POST" });
    setBusy(null);
    if (res.ok) { const d = await res.json(); setMsg(`Batch: ${d.processed} procesados · ${d.sent} enviados · ${d.failed} fallidos.`); refresh(); }
    else setMsg("No se pudo correr el batch.");
  }

  const counts: { label: string; key: keyof Stats; color: string }[] = [
    { label: "Pendientes", key: "pending", color: "#3b82f6" },
    { label: "Enviados", key: "sent", color: "#22c55e" },
    { label: "Fallidos", key: "failed", color: "#ef4444" },
  ];

  return (
    <div className="max-w-xl rounded-2xl border p-6" style={{ backgroundColor: "#10101c", borderColor: "rgba(69,70,77,0.5)" }}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
          <Mail size={20} style={{ color: "#3b82f6" }} />
        </div>
        <div className="flex-1">
          <p className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Cold Email · Prospección</p>
          <p className="text-xs" style={{ color: "#64748b" }}>La IA scrapea cada web, escribe un icebreaker y lo envía por tu SMTP.</p>
        </div>
        {cfg?.configured && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#22c55e" }}>
            <CheckCircle2 size={14} /> SMTP listo
          </span>
        )}
      </div>

      {/* ── Config SMTP (colapsable) ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm"
        style={{ backgroundColor: "#0c0c14", color: "#cbd5e1" }}
      >
        <span className="flex items-center gap-2">
          {!cfg?.configured && <AlertTriangle size={14} style={{ color: "#eab308" }} />}
          Configurar envío (SMTP) {cfg?.configured ? "" : "— requerido"}
        </span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input className={INPUT} style={INPUT_STYLE} placeholder="Host (smtp.tu-proveedor.com)" value={form.host || ""} onChange={(e) => set("host", e.target.value)} />
          <input className={INPUT} style={INPUT_STYLE} placeholder="Puerto (587)" value={form.port || ""} onChange={(e) => set("port", e.target.value)} />
          <input className={INPUT} style={INPUT_STYLE} placeholder="Usuario" value={form.user || ""} onChange={(e) => set("user", e.target.value)} />
          <input className={INPUT} style={INPUT_STYLE} type="password" placeholder={cfg?.has_password ? "•••• (guardada)" : "Contraseña"} value={pwd} onChange={(e) => setPwd(e.target.value)} />
          <input className={`${INPUT} col-span-2`} style={INPUT_STYLE} placeholder="From (remitente@tudominio.com)" value={form.from_email || ""} onChange={(e) => set("from_email", e.target.value)} />
          <input className={INPUT} style={INPUT_STYLE} placeholder="Tu nombre (firma)" value={form.sender_name || ""} onChange={(e) => set("sender_name", e.target.value)} />
          <input className={INPUT} style={INPUT_STYLE} placeholder="Tu empresa" value={form.company || ""} onChange={(e) => set("company", e.target.value)} />
          <input className={`${INPUT} col-span-2`} style={INPUT_STYLE} placeholder="URL del CTA (https://…)" value={form.cta_url || ""} onChange={(e) => set("cta_url", e.target.value)} />
          <button
            onClick={saveCfg}
            disabled={busy !== null}
            className="col-span-2 mt-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#3b82f6", color: "#fff" }}
          >
            {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar configuración
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {counts.map((c) => (
            <div key={c.key} className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#0c0c14" }}>
              <p className="text-xl font-bold" style={{ color: c.color }}>{stats[c.key]}</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#475569" }}>{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Import */}
      <p className="mt-5 mb-2 text-xs uppercase tracking-widest" style={{ color: "#64748b" }}>Importar prospectos</p>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={3}
        placeholder={"Empresa Uno, empresauno.com, hola@empresauno.com\nempresados.com, contacto@empresados.com"}
        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
        style={INPUT_STYLE}
      />
      {msg && <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>{msg}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button onClick={importlist} disabled={busy !== null || !text.trim()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-40" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#cbd5e1" }}>
          {busy === "import" ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Importar lista
        </button>
        <button onClick={run} disabled={busy !== null || !stats || stats.pending === 0} className="ml-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40" style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
          {busy === "run" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar batch ahora
        </button>
      </div>
    </div>
  );
}
