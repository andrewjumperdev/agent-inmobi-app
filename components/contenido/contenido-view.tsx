"use client";

import { useState } from "react";
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

export function ContenidoView() {
  const [activeTab, setActiveTab] = useState<TabId>("generador");
  const [banco, setBanco] = useState<PiezaGuardada[]>([]);

  function guardar(pieza: PiezaGuardada) {
    setBanco((prev) => [pieza, ...prev]);
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Tab bar */}
      <div
        className="flex gap-1 border-b px-4 md:px-8"
        style={{
          borderColor: "rgba(69,70,77,0.3)",
          backgroundColor: "#0b1326",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-3 font-label text-xs uppercase tracking-widest transition-colors"
              style={{ color: active ? "#bcff5f" : "#909097" }}
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
                  style={{ backgroundColor: "#bcff5f", color: "#203600" }}
                >
                  {banco.length}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="contenido-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: "#bcff5f" }}
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
