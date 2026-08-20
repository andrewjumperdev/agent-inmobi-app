"use client";

import { useState } from "react";
import { AgentConfig } from "@/components/integraciones/agent-config";
import { AIChat } from "@/components/dashboard/ai-chat";
import { Canales } from "./canales";

/* ── El panel del agente de atención ───────────────────────────────────
 *
 * Ojo con no confundirlo con ARIA: ARIA es el coach que te guía a VOS por la
 * plataforma y vive en el botón flotante. Este agente habla con TUS CLIENTES.
 * Son dos agentes distintos con dos audiencias distintas, y mezclarlos fue
 * justo el bug que rompía la configuración del diagnóstico.
 *
 * Las tres secciones siguen el orden en que uno lo pone a andar: por dónde
 * atiende, cómo se comporta, y comprobar que quedó bien. */
const SECCIONES = [
  { id: "canales", label: "Canales", icon: "hub" },
  { id: "agente", label: "El agente", icon: "smart_toy" },
  { id: "probar", label: "Probarlo", icon: "chat" },
] as const;

type SeccionId = (typeof SECCIONES)[number]["id"];

export function AtencionPanel({ userName }: { userName?: string }) {
  const [seccion, setSeccion] = useState<SeccionId>("canales");

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
        <div className="flex-1 p-4 md:p-7">
          {seccion === "canales" ? (
            <Canales />
          ) : (
            <div className="space-y-4">
              <p className="max-w-2xl font-headline text-[13px] leading-relaxed text-muted-foreground">
                Esto es lo que el agente sabe de tu negocio y cómo se comporta al
                hablar con un cliente. Vale para todos los canales conectados.
              </p>
              <AgentConfig />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
