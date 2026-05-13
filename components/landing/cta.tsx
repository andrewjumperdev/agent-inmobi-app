"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll } from "./motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TRUST_BADGES = [
  { icon: "calendar_month", label: "Activo en 14 días" },
  { icon: "shield_with_heart", label: "Sin contratos largos" },
  { icon: "support_agent", label: "Soporte incluido" },
  { icon: "verified", label: "Resultados en 30 días" },
];

export function CTASection({ dict }: { dict: Dictionary }) {
  return (
    <section id="cta" className="relative overflow-hidden px-6 py-28" style={{ background: "#060609" }}>
      {/* Background ambient */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-full w-full -translate-x-1/2 blur-3xl opacity-20"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.5), transparent)" }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <RevealOnScroll>
          {/* Eyebrow */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-blue-400"
              />
              <span className="font-label text-[11px] uppercase tracking-widest" style={{ color: "#93c5fd" }}>
                {dict.cta_final.eyebrow}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h2
            className="font-headline mb-6 font-extrabold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: "#f1f5f9" }}
          >
            {dict.cta_final.title}
          </h2>

          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed" style={{ color: "#64748b" }}>
            {dict.cta_final.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.a
              href="/login"
              whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(59,130,246,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-xl px-8 py-4 font-headline text-lg font-black"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(59,130,246,0.3)",
              }}
            >
              {dict.cta_final.cta}
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_forward
              </span>
            </motion.a>

            <motion.a
              href="#done-with-you"
              whileHover={{ color: "#93c5fd", transition: { duration: 0.2 } }}
              className="inline-flex items-center gap-1.5 font-label text-sm"
              style={{ color: "#475569" }}
            >
              {dict.cta_final.sub_cta}
            </motion.a>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 font-label text-[11px] uppercase tracking-widest" style={{ color: "#1e293b" }}>
            {dict.cta_final.disclaimer}
          </p>
        </RevealOnScroll>

        {/* Trust badges */}
        <RevealOnScroll delay={0.3}>
          <div
            className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t pt-10"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}
                >
                  {badge.icon}
                </span>
                <span className="font-label text-[11px] uppercase tracking-widest" style={{ color: "#334155" }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
