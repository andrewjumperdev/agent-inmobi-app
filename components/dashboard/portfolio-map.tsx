"use client";

import { motion } from "framer-motion";

const BARS = [32, 55, 80, 48, 65, 90, 42, 70, 58, 85, 38, 62];

export function PortfolioMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl p-6 md:p-8"
      style={{ backgroundColor: "#0c0c14" }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2
            className="font-headline text-2xl font-bold"
            style={{ color: "#f1f5f9" }}
          >
            Portfolio Propagation
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
            Mapa de calor en tiempo real — adquisición de leads por zona.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-lg px-4 py-2 font-label text-xs uppercase tracking-widest transition-colors"
            style={{ backgroundColor: "#222a3d", color: "#94a3b8" }}
          >
            Exportar
          </button>
          <button
            className="rounded-lg px-4 py-2 font-label text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
            style={{ backgroundColor: "#3b82f6", color: "#ffffff" }}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div
        className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: "#060609" }}
      >
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Animated corner glows */}
        <motion.div
          className="pointer-events-none absolute left-1/4 top-1/3 h-32 w-32 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-1/3 bottom-1/4 h-24 w-24 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(188,198,224,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Bar chart */}
        <div className="relative z-10 flex items-end gap-2 px-8">
          {BARS.map((h, i) => (
            <motion.div
              key={i}
              className="w-3 flex-1 rounded-t-sm"
              style={{ backgroundColor: `rgba(59,130,246,${0.15 + (h / 100) * 0.85})` }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{
                delay: 0.5 + i * 0.05,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </div>

        {/* Processing label */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <motion.span
            className="font-label text-[10px] uppercase tracking-widest"
            style={{ color: "#334155" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Procesando streams de datos…
          </motion.span>
        </div>
      </div>

      {/* Zone legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {["Zona Norte", "Zona Centro", "Zona Sur", "Zona Este", "Zona Oeste"].map(
          (zone, i) => (
            <div key={zone} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `rgba(59,130,246,${0.3 + i * 0.14})` }}
              />
              <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
                {zone}
              </span>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
