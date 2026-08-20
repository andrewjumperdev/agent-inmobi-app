"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, PartyPopper } from "lucide-react";

/* ── Qué cuenta para el 100% ───────────────────────────────────────────
 *
 * Solo lo que HOY se puede conectar. Telegram, Instagram y Messenger no entran
 * en el denominador: incluirlos volvería el 100% inalcanzable, y una barra que
 * nunca se completa deja de ser una guía para pasar a ser un reproche
 * permanente por algo que el cliente no puede resolver.
 *
 * `esencial` distingue lo que el agente necesita para operar de lo que le suma
 * capacidades. Así se puede celebrar el hito real ("ya podés atender") sin
 * mentir sobre el total. */
const INTEGRACIONES = [
  { id: "whatsapp", nombre: "WhatsApp", esencial: true },
  { id: "email", nombre: "Email (SMTP)", esencial: true },
  { id: "calendar", nombre: "Google Calendar", esencial: false },
  { id: "voz", nombre: "Voz (ElevenLabs)", esencial: false },
] as const;

interface Estado {
  id: string;
  conectado: boolean;
}

export function BarraProgreso() {
  const [estados, setEstados] = useState<Estado[] | null>(null);

  useEffect(() => {
    let vigente = true;
    fetch("/api/integraciones/estado")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => vigente && setEstados(d?.estados ?? []))
      .catch(() => vigente && setEstados([]));
    return () => {
      vigente = false;
    };
  }, []);

  if (!estados) {
    return (
      <div className="flex h-[92px] items-center justify-center rounded-2xl border border-app-border bg-app-surface">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const conectado = (id: string) => estados.find((e) => e.id === id)?.conectado ?? false;
  const listos = INTEGRACIONES.filter((i) => conectado(i.id));
  const pct = Math.round((listos.length / INTEGRACIONES.length) * 100);
  const completo = pct === 100;

  const esenciales = INTEGRACIONES.filter((i) => i.esencial);
  const puedeOperar = esenciales.every((i) => conectado(i.id));

  return (
    <section
      className="rounded-2xl border p-[18px]"
      style={{
        borderColor: completo
          ? "color-mix(in oklab, var(--success) 35%, transparent)"
          : "var(--app-border)",
        backgroundColor: completo
          ? "color-mix(in oklab, var(--success) 7%, transparent)"
          : "var(--app-surface)",
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          {completo && <PartyPopper size={17} className="text-success" aria-hidden />}
          <h2 className="font-headline text-[15px] font-extrabold tracking-[-0.02em] text-foreground">
            {completo ? "Todo conectado" : "Tus conexiones"}
          </h2>
        </div>
        <span
          className="font-headline text-[15px] font-extrabold tabular-nums"
          style={{ color: completo ? "var(--success)" : "var(--info)" }}
        >
          {pct}%
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-app-canvas"
        role="progressbar"
        aria-valuenow={listos.length}
        aria-valuemin={0}
        aria-valuemax={INTEGRACIONES.length}
        aria-label={`${listos.length} de ${INTEGRACIONES.length} integraciones conectadas`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.max(pct, 2)}%`,
            backgroundColor: completo ? "var(--success)" : "var(--info)",
          }}
        />
      </div>

      <p className="mt-2.5 font-headline text-[12px] text-muted-foreground">
        {completo
          ? "No queda nada por conectar. Tu agente tiene todas sus capacidades disponibles."
          : puedeOperar
            ? `${listos.length} de ${INTEGRACIONES.length}. Tu agente ya puede atender; lo que falta suma capacidades.`
            : `${listos.length} de ${INTEGRACIONES.length}. Conectá WhatsApp y el email para que tu agente empiece a atender.`}
      </p>

      {/* Las fichas repiten el estado en texto además del color: quien no
          distingue verde de gris igual lee "Conectado" o "Falta". */}
      <ul className="mt-3.5 flex flex-wrap gap-2">
        {INTEGRACIONES.map((i) => {
          const ok = conectado(i.id);
          return (
            <li
              key={i.id}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
              style={{
                borderColor: ok
                  ? "color-mix(in oklab, var(--success) 30%, transparent)"
                  : "var(--app-border)",
                backgroundColor: ok
                  ? "color-mix(in oklab, var(--success) 10%, transparent)"
                  : "transparent",
              }}
            >
              {ok ? (
                <Check size={11} className="text-success" aria-hidden />
              ) : (
                <span
                  className="size-[7px] rounded-full bg-app-label"
                  aria-hidden
                />
              )}
              <span
                className="font-headline text-[11.5px] font-semibold"
                style={{ color: ok ? "var(--success)" : "var(--muted-foreground)" }}
              >
                {i.nombre}
              </span>
              <span className="font-label text-[9px] uppercase tracking-wider text-app-label">
                {ok ? "Conectado" : i.esencial ? "Falta" : "Opcional"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
