"use client";

import { useState } from "react";
import { AgentConfig } from "@/components/integraciones/agent-config";
import { AIChat } from "@/components/dashboard/ai-chat";
import Link from "next/link";

/* ── El panel del agente de atención ───────────────────────────────────
 *
 * Ojo con no confundirlo con ARIA: ARIA es el coach que te guía a VOS por la
 * plataforma y vive en el botón flotante. Este agente habla con TUS CLIENTES.
 * Son dos agentes distintos con dos audiencias distintas, y mezclarlos fue
 * justo el bug que rompía la configuración del diagnóstico.
 *
 * Acá se define QUÉ dice el agente; POR DÓNDE lo dice se conecta en
 * Integraciones, que es el único lugar de conexiones del producto. La
 * configuración es una sola y vale para todos los canales a la vez. */
const SECCIONES = [
  { id: "agente", label: "El agente", icon: "smart_toy" },
  { id: "probar", label: "Probarlo", icon: "chat" },
] as const;

type SeccionId = (typeof SECCIONES)[number]["id"];

export function AtencionPanel({ userName }: { userName?: string }) {
  const [seccion, setSeccion] = useState<SeccionId>("agente");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex gap-1 border-b border-app-border px-4 md:px-7">
        {SECCIONES.map((s) => {
          const activa = s.id === seccion;
          return (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              aria-current={activa ? "page" : undefined}
              className="relative flex items-center gap-2 px-4 py-3 font-label text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors"
              style={{ color: activa ? "var(--info)" : "var(--muted-foreground)" }}
            >
              <span
                className="material-symbols-outlined text-base"
                style={activa ? { fontVariationSettings: "'FILL' 1" } : undefined}
                aria-hidden
              >
                {s.icon}
              </span>
              {s.label}
              {/* Subrayado en el borde de la barra, no un fondo: mantiene la
                  pestaña activa legible en los dos temas sin pelear con el
                  contraste del texto. */}
              {activa && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-info" />
              )}
            </button>
          );
        })}
      </div>

      {seccion === "probar" ? (
        // El chat ocupa todo el alto disponible y maneja su propio scroll, así
        // que no lleva el padding de las otras secciones.
        <AIChat endpoint="/api/atencion" userProfile={{ name: userName, first_time: false }} />
      ) : (
        <div className="flex-1 space-y-4 p-4 md:p-7">
          <p className="max-w-2xl font-headline text-[13px] leading-relaxed text-muted-foreground">
            Esto es lo que el agente sabe de tu negocio y cómo se comporta al
            hablar con un cliente. Vale para todos los canales a la vez — se
            conectan en{" "}
            <Link href="/integraciones" className="font-semibold text-info hover:opacity-80">
              Integraciones
            </Link>
            .
          </p>
          <AgentConfig />
        </div>
      )}
    </div>
  );
}
