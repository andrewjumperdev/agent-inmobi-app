"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Globe,
  Megaphone,
  Loader2,
  Mail,
  MessageCircle,
  Plug,
  Zap,
} from "lucide-react";

interface SourceStat {
  source: string;
  total: number;
  last_at: string | null;
  unqualified: number;
}

interface Datos {
  sources: SourceStat[];
  capture: { url: string; example_payload: Record<string, unknown> };
  whatsappConnected: boolean;
  emailConfigured: boolean;
}

/* ── Los canales, y qué tan directo es conectarlos ─────────────────────
 *
 * `nativo`   — lo conecta el cliente solo, desde Integraciones.
 * `url`      — cualquier cosa que pueda hacer un POST: su formulario, un Zap.
 * `puente`   — la plataforma no postea sola; necesita Zapier o Make en el medio.
 *
 * La distinción se muestra tal cual en la UI. Presentar Instagram como si fuera
 * un botón de conectar sería mentirle al cliente sobre el trabajo que tiene por
 * delante, y lo iba a descubrir a los cinco minutos. */
const CANALES = [
  {
    id: "whatsapp",
    nombre: "WhatsApp",
    icon: MessageCircle,
    tono: "var(--success)",
    tipo: "nativo" as const,
    detalle: "Escaneás un QR y el agente empieza a atender y calificar solo.",
    accion: { label: "Conectar WhatsApp", href: "/integraciones" },
  },
  {
    id: "email",
    nombre: "Email",
    icon: Mail,
    tono: "var(--info)",
    tipo: "nativo" as const,
    detalle: "Con tu SMTP, el agente escribe y hace el seguimiento por correo.",
    accion: { label: "Configurar SMTP", href: "/integraciones" },
  },
  {
    id: "web",
    nombre: "Formulario de tu web",
    icon: Globe,
    tono: "var(--temp-cold)",
    tipo: "url" as const,
    detalle:
      "Apuntá el formulario a tu URL de captura. El lead entra y arranca la cadena.",
  },
  {
    id: "meta",
    nombre: "Instagram y Facebook",
    icon: Megaphone,
    tono: "var(--ai)",
    tipo: "puente" as const,
    detalle:
      "Meta no postea a un servidor propio sin una app aprobada por ellos. El camino corto es un puente (Zapier o Make) que escuche tus Lead Ads y reenvíe a tu URL.",
  },
  {
    id: "otros",
    nombre: "Cualquier otra fuente",
    icon: Zap,
    tono: "var(--temp-warm)",
    tipo: "url" as const,
    detalle:
      "Typeform, una planilla, tu CRM viejo, un portal inmobiliario. Si puede hacer un POST, sirve.",
  },
] as const;

const TIPO_LABEL = {
  nativo: { texto: "Integración directa", tono: "var(--success)" },
  url: { texto: "Con tu URL de captura", tono: "var(--temp-cold)" },
  puente: { texto: "Necesita un puente", tono: "var(--temp-warm)" },
};

/** Nombres legibles para las fuentes que llegan por la URL de captura. */
const SOURCE_LABEL: Record<string, string> = {
  web: "Formulario web",
  api: "Alta manual",
  whatsapp: "WhatsApp",
  evolution: "WhatsApp",
  email: "Email",
  plaud: "Plaud",
  instagram: "Instagram",
  facebook: "Facebook",
};

