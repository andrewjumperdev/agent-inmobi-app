"use client";

import { motion } from "framer-motion";

const LIVE_FEED = [
  { time: "Hace 2 min", highlight: "Lead calificado", rest: "por Lead Engine — Buenos Aires Norte", accent: true },
  { time: "Hace 8 min", highlight: "3 posts generados", rest: "por Content Agent para Instagram", accent: false },
  { time: "Hace 15 min", highlight: "CPC reducido", rest: "en 0.08 por Ads Optimizer", accent: false },
  { time: "Hace 28 min", highlight: "Forecast actualizado", rest: "ROI proyectado +18.4% mensual", accent: false },
];

export function DashboardKPI() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 gap-6 md:grid-cols-12"
    >
      {/* Main KPI */}
      <div
        className="group relative overflow-hidden rounded-xl p-8 md:col-span-8"
        style={{ backgroundColor: "#131b2e" }}
      >
        {/* Background icon */}
        <div className="absolute right-4 top-4 opacity-5 transition-opacity group-hover:opacity-10">
          <span className="material-symbols-outlined" style={{ fontSize: "96px", color: "#bcff5f" }}>
            hub
          </span>
        </div>

        <span
          className="font-label mb-2 block text-xs uppercase tracking-widest"
          style={{ color: "#bcff5f" }}
        >
          System Pulse
        </span>
        <h1
          className="font-headline text-5xl font-extrabold tracking-tighter"
          style={{ color: "#dae2fd" }}
        >
          94.2%
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#909097" }}>
          Eficiencia global de IA en todos los nodos activos.
        </p>

        <div className="mt-8 flex flex-wrap gap-10">
          {[
            { label: "Captaciones totales", value: "12,402", accent: false },
            { label: "Leads activos",        value: "843",    accent: false },
            { label: "ROI proyectado",       value: "+18.4%", accent: true  },
          ].map((stat) => (
            <div key={stat.label}>
              <span
                className="font-label block text-[10px] uppercase tracking-widest"
                style={{ color: "#45464d" }}
              >
                {stat.label}
              </span>
              <p
                className="text-2xl font-bold font-headline"
                style={{ color: stat.accent ? "#bcff5f" : "#dae2fd" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live AI Feed */}
      <div
        className="flex flex-col rounded-xl p-6 md:col-span-4"
        style={{ backgroundColor: "#131b2e" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span
            className="font-label text-xs uppercase tracking-widest"
            style={{ color: "#909097" }}
          >
            Live AI Feed
          </span>
          <motion.span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#bcff5f" }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto">
          {LIVE_FEED.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex gap-3 border-l pl-3 text-xs"
              style={{
                borderColor: item.accent ? "rgba(188,255,95,0.4)" : "rgba(69,70,77,0.4)",
              }}
            >
              <span
                className="font-label shrink-0"
                style={{ color: "#45464d" }}
              >
                {item.time}
              </span>
              <p style={{ color: "#c6c6cd" }}>
                <span
                  className="font-semibold"
                  style={{ color: item.accent ? "#bcff5f" : "#bec6e0" }}
                >
                  {item.highlight}
                </span>{" "}
                {item.rest}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
