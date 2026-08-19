"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Generador } from "./generador";
import { Calendario } from "./calendario";
import { Banco } from "./banco";
import type { PiezaGuardada } from "./types";

const TABS = [
  { id: "generador", label: "Generador", icon: "auto_awesome" },
  { id: "calendario", label: "Calendario", icon: "calendar_month" },
  { id: "banco", label: "Banco", icon: "inventory_2" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Forma en que el backend devuelve una pieza (app/api/v1/content.py). */
interface PiezaRemota {
  id: string;
  format: PiezaGuardada["format"];
  pillar: PiezaGuardada["pillar"];
  content: string;
  context: string;
  zona: string;
  created_at: string;
}

const desdeApi = (p: PiezaRemota): PiezaGuardada => ({
  id: p.id,
  format: p.format,
  pillar: p.pillar,
  content: p.content,
  context: p.context,
  zona: p.zona,
  createdAt: new Date(p.created_at),
});

export function ContenidoView() {
  const [activeTab, setActiveTab] = useState<TabId>("generador");
  const [banco, setBanco] = useState<PiezaGuardada[]>([]);

  // El banco vive en el servidor. Antes era estado del navegador y se perdía
  // al refrescar, junto con el costo de haberlo generado.
  useEffect(() => {
    let vigente = true;
    fetch("/api/contenido/piezas")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: PiezaRemota[]) => {
        if (vigente && Array.isArray(d)) setBanco(d.map(desdeApi));
      })
      .catch(() => {
        /* sin banco se puede seguir generando; no vale romper la pantalla */
      });
    return () => {
      vigente = false;
    };
  }, []);

  async function guardar(pieza: PiezaGuardada) {
    // Optimista: la pieza aparece ya, y si el guardado falla se retira. Quien
    // acaba de generar algo espera verlo en el banco en el acto.
    setBanco((prev) => [pieza, ...prev]);
    try {
      const res = await fetch("/api/contenido/piezas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: pieza.format,
          pillar: pieza.pillar,
          content: pieza.content,
          context: pieza.context,
          zona: pieza.zona,
        }),
      });
      if (!res.ok) throw new Error("save");
      const guardada = (await res.json()) as PiezaRemota;
      // Se reemplaza por la del servidor para quedarnos con su id real: sin eso
      // un borrado posterior apuntaría a un id que no existe en la base.
      setBanco((prev) => prev.map((p) => (p.id === pieza.id ? desdeApi(guardada) : p)));
    } catch {
      setBanco((prev) => prev.filter((p) => p.id !== pieza.id));
    }
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Tab bar */}
      <div
        className="flex gap-1 border-b px-4 md:px-8"
        style={{
          borderColor: "var(--app-border)",
          backgroundColor: "var(--app-canvas)",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-3 font-label text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors"
              style={{ color: active ? "var(--info)" : "var(--muted-foreground)" }}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {tab.icon}
              </span>
              <span className="hidden sm:block">{tab.label}</span>
              {tab.id === "banco" && banco.length > 0 && (
                <span
                  className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-label text-[9px] font-bold"
                  style={{ backgroundColor: "var(--info)", color: "#ffffff" }}
                >
                  {banco.length}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="contenido-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: "var(--info)" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-y-auto p-4 md:p-8"
        >
          {activeTab === "generador" && (
            <Generador onGuardar={guardar} />
          )}
          {activeTab === "calendario" && (
            <Calendario banco={banco} onGuardar={guardar} />
          )}
          {activeTab === "banco" && (
            <Banco piezas={banco} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
