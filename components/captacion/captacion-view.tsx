"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/lib/supabase/types";
import { CaptacionOverview } from "./overview";
import { EntryPoints } from "./entry-points";
import { ClasificarTab } from "./clasificar";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export interface Kpis {
  total: number;
  qualified: number;
  hot: number;
  unclassified: number;
  newToday: number;
  sourceCounts: Record<string, number>;
}

const TABS = [
  { id: "overview",  label: "Overview",          icon: "dashboard" },
  { id: "entrada",   label: "Puntos de Entrada",  icon: "input" },
  { id: "clasificar",label: "Clasificar",         icon: "auto_awesome" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CaptacionView({ leads, kpis }: { leads: Lead[]; kpis: Kpis }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="flex flex-col flex-1">
      {/* Tab bar */}
      <div
        className="flex gap-1 border-b px-4 md:px-8"
        style={{ borderColor: "rgba(69,70,77,0.3)", backgroundColor: "#0b1326" }}
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
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="hidden sm:block">{tab.label}</span>
              {tab.id === "clasificar" && kpis.unclassified > 0 && (
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full font-label text-[9px] font-bold"
                  style={{ backgroundColor: "#ef4444", color: "#fff" }}
                >
                  {kpis.unclassified > 9 ? "9+" : kpis.unclassified}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="tab-underline"
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
          {activeTab === "overview"   && <CaptacionOverview leads={leads} kpis={kpis} />}
          {activeTab === "entrada"    && <EntryPoints />}
          {activeTab === "clasificar" && <ClasificarTab leads={leads} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
