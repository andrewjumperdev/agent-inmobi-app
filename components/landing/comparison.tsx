"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem, fadeUp } from "./motion";

export function ComparisonSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="comparison" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="mb-16 text-center">
          <h2 className="font-headline mb-4 text-4xl font-extrabold uppercase tracking-tight text-lp-text">
            {dict.comparison.title}
          </h2>
          <p className="text-lp-muted">{dict.comparison.subtitle}</p>
        </RevealOnScroll>

        <div className="grid overflow-hidden rounded-2xl border border-lp-border/20 bg-lp-border/20 md:grid-cols-2">
          {/* Old way */}
          <RevealOnScroll variant="fadeIn" delay={0.1} className="bg-lp-bg p-10 md:p-12">
            <h3 className="font-headline mb-8 flex items-center gap-3 text-2xl font-bold text-lp-text">
              <span className="material-symbols-outlined text-red-400">cancel</span>
              {dict.comparison.old_title}
            </h3>
            <StaggerContainer staggerDelay={0.08} className="space-y-6">
              {dict.comparison.old_items.map((item) => (
                <StaggerItem key={item} variants={fadeUp} className="flex gap-4">
                  <span className="material-symbols-outlined text-lp-outline">remove</span>
                  <span className="text-lp-muted">{item}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>

          {/* New way */}
          <RevealOnScroll variant="fadeIn" delay={0.2} className="relative overflow-hidden bg-lp-surface-low p-10 md:p-12">
            {/* Glow accent */}
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-lp-accent/5 blur-3xl" />
            <div className="absolute right-4 top-4">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring" }}
                className="rounded-full border border-lp-accent/20 bg-lp-accent/10 px-3 py-1 font-label text-[10px] uppercase tracking-widest text-lp-accent"
              >
                {dict.comparison.new_badge}
              </motion.span>
            </div>
            <h3 className="font-headline mb-8 flex items-center gap-3 text-2xl font-bold text-lp-accent">
              <span className="material-symbols-outlined">check_circle</span>
              {dict.comparison.new_title}
            </h3>
            <StaggerContainer staggerDelay={0.08} className="space-y-6">
              {dict.comparison.new_items.map((item) => (
                <StaggerItem key={item} variants={fadeUp} className="flex gap-4">
                  <span className="material-symbols-outlined text-lp-accent">add</span>
                  <span className="font-semibold text-lp-text">{item}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
