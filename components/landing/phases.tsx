"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll } from "./motion";

export function PhasesSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="phases" className="bg-lp-bg px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <span className="font-label mb-2 block text-xs uppercase tracking-widest text-lp-accent">
              {dict.phases.eyebrow}
            </span>
            <h2 className="font-headline text-4xl font-extrabold uppercase tracking-tighter text-lp-text">
              {dict.phases.title}
            </h2>
          </div>
          <p className="max-w-md text-lp-muted">{dict.phases.subtitle}</p>
        </RevealOnScroll>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
          className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6"
        >
          {dict.phases.items.map((phase, i) => {
            const num = String(i + 1).padStart(2, "0");
            const isHighlight = i === 2;
            const isLast = i === 6;
            const colSpan = isLast
              ? "md:col-span-4 lg:col-span-6"
              : i < 3
                ? "md:col-span-2 lg:col-span-2"
                : "md:col-span-3 lg:col-span-3";

            return (
              <motion.div
                key={num}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{
                  y: -4,
                  boxShadow: isHighlight
                    ? "0 0 32px rgba(188,255,95,0.15)"
                    : "0 4px 24px rgba(0,0,0,0.3)",
                  transition: { duration: 0.25 },
                }}
                className={`${colSpan} rounded-xl border p-8 ${
                  isHighlight
                    ? "border-lp-accent/20 bg-lp-surface-high"
                    : isLast
                      ? "border-lp-accent/30 bg-gradient-to-br from-lp-accent/10 to-transparent"
                      : "border-lp-border/10 bg-lp-surface"
                }`}
              >
                <span
                  className={`font-label mb-6 block text-4xl font-black text-lp-accent ${
                    isLast ? "opacity-100" : isHighlight ? "opacity-40" : "opacity-20"
                  }`}
                >
                  {num}
                </span>
                <h4
                  className={`font-headline mb-3 text-xl font-bold ${
                    isHighlight ? "text-lp-accent" : "text-lp-text"
                  }`}
                >
                  {phase.title}
                </h4>
                <p className="text-sm text-lp-muted">{phase.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
