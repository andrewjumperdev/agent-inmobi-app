"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { WhatsAppConnect } from "@/components/integraciones/whatsapp-connect";

/* ── Los canales por los que el agente atiende ─────────────────────────
 *
 * El estado dice la verdad sobre cada uno, porque el trabajo que implica
 * conectarlos es muy distinto y el cliente merece saberlo antes de contar con
 * ello:
 *
 *   `activo`     — el agente ya responde por ahí.
 *   `disponible` — falta que el cliente lo conecte; es cuestión de minutos.
 *   `pendiente`  — todavía no construimos la integración.
 *
 * Un "Conectar" gris en Instagram sugeriría que existe y solo hay que
 * activarlo. Preferimos decir qué falta y por qué. */
const CANALES = [
  {
    id: "telegram",
    nombre: "Telegram",
    icon: Send,
    tono: "var(--temp-cold)",
    detalle:
      "Es el próximo canal razonable: la API de bots es abierta y no pasa por revisión, así que se conecta con un token y listo.",
  },
  {
    id: "instagram",
    nombre: "Instagram Direct",
    icon: Share2,
    tono: "var(--ai)",
    detalle:
      "Requiere una app de Meta aprobada por ellos, con revisión de permisos de mensajería. Es el camino más largo de todos.",
  },
  {
    id: "facebook",
    nombre: "Messenger",
    icon: MessageCircle,
    tono: "var(--info)",
    detalle:
      "Misma app de Meta y misma revisión que Instagram: si se habilita uno, el otro sale casi gratis.",
  },
] as const;

export function Canales() {
  const [emailOk, setEmailOk] = useState<boolean | null>(null);

  useEffect(() => {
    let vigente = true;
    fetch("/api/integraciones/smtp")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => vigente && setEmailOk(Boolean(d?.configured)))
      .catch(() => vigente && setEmailOk(false));
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <p className="font-headline text-[13px] leading-relaxed text-muted-foreground">
        Por acá atiende tu agente. Cada canal que conectes es una puerta más por
        donde tus clientes te escriben y reciben respuesta al instante.
      </p>

      {/* WhatsApp: el único con conexión propia hoy, así que va completo y
          arriba — es el que el cliente realmente va a usar. */}
      <WhatsAppConnect />

      {/* Email vive en Integraciones porque el SMTP también lo usa el cold
          email; acá se muestra su estado y se enlaza, sin duplicar el formulario. */}
      <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-[18px]">
        <span
          className="flex size-[34px] shrink-0 items-center justify-center rounded-[11px]"
          style={{ backgroundColor: "color-mix(in oklab, var(--info) 13%, transparent)" }}
        >
          <Mail size={17} className="text-info" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[13.5px] font-bold text-foreground">Email</p>
          <p className="font-headline text-[12px] text-muted-foreground">
            El agente responde y hace seguimiento por correo con tu SMTP.
          </p>
        </div>
        {emailOk === null ? (
          <Loader2 size={15} className="animate-spin text-muted-foreground" />
        ) : emailOk ? (
          <span className="flex items-center gap-1 rounded-full bg-success/13 px-2 py-0.5 font-label text-[9px] font-semibold uppercase tracking-wider text-success">
            <Check size={10} /> Activo
          </span>
        ) : (
          <Link
            href="/integraciones"
            className="shrink-0 font-headline text-[11.5px] font-semibold text-info hover:opacity-80"
          >
            Configurar
          </Link>
        )}
      </div>

      <div>
        <h3 className="mb-2 font-label text-[10px] uppercase tracking-[0.18em] text-app-label">
          Todavía no disponibles
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {CANALES.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-app-border bg-app-surface p-[18px]"
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex size-[34px] items-center justify-center rounded-[11px] opacity-60"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${c.tono} 13%, transparent)`,
                  }}
                >
                  <c.icon size={17} style={{ color: c.tono }} aria-hidden />
                </span>
                <span className="font-label text-[9px] uppercase tracking-wider text-app-label">
                  Pendiente
                </span>
              </div>
              <div>
                <p className="font-headline text-[13px] font-bold text-foreground">
                  {c.nombre}
                </p>
                <p className="mt-1 font-headline text-[11.5px] leading-relaxed text-muted-foreground">
                  {c.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-headline text-[11.5px] leading-relaxed text-muted-foreground">
        Cuando sumemos un canal, el agente atiende ahí con la misma configuración
        que definís abajo — no hay que volver a escribirla por cada uno.
      </p>
    </div>
  );
}
