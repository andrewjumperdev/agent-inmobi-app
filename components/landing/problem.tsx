"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem } from "./motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ICON_COLORS = ["#ef4444", "#f59e0b", "#f97316", "#8b5cf6"];

export function ProblemSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="problem" className="px-6 py-24" style={{ background: "#060609" }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <RevealOnScroll className="mb-16 max-w-2xl">
          <span className="font-label mb-4 block text-xs uppercase tracking-widest" style={{ color: "#ef4444" }}>
            {dict.problem.eyebrow}
          </span>
          <h2
            className="font-headline mb-4 font-extrabold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#f1f5f9" }}
          >
            {dict.problem.title}
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#64748b" }}>
            {dict.problem.subtitle}
          </p>
        </RevealOnScroll>

        {/* Pain cards */}
        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {dict.problem.items.map((item, i) => (
            <StaggerItem
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
            >
              <motion.div
                whileHover={{
                  y: -4,
                  borderColor: `${ICON_COLORS[i]}30`,
                  transition: { duration: 0.2 },
                }}
                className="group relative h-full rounded-2xl p-6 transition-colors"
                style={{
                  background: "rgba(16,16,28,0.6)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Top: stat + icon */}
                <div className="mb-6 flex items-start justify-between">
                  <span
                    className="font-headline text-5xl font-black leading-none"
                    style={{ color: `${ICON_COLORS[i]}50` }}
                  >
                    {item.stat}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${ICON_COLORS[i]}10`,
                      border: `1px solid ${ICON_COLORS[i]}20`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ color: ICON_COLORS[i], fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </span>
                  </div>
                </div>

                {/* Title + desc */}
                <h3
                  className="font-headline mb-2 text-base font-bold"
                  style={{ color: "#e2e8f0" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                  {item.desc}
                </p>

                {/* Subtle bottom accent */}
                <motion.div
                  className="absolute bottom-0 left-6 right-6 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${ICON_COLORS[i]}30, transparent)` }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.4 }}
                />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
