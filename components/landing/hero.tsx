"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Live activity feed mock ─────────────────────────────────────── */
const ACTIVITY = [
  { icon: "person_add", label: "Nuevo lead", sub: "Martina López · CABA", time: "hace 12s", color: "#3b82f6" },
  { icon: "smart_toy", label: "IA respondió", sub: "WhatsApp · 28 segundos", time: "hace 41s", color: "#22c55e" },
  { icon: "calendar_month", label: "Cita agendada", sub: "Miércoles 10:00 AM", time: "hace 2 min", color: "#a78bfa" },
  { icon: "star", label: "Lead calificado", sub: "Score 94 · HOT", time: "hace 5 min", color: "#f59e0b" },
];

function LiveDashboard() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      {/* Glow behind the card */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-30 rounded-3xl"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #3b82f680, transparent 70%)" }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(16,16,28,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.05)",
        }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-green-400"
            />
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>
              KORE AI — Live
            </span>
          </div>
          <div style={{ width: 52 }} />
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-px"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {[
            { value: "+43%", label: "Más citas" },
            { value: "28s", label: "Resp. IA" },
            { value: "100%", label: "Contactados" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-4"
              style={{ background: "#0c0c16" }}
            >
              <span className="font-headline text-xl font-black" style={{ color: "#3b82f6" }}>
                {s.value}
              </span>
              <span className="font-label text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "#475569" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
              Actividad reciente
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-label text-[9px] uppercase tracking-widest"
              style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              en vivo
            </span>
          </div>

          {ACTIVITY.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.12, ease: EASE }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "#e2e8f0" }}>
                  {item.label}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#475569" }}>
                  {item.sub}
                </p>
              </div>
              <span className="shrink-0 font-label text-[9px] uppercase" style={{ color: "#1e293b" }}>
                {item.time}
              </span>
            </motion.div>
          ))}
        </div>

        {/* WhatsApp mock */}
        <div
          className="mx-4 mb-4 rounded-xl p-4"
          style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-base"
              style={{ color: "#22c55e", fontVariationSettings: "'FILL' 1" }}
            >
              chat
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
              WhatsApp · IA respondió
            </span>
            <span className="ml-auto font-label text-[9px]" style={{ color: "#1e293b" }}>28s</span>
          </div>
          <div
            className="rounded-lg px-3 py-2 text-xs leading-relaxed"
            style={{ background: "rgba(34,197,94,0.08)", color: "#94a3b8" }}
          >
            Hola Martina! Vi que te interesa el depto de 3 amb en Palermo. ¿Cuándo querés coordinar una visita?
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Hero ────────────────────────────────────────────────────────── */
export function HeroSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-20">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -left-[15%] top-[5%] h-[50%] w-[50%] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
      />
      <div className="pointer-events-none absolute -right-[10%] bottom-[10%] h-[35%] w-[35%] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, rgba(147,197,253,0.06) 0%, transparent 70%)" }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Copy */}
        <div className="max-w-xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-blue-400"
            />
            <span className="font-label text-[11px] uppercase tracking-widest" style={{ color: "#93c5fd" }}>
              {dict.hero.badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-headline mb-6 font-extrabold leading-[1.05] tracking-tighter"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#f1f5f9" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
              className="block"
            >
              {dict.hero.headline1}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
              className="block"
              style={{
                background: "linear-gradient(135deg, #93c5fd 0%, #3b82f6 60%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {dict.hero.headline2}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.41, ease: EASE }}
              className="block"
            >
              {dict.hero.headline3}
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
            className="mb-10 text-lg leading-relaxed"
            style={{ color: "#64748b" }}
          >
            {dict.hero.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.68, ease: EASE }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <motion.a
              href="#cta"
              whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(59,130,246,0.35)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 font-headline text-base font-bold"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#ffffff",
                boxShadow: "0 0 24px rgba(59,130,246,0.25)",
              }}
            >
              {dict.hero.cta_primary}
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_circle
              </span>
            </motion.a>

            <motion.a
              href="#solution"
              whileHover={{ color: "#f1f5f9" }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 font-headline text-base font-bold transition-colors"
              style={{
                color: "#475569",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {dict.hero.cta_secondary}
              <span className="material-symbols-outlined text-lg">arrow_downward</span>
            </motion.a>
          </motion.div>

          {/* Inline stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-10 flex items-center gap-8 border-t pt-8"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {[
              { v: dict.hero.stat1_value, l: dict.hero.stat1_label },
              { v: dict.hero.stat2_value, l: dict.hero.stat2_label },
              { v: dict.hero.stat3_value, l: dict.hero.stat3_label },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-headline text-2xl font-black" style={{ color: "#3b82f6" }}>{s.v}</p>
                <p className="font-label text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "#334155" }}>{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <LiveDashboard />
      </div>
    </section>
  );
}
