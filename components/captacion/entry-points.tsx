"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────────── */
type Channel = "whatsapp" | "formulario" | "landing";

/* ── Channel Tab ───────────────────────────────────────────── */
const CHANNELS: { id: Channel; label: string; icon: string; color: string }[] = [
  { id: "whatsapp",   label: "WhatsApp",  icon: "chat",    color: "#25d366" },
  { id: "formulario", label: "Formulario", icon: "article", color: "#3b82f6" },
  { id: "landing",    label: "Landing",   icon: "web",     color: "#818cf8" },
];

/* ── Copy button ───────────────────────────────────────────── */
function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-label uppercase tracking-widest transition-all"
      style={{
        backgroundColor: copied ? "rgba(59,130,246,0.15)" : "rgba(188,198,224,0.08)",
        color: copied ? "#3b82f6" : "#64748b",
        border: copied ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span className="material-symbols-outlined text-xs">{copied ? "check" : "content_copy"}</span>
      {copied ? "¡Copiado!" : label}
    </button>
  );
}

/* ── Code block ────────────────────────────────────────────── */
function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: "#080f1f" }}>
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex gap-1.5">
          {["#ef4444", "#eab308", "#22c55e"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed" style={{ color: "#e2e8f0", fontFamily: "monospace" }}>
        {code}
      </pre>
    </div>
  );
}

/* ── Step badge ────────────────────────────────────────────── */
function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-headline text-xs font-bold"
        style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
      >
        {n}
      </div>
      <p className="pt-0.5 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{label}</p>
    </div>
  );
}

/* ── Stat pill ─────────────────────────────────────────────── */
function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#060609", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-sm" style={{ color: "#3b82f6" }}>{icon}</span>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>{label}</span>
      </div>
      <p className="font-headline text-xl font-bold" style={{ color: "#f1f5f9" }}>{value}</p>
    </div>
  );
}

/* ── WhatsApp Panel ────────────────────────────────────────── */
const WA_PHONE_PLACEHOLDER = "+5491100000000";
const WA_MESSAGE_DEFAULT = "Hola, me interesa recibir información sobre propiedades en venta.";

function WhatsAppPanel() {
  const [phone, setPhone] = useState(WA_PHONE_PLACEHOLDER);
  const [message, setMessage] = useState(WA_MESSAGE_DEFAULT);

  const cleanPhone = phone.replace(/\D/g, "");
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  const widgetCode = `<!-- KORE AI WhatsApp Widget -->
<a href="${waLink}" target="_blank" rel="noopener"
   style="position:fixed;bottom:24px;right:24px;z-index:9999;
          display:flex;align-items:center;justify-content:center;
          width:56px;height:56px;border-radius:50%;
          background:#25d366;box-shadow:0 8px 24px rgba(37,211,102,0.4);">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
  </svg>
</a>`;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon="trending_up" label="Tasa apertura" value="98%" />
        <StatPill icon="schedule" label="Resp. promedio" value="3 min" />
        <StatPill icon="group" label="Leads / mes" value="~40" />
      </div>

      {/* Config */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Configurar número</h3>

        <div className="space-y-3">
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest block mb-1" style={{ color: "#64748b" }}>
              Teléfono WhatsApp Business
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "#060609", border: "1px solid rgba(255,255,255,0.10)", color: "#f1f5f9" }}
              placeholder="+54911..."
            />
          </div>
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest block mb-1" style={{ color: "#64748b" }}>
              Mensaje predeterminado
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "#060609", border: "1px solid rgba(255,255,255,0.10)", color: "#f1f5f9" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-label uppercase tracking-widest"
            style={{ backgroundColor: "#25d366", color: "#fff" }}
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Probar link
          </a>
          <CopyButton text={waLink} label="Copiar link" />
        </div>
      </div>

      {/* Widget embed */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Widget para tu web</h3>
          <span className="rounded-full px-2 py-0.5 font-label text-[10px] uppercase tracking-widest" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
            HTML
          </span>
        </div>
        <p className="text-xs" style={{ color: "#64748b" }}>Pegá este código antes de cerrar el <code style={{ color: "#3b82f6" }}>&lt;/body&gt;</code> de tu sitio web.</p>
        <CodeBlock code={widgetCode} />
      </div>

      {/* Setup steps */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Guía de configuración</h3>
        <div className="space-y-4">
          <Step n={1} label="Verificá tu número en WhatsApp Business y activá el catálogo de propiedades." />
          <Step n={2} label="Copiá el link de arriba y pegalo en tu perfil de Instagram, Facebook y Google My Business." />
          <Step n={3} label="Instalá el widget de flotante en tu sitio web para capturar leads 24/7." />
          <Step n={4} label="Activá respuestas automáticas en WhatsApp Business para que ningún lead quede sin respuesta." />
        </div>
      </div>
    </div>
  );
}

