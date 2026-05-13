"use client";

import { motion } from "framer-motion";

const AGENTS = [
  {
    icon: "auto_awesome",
    name: "Content Agent",
    desc: "Generando posts y media",
    badge: "ACTIVO",
    badgeAccent: false,
    extra: (
      <div className="flex flex-col gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#060609" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "#3b82f6" }}
            initial={{ width: "0%" }}
            animate={{ width: "67%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </div>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
          Lote #42 en proceso
        </span>
      </div>
    ),
  },
  {
    icon: "campaign",
    name: "Ads Optimizer",
    desc: "Optimizando campañas Meta",
    badge: "OPTIMIZANDO",
    badgeAccent: false,
    extra: (
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-1 h-8">
          {[40, 60, 100, 75, 45, 80, 55].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 flex-1 rounded-full"
              style={{ backgroundColor: `rgba(59,130,246,${0.15 + (h / 100) * 0.85})` }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: "easeOut" }}
            />
          ))}
        </div>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
          $2.4k gasto diario opt.
        </span>
      </div>
    ),
  },
  {
    icon: "person_search",
    name: "Lead Engine",
    desc: "Engagement WhatsApp",
    badge: "24 CHATS",
    badgeAccent: false,
    extra: (
      <div className="flex flex-col gap-2">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full border"
              style={{
                backgroundColor: `rgba(59,130,246,${0.08 + i * 0.06})`,
                borderColor: "#10101c",
              }}
            />
          ))}
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full border font-label text-[8px] font-bold"
            style={{ backgroundColor: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.3)", color: "#3b82f6" }}
          >
            +21
          </div>
        </div>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
          Respuesta prom: 12s
        </span>
      </div>
    ),
  },
  {
    icon: "query_stats",
    name: "Strategy Core",
    desc: "Análisis ROI y mercado",
    badge: "ANALIZANDO",
    badgeAccent: true,
    extra: (
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="font-headline text-xl font-bold" style={{ color: "#3b82f6" }}>
            +4.2%
          </span>
          <span className="material-symbols-outlined text-sm" style={{ color: "#3b82f6" }}>
            trending_up
          </span>
        </div>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
          Alpha Generation v2
        </span>
      </div>
    ),
  },
];

export function AgentGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {AGENTS.map((agent, i) => (
        <motion.div
          key={agent.name}
          whileHover={{
            y: -3,
            boxShadow: agent.badgeAccent
              ? "0 8px 32px rgba(59,130,246,0.12)"
              : "0 8px 24px rgba(0,0,0,0.3)",
          }}
          className="relative cursor-pointer overflow-hidden rounded-xl p-6"
          style={{
            backgroundColor: "#10101c",
            border: agent.badgeAccent
              ? "1px solid rgba(59,130,246,0.2)"
              : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Gradient overlay for highlighted card */}
          {agent.badgeAccent && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 60%)" }}
            />
          )}

          <div className="relative z-10 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: agent.badgeAccent ? "#3b82f6" : "rgba(59,130,246,0.1)",
                  boxShadow: agent.badgeAccent ? "0 0 20px rgba(59,130,246,0.4)" : undefined,
                }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{
                    color: agent.badgeAccent ? "#ffffff" : "#3b82f6",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  {agent.icon}
                </span>
              </div>
              <span
                className="rounded px-2 py-1 font-label text-[10px] uppercase tracking-widest"
                style={{
                  backgroundColor: agent.badgeAccent ? "#3b82f6" : "rgba(59,130,246,0.08)",
                  color: agent.badgeAccent ? "#ffffff" : "#3b82f6",
                }}
              >
                {agent.badge}
              </span>
            </div>

            {/* Name + desc */}
            <div>
              <h3 className="font-headline font-bold" style={{ color: "#f1f5f9" }}>
                {agent.name}
              </h3>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {agent.desc}
              </p>
            </div>

            {/* Dynamic extra content */}
            {agent.extra}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
