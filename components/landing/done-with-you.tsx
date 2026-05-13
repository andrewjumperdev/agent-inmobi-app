"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem, fadeUp } from "./motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ITEM_ICONS = ["rocket_launch", "query_stats"];

const TIMELINE_ITEMS = [
  { day: "Día 1–3", label: "Onboarding & setup" },
  { day: "Día 4–7", label: "Configuración de agentes IA" },
  { day: "Día 8–12", label: "Pruebas & ajuste fino" },
  { day: "Día 14", label: "Lanzamiento en producción" },
];

export function DoneWithYouSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="done-with-you" className="px-6 py-24" style={{ background: "#08080f" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Visual — implementation timeline */}
        <RevealOnScroll variant="scaleIn" className="relative">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(16,16,28,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#3b82f6" }}>
                  {dict.done_with_you.eyebrow}
                </span>
                <h4 className="font-headline mt-1 text-xl font-bold" style={{ color: "#f1f5f9" }}>
                  Cronograma de implementación
                </h4>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <span className="material-symbols-outlined text-xl" style={{ color: "#3b82f6" }}>
                  schedule
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative space-y-3">
              <div
                className="absolute left-4 top-4 w-px"
                style={{
                  height: "calc(100% - 32px)",
                  background: "linear-gradient(to bottom, #3b82f6, rgba(59,130,246,0.1))",
                }}
              />
              {TIMELINE_ITEMS.map((t, i) => (
                <motion.div
                  key={t.day}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: EASE }}
                  className="flex items-center gap-4 pl-10"
                >
                  <div
                    className="absolute left-[11px] flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background: i === 3 ? "#3b82f6" : "#0c0c16",
                      border: `2px solid ${i === 3 ? "#3b82f6" : "rgba(59,130,246,0.3)"}`,
                      boxShadow: i === 3 ? "0 0 8px rgba(59,130,246,0.5)" : "none",
                    }}
                  >
                    {i === 3 && (
                      <span className="material-symbols-outlined text-xs text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    )}
                  </div>
                  <div
                    className="flex flex-1 items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      background: i === 3 ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${i === 3 ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)"}`,
                    }}
                  >
                    <span className="font-label text-xs font-bold" style={{ color: i === 3 ? "#3b82f6" : "#64748b" }}>
                      {t.day}
                    </span>
                    <span className="text-xs" style={{ color: i === 3 ? "#93c5fd" : "#475569" }}>
                      {t.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Support badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 flex items-center gap-3 rounded-xl p-4"
              style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}
            >
              <motion.div
                animate={{ boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 12px rgba(59,130,246,0.4)", "0 0 0px rgba(59,130,246,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
              >
                <span className="material-symbols-outlined text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  support_agent
                </span>
              </motion.div>
              <div>
                <p className="text-xs font-bold" style={{ color: "#f1f5f9" }}>
                  {dict.done_with_you.support_badge}
                </p>
                <p className="text-xs" style={{ color: "#3b82f6" }}>
                  {dict.done_with_you.response_time}
                </p>
              </div>
            </motion.div>
          </div>
        </RevealOnScroll>

        {/* Copy */}
        <div>
          <RevealOnScroll>
            <span className="font-label mb-4 block text-xs uppercase tracking-widest" style={{ color: "#3b82f6" }}>
              {dict.done_with_you.eyebrow}
            </span>
            <h2
              className="font-headline mb-6 font-extrabold leading-tight tracking-tighter"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#f1f5f9" }}
            >
              {dict.done_with_you.title}
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: "#64748b" }}>
              {dict.done_with_you.description}
            </p>
          </RevealOnScroll>

          <StaggerContainer staggerDelay={0.12} className="mb-10 space-y-5">
            {dict.done_with_you.items.map((item, i) => (
              <StaggerItem key={item.title} variants={fadeUp} className="flex gap-4">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.15)",
                  }}
                >
                  <span className="material-symbols-outlined text-base" style={{ color: "#3b82f6" }}>
                    {ITEM_ICONS[i] ?? "check"}
                  </span>
                </div>
                <div>
                  <h4 className="mb-1 font-bold" style={{ color: "#e2e8f0" }}>{item.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <RevealOnScroll delay={0.2}>
            <motion.a
              href="#cta"
              whileHover={{
                scale: 1.02,
                background: "rgba(59,130,246,0.1)",
                borderColor: "rgba(59,130,246,0.3)",
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-xl px-7 py-4 font-headline text-base font-bold transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            >
              {dict.done_with_you.cta}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </motion.a>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
