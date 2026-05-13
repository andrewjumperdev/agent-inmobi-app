"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll } from "./motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEP_ICONS = [
  "arrow_downward",
  "smart_toy",
  "verified_user",
  "calendar_month",
  "notifications_active",
];

export function HowItWorksSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="solution" className="px-6 py-24" style={{ background: "#08080f" }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <RevealOnScroll className="mb-16 text-center">
          <span className="font-label mb-4 block text-xs uppercase tracking-widest" style={{ color: "#3b82f6" }}>
            {dict.solution.eyebrow}
          </span>
          <h2
            className="font-headline mb-4 font-extrabold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#f1f5f9" }}
          >
            {dict.solution.title}
          </h2>
          <p className="mx-auto max-w-xl text-lg" style={{ color: "#64748b" }}>
            {dict.solution.subtitle}
          </p>
        </RevealOnScroll>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[27px] top-8 hidden w-px md:block"
            style={{
              height: "calc(100% - 64px)",
              background: "linear-gradient(to bottom, rgba(59,130,246,0.4), rgba(59,130,246,0.05))",
            }}
          />

          <div className="space-y-4">
            {dict.solution.steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
                className="group flex items-start gap-6"
              >
                {/* Step number circle */}
                <div className="relative shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl font-headline text-lg font-black"
                    style={{
                      background: i === 4
                        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                        : "rgba(59,130,246,0.08)",
                      border: i === 4
                        ? "none"
                        : "1px solid rgba(59,130,246,0.2)",
                      color: i === 4 ? "#fff" : "#3b82f6",
                      boxShadow: i === 4 ? "0 0 20px rgba(59,130,246,0.3)" : "none",
                    }}
                  >
                    {step.num}
                  </motion.div>
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{
                    borderColor: "rgba(59,130,246,0.2)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                    transition: { duration: 0.2 },
                  }}
                  className="flex-1 rounded-2xl p-6 transition-all"
                  style={{
                    background: i === 4
                      ? "rgba(59,130,246,0.04)"
                      : "rgba(16,16,28,0.5)",
                    border: i === 4
                      ? "1px solid rgba(59,130,246,0.15)"
                      : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(59,130,246,0.08)",
                        border: "1px solid rgba(59,130,246,0.15)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-base"
                        style={{ color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}
                      >
                        {STEP_ICONS[i]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline mb-1.5 text-lg font-bold" style={{ color: "#f1f5f9" }}>
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
