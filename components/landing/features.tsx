"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem } from "./motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FeaturesSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="features" className="px-6 py-24" style={{ background: "#060609" }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <RevealOnScroll className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-label mb-4 block text-xs uppercase tracking-widest" style={{ color: "#3b82f6" }}>
              {dict.features.eyebrow}
            </span>
            <h2
              className="font-headline font-extrabold leading-tight tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#f1f5f9" }}
            >
              {dict.features.title}
            </h2>
          </div>
          <p className="max-w-xs text-base md:text-right" style={{ color: "#64748b" }}>
            {dict.features.subtitle}
          </p>
        </RevealOnScroll>

        {/* Feature grid */}
        <StaggerContainer
          staggerDelay={0.08}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {dict.features.items.map((feature, i) => {
            const isPopular = feature.badge === "Popular" || feature.badge === "Populaire";
            const isNew = feature.badge === "New" || feature.badge === "Nuevo" || feature.badge === "Nouveau";
            const hasBadge = isPopular || isNew;

            return (
              <StaggerItem
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
              >
                <motion.div
                  whileHover={{
                    y: -4,
                    borderColor: isPopular ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.1)",
                    boxShadow: isPopular
                      ? "0 8px 32px rgba(59,130,246,0.1)"
                      : "0 8px 24px rgba(0,0,0,0.3)",
                    transition: { duration: 0.2 },
                  }}
                  className="relative h-full rounded-2xl p-6"
                  style={{
                    background: isPopular
                      ? "rgba(59,130,246,0.04)"
                      : "rgba(16,16,28,0.6)",
                    border: isPopular
                      ? "1px solid rgba(59,130,246,0.2)"
                      : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Badge */}
                  {hasBadge && (
                    <div className="absolute right-4 top-4">
                      <span
                        className="rounded-full px-2.5 py-1 font-label text-[9px] uppercase tracking-widest"
                        style={{
                          background: isPopular ? "rgba(59,130,246,0.15)" : "rgba(34,197,94,0.1)",
                          color: isPopular ? "#93c5fd" : "#4ade80",
                          border: `1px solid ${isPopular ? "rgba(59,130,246,0.25)" : "rgba(34,197,94,0.2)"}`,
                        }}
                      >
                        {feature.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: isPopular ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isPopular ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{
                        color: isPopular ? "#3b82f6" : "#475569",
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      {feature.icon}
                    </span>
                  </div>

                  <h3
                    className="font-headline mb-2 text-base font-bold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                    {feature.desc}
                  </p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