function hace(iso: string | null): string {
  if (!iso) return "—";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.floor(min / 60)} h`;
  return `hace ${Math.floor(min / 1440)} d`;
}

function CopyUrl({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin permiso de portapapeles queda el texto a la vista para copiar a mano */
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-app-border bg-app-canvas p-2">
      <code className="min-w-0 flex-1 truncate px-1 font-mono text-[11px] text-muted-foreground">
        {url || "—"}
      </code>
      <button
        onClick={copiar}
        disabled={!url}
        className="flex shrink-0 items-center gap-1.5 rounded-[7px] bg-info px-2.5 py-1.5 font-headline text-[11px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {copiado ? <Check size={12} /> : <Copy size={12} />}
        {copiado ? "Copiada" : "Copiar"}
      </button>
    </div>
  );
}

export function Fuentes() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    fetch("/api/captacion")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Datos) => vigente && setDatos(d))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, []);

  if (error) {
    return (
      <div className="p-8 font-headline text-[13px] text-muted-foreground">
        No pudimos cargar tus fuentes. Recargá la página.
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="animate-spin text-info" />
      </div>
    );
  }

  const total = datos.sources.reduce((a, s) => a + s.total, 0);
  const conectados =
    (datos.whatsappConnected ? 1 : 0) + (datos.emailConfigured ? 1 : 0);

  const estado = (id: string) =>
    id === "whatsapp" ? datos.whatsappConnected : id === "email" ? datos.emailConfigured : null;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-7">
      <div>
        <h2 className="font-headline text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
          De dónde vienen tus leads
        </h2>
        <p className="mt-[3px] font-headline text-[13px] text-muted-foreground">
          {total === 0
            ? "Todavía no entró ninguno. Conectá una fuente y empiezan a aparecer acá."
            : `${total} lead${total === 1 ? "" : "s"} en total · ${conectados} canal${
                conectados === 1 ? "" : "es"
              } conectado${conectados === 1 ? "" : "s"}.`}
        </p>
      </div>

      {/* ── Fuentes con datos reales ── */}
      {datos.sources.length > 0 && (
        <section className="rounded-2xl border border-app-border bg-app-surface p-[18px]">
          <h3 className="mb-4 font-label text-[10px] uppercase tracking-[0.18em] text-app-label">
            Leads por fuente
          </h3>
          <ul className="flex flex-col gap-3">
            {datos.sources.map((s) => {
              const pct = total ? Math.round((s.total / total) * 100) : 0;
              return (
                <li key={s.source} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-headline text-[13px] font-bold text-foreground">
                        {SOURCE_LABEL[s.source] ?? s.source}
                      </span>
                      <span className="font-headline text-[11.5px] text-muted-foreground">
                        {s.total} · {pct}% · {hace(s.last_at)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-app-canvas">
                      <div
                        className="h-full rounded-full bg-info"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    {/* Sin calificar es la señal útil: una fuente con volumen
                        alto y calificación baja trae ruido, no clientes. */}
                    {s.unqualified > 0 && (
                      <p className="mt-1 font-headline text-[11px] text-muted-foreground">
                        {s.unqualified} sin calificar
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Tu URL de captura ── */}
      <section className="rounded-2xl border border-app-border bg-app-surface p-[18px]">
        <h3 className="mb-1 font-label text-[10px] uppercase tracking-[0.18em] text-app-label">
          Tu URL de captura
        </h3>
        <p className="mb-3 font-headline text-[13px] leading-relaxed text-muted-foreground">
          Pegala donde quieras que entren leads. Cualquier servicio que pueda
          hacer un POST sirve — cambiá <code className="font-mono text-[12px]">source=</code>{" "}
          por el nombre de cada origen y después vas a ver cuál te rinde.
        </p>
        <CopyUrl url={datos.capture.url} />
        <p className="mt-2.5 font-headline text-[11px] text-muted-foreground">
          Es única de tu cuenta y lleva tu token. Tratala como una contraseña.
        </p>
      </section>

      {/* ── Los canales ── */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {CANALES.map((c) => {
          const conectado = estado(c.id);
          const tipo = TIPO_LABEL[c.tipo];
          return (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-[18px]"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-[11px]"
                  style={{ backgroundColor: `color-mix(in oklab, ${c.tono} 13%, transparent)` }}
                >
                  <c.icon size={17} style={{ color: c.tono }} aria-hidden />
                </span>
                {conectado === null ? (
                  <span
                    className="rounded-full px-2 py-0.5 font-label text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      color: tipo.tono,
                      backgroundColor: `color-mix(in oklab, ${tipo.tono} 13%, transparent)`,
                    }}
                  >
                    {tipo.texto}
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 font-label text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      color: conectado ? "var(--success)" : "var(--app-label)",
                      backgroundColor: conectado
                        ? "color-mix(in oklab, var(--success) 13%, transparent)"
                        : "transparent",
                    }}
                  >
                    {conectado && <Check size={10} />}
                    {conectado ? "Conectado" : "Sin conectar"}
                  </span>
                )}
              </div>

              <div>
                <p className="font-headline text-[13.5px] font-bold text-foreground">
                  {c.nombre}
                </p>
                <p className="mt-1 font-headline text-[12px] leading-relaxed text-muted-foreground">
                  {c.detalle}
                </p>
              </div>

              {"accion" in c && (
                <Link
                  href={c.accion.href}
                  className="inline-flex items-center gap-1 font-headline text-[11.5px] font-semibold text-info transition-opacity hover:opacity-80"
                >
                  {c.accion.label}
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          );
        })}
      </section>

      <p className="flex items-start gap-2 font-headline text-[11.5px] leading-relaxed text-muted-foreground">
        <Plug size={13} className="mt-0.5 shrink-0" aria-hidden />
        Venga de donde venga, el lead entra al mismo pipeline: el agente lo
        califica y lo vas a ver en el CRM con su temperatura.
      </p>
    </div>
  );
}
