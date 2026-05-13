"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem, fadeUp } from "./motion";

export function ComparisonSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="comparison" className="px-6 py-24" style={{ background: "#060609" }}>
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="mb-16 text-center">
          <h2
            className="font-headline mb-3 font-extrabold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", color: "#f1f5f9" }}
          >
            {dict.comparison.title}
          </h2>
          <p className="text-base" style={{ color: "#475569" }}>
            {dict.comparison.subtitle}
          </p>
        </RevealOnScroll>

        <div
          className="grid overflow-hidden rounded-2xl md:grid-cols-2"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Without automation */}
          <RevealOnScroll variant="fadeIn" delay={0.05} className="p-8 md:p-10" style={{ background: "#0a0a12" }}>
            <div className="mb-8 flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: "#ef4444", fontVariationSettings: "'FILL' 1" }}
                >
                  close
                </span>
              </div>
              <h3 className="font-headline text-lg font-bold" style={{ color: "#64748b" }}>
                {dict.comparison.old_title}
              </h3>
            </div>

            <StaggerContainer staggerDelay={0.08} className="space-y-4">
              {dict.comparison.old_items.map((item) => (
                <StaggerItem key={item} variants={fadeUp} className="flex gap-3">
                  <span
                    className="material-symbols-outlined mt-0.5 shrink-0 text-base"
                    style={{ color: "#334155" }}
                  >
                    remove
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                    {item}
                  </span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>

          {/* With KORE AI */}
          <RevealOnScroll
            variant="fadeIn"
            delay={0.15}
            className="relative overflow-hidden p-8 md:p-10"
            style={{ background: "#0c0c18" }}
          >
            {/* Accent glow */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full blur-3xl"
              style={{ background: "rgba(59,130,246,0.06)" }}
            />

            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold" style={{ color: "#93c5fd" }}>
                  {dict.comparison.new_title}
                </h3>
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring" }}
                className="rounded-full px-3 py-1 font-label text-[9px] uppercase tracking-widest"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#3b82f6",
                }}
              >
                {dict.comparison.new_badge}
              </motion.span>
            </div>

            <StaggerContainer staggerDelay={0.08} className="space-y-4">
              {dict.comparison.new_items.map((item) => (
                <StaggerItem key={item} variants={fadeUp} className="flex gap-3">
                  <span
                    className="material-symbols-outlined mt-0.5 shrink-0 text-base"
                    style={{ color: "#3b82f6" }}
                  >
                    check
                  </span>
                  <span className="text-sm font-medium leading-relaxed" style={{ color: "#e2e8f0" }}>
                    {item}
                  </span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
