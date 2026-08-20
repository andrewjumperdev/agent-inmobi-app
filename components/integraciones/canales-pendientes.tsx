"use client";

import { MessageCircle, Send, Share2 } from "lucide-react";

/* ── Canales que todavía no se pueden conectar ─────────────────────────
 *
 * Se muestran, pero NO cuentan para el 100% de la barra: incluirlos volvería
 * el total inalcanzable, y una barra que nunca se completa deja de guiar para
 * pasar a ser un reproche por algo que el cliente no puede resolver.
 *
 * Cada uno dice por qué falta, porque el motivo cambia la expectativa: uno es
 * trabajo nuestro y los otros dependen de que Meta apruebe una app. */
const PENDIENTES = [
  {
    id: "telegram",
    nombre: "Telegram",
    icon: Send,
    tono: "var(--temp-cold)",
    detalle:
      "El próximo razonable: su API de bots es abierta y no pasa por revisión, así que se conecta con un token.",
  },
  {
    id: "instagram",
    nombre: "Instagram Direct",
    icon: Share2,
    tono: "var(--ai)",
    detalle:
      "Necesita una app de Meta con permisos de mensajería aprobados por ellos. Es el camino más largo.",
  },
  {
    id: "facebook",
    nombre: "Messenger",
    icon: MessageCircle,
    tono: "var(--info)",
    detalle:
      "Misma app y misma revisión que Instagram: habilitando uno, el otro sale casi gratis.",
  },
] as const;

export function CanalesPendientes() {
  return (
    <div>
      <h3 className="mb-2.5 font-label text-[10px] uppercase tracking-[0.18em] text-app-label">
        Todavía no disponibles
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {PENDIENTES.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-app-border bg-app-surface p-[18px]"
          >
            <div className="flex items-center justify-between">
              <span
                className="flex size-[34px] items-center justify-center rounded-[11px] opacity-60"
                style={{ backgroundColor: `color-mix(in oklab, ${c.tono} 13%, transparent)` }}
              >
                <c.icon size={17} style={{ color: c.tono }} aria-hidden />
              </span>
              <span className="font-label text-[9px] uppercase tracking-wider text-app-label">
                Pendiente
              </span>
            </div>
            <div>
              <p className="font-headline text-[13px] font-bold text-foreground">{c.nombre}</p>
              <p className="mt-1 font-headline text-[11.5px] leading-relaxed text-muted-foreground">
                {c.detalle}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2.5 font-headline text-[11.5px] text-muted-foreground">
        No cuentan para el progreso de arriba. Cuando sumemos uno, tu agente
        atiende ahí con la misma configuración que ya definiste.
      </p>
    </div>
  );
}