/* ── Formulario Panel ──────────────────────────────────────── */
const FORM_FIELDS = [
  { id: "name",   label: "Nombre completo", type: "text",  req: true  },
  { id: "phone",  label: "Teléfono / WhatsApp", type: "tel", req: true  },
  { id: "email",  label: "Email",           type: "email", req: false },
  { id: "zone",   label: "Zona de interés", type: "text",  req: false },
  { id: "budget", label: "Presupuesto estimado (USD)", type: "number", req: false },
  { id: "type",   label: "Tipo de operación", type: "select", req: true },
];

function FormularioPanel() {
  const [activeFields, setActiveFields] = useState<string[]>(["name", "phone", "type"]);

  function toggle(id: string) {
    setActiveFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  const embedCode = `<!-- KORE AI Lead Form -->
<iframe
  src="https://app.kore.ai/form/TU_ID_AQUI"
  width="100%"
  height="520"
  frameborder="0"
  style="border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);"
  loading="lazy"
></iframe>`;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon="conversion_path" label="Conversión" value="~12%" />
        <StatPill icon="timer" label="Tiempo llenado" value="90 seg" />
        <StatPill icon="verified" label="Datos válidos" value="94%" />
      </div>

      {/* Field builder */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Campos del formulario</h3>
          <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>
            {activeFields.length} activos
          </span>
        </div>
        <div className="space-y-2">
          {FORM_FIELDS.map((field) => {
            const active = activeFields.includes(field.id);
            return (
              <div
                key={field.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all"
                style={{
                  backgroundColor: active ? "rgba(59,130,246,0.06)" : "rgba(188,198,224,0.03)",
                  border: active ? "1px solid rgba(59,130,246,0.18)" : "1px solid rgba(255,255,255,0.06)",
                }}
                onClick={() => !field.req && toggle(field.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm" style={{ color: active ? "#3b82f6" : "#334155" }}>
                    {active ? "check_box" : "check_box_outline_blank"}
                  </span>
                  <span className="text-sm" style={{ color: active ? "#f1f5f9" : "#64748b" }}>{field.label}</span>
                  {field.req && (
                    <span className="rounded-full px-1.5 py-0.5 font-label text-[9px] uppercase" style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                      requerido
                    </span>
                  )}
                </div>
                <span className="font-label text-[10px]" style={{ color: "#334155" }}>{field.type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embed */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Código de embed</h3>
        <p className="text-xs" style={{ color: "#64748b" }}>Insertá este iframe en cualquier página web, portal inmobiliario o blog.</p>
        <CodeBlock code={embedCode} />
      </div>

      {/* Setup steps */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Guía de configuración</h3>
        <div className="space-y-4">
          <Step n={1} label="Seleccioná los campos que querés mostrar. Los requeridos no se pueden desactivar." />
          <Step n={2} label="Copiá el código de embed y pegalo en tu web o portal inmobiliario." />
          <Step n={3} label="Cada envío del formulario crea un lead automáticamente en tu panel de Captación." />
          <Step n={4} label="Los leads del formulario se clasifican automáticamente con IA según los datos ingresados." />
        </div>
      </div>
    </div>
  );
}

/* ── Landing Panel ─────────────────────────────────────────── */
const LANDING_TEMPLATES = [
  { id: "compra",    label: "Compra de propiedades",  icon: "home",          leads: "25-40/mes",  cr: "8%" },
  { id: "venta",     label: "Vender mi propiedad",    icon: "sell",          leads: "15-25/mes",  cr: "12%" },
  { id: "inversion", label: "Inversión inmobiliaria", icon: "trending_up",   leads: "10-20/mes",  cr: "15%" },
  { id: "tasacion",  label: "Tasación gratuita",      icon: "calculate",     leads: "30-50/mes",  cr: "18%" },
];

function LandingPanel() {
  const [selected, setSelected] = useState("compra");

  const selectedTpl = LANDING_TEMPLATES.find((t) => t.id === selected)!;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon="speed" label="Carga" value="< 1 seg" />
        <StatPill icon="devices" label="Mobile-first" value="100%" />
        <StatPill icon="search" label="SEO Ready" value="Sí" />
      </div>

      {/* Template picker */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Plantilla de landing</h3>
        <div className="grid grid-cols-2 gap-3">
          {LANDING_TEMPLATES.map((tpl) => {
            const active = selected === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelected(tpl.id)}
                className="text-left rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: active ? "rgba(59,130,246,0.08)" : "rgba(188,198,224,0.03)",
                  border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-base" style={{ color: active ? "#3b82f6" : "#64748b" }}>
                    {tpl.icon}
                  </span>
                  <span className="font-label text-xs font-bold" style={{ color: active ? "#f1f5f9" : "#64748b" }}>
                    {tpl.label}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="font-label text-[10px] uppercase" style={{ color: "#334155" }}>
                    {tpl.leads}
                  </span>
                  <span className="font-label text-[10px] uppercase" style={{ color: active ? "#3b82f6" : "#334155" }}>
                    CR {tpl.cr}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Link preview */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Tu link de captación</h3>
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3"
          style={{ backgroundColor: "#060609", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="material-symbols-outlined text-sm" style={{ color: "#3b82f6" }}>link</span>
          <span className="flex-1 font-label text-xs truncate" style={{ color: "#e2e8f0" }}>
            app.kore.ai/lp/tu-agencia/{selectedTpl.id}
          </span>
          <CopyButton text={`https://app.kore.ai/lp/tu-agencia/${selectedTpl.id}`} />
        </div>

        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
          <span className="material-symbols-outlined text-xs" style={{ color: "#3b82f6" }}>info</span>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Conversión estimada: <span style={{ color: "#3b82f6" }}>{selectedTpl.cr}</span> · Leads/mes: <span style={{ color: "#3b82f6" }}>{selectedTpl.leads}</span>
          </p>
        </div>
      </div>

      {/* Setup steps */}
      <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#0c0c14" }}>
        <h3 className="font-headline text-sm font-bold" style={{ color: "#f1f5f9" }}>Guía de configuración</h3>
        <div className="space-y-4">
          <Step n={1} label="Elegí la plantilla que mejor represente tu oferta principal." />
          <Step n={2} label="Compartí el link en tus campañas de Meta Ads, Google Ads o redes sociales." />
          <Step n={3} label="Personalizá el nombre de tu agencia en Configuración para que aparezca en la URL." />
          <Step n={4} label="Activá notificaciones para recibir un WhatsApp cada vez que llegue un nuevo lead." />
        </div>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function EntryPoints() {
  const [channel, setChannel] = useState<Channel>("whatsapp");

  return (
    <div className="space-y-6">
      {/* Channel switcher */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex gap-2 flex-wrap"
      >
        {CHANNELS.map((ch) => {
          const active = channel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setChannel(ch.id)}
              className="relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-label text-xs uppercase tracking-widest transition-all"
              style={{
                backgroundColor: active ? `${ch.color}18` : "rgba(188,198,224,0.04)",
                color: active ? ch.color : "#64748b",
                border: active ? `1px solid ${ch.color}40` : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="material-symbols-outlined text-sm">{ch.icon}</span>
              {ch.label}
            </button>
          );
        })}
      </motion.div>

      {/* Panel content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={channel}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {channel === "whatsapp"   && <WhatsAppPanel />}
          {channel === "formulario" && <FormularioPanel />}
          {channel === "landing"    && <LandingPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
