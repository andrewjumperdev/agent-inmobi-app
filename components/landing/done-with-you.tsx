"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem, fadeUp } from "./motion";

const ITEM_ICONS = ["hub", "settings_suggest"];

export function DoneWithYouSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="done-with-you" className="px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Visual */}
        <RevealOnScroll variant="scaleIn" className="relative aspect-video overflow-hidden rounded-2xl border border-lp-border/20 shadow-2xl">
          <div className="flex h-full w-full items-center justify-center bg-lp-surface">
            {/* Animated placeholder — swap for real screenshot */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4"
            >
              <span className="material-symbols-outlined text-6xl text-lp-accent">
                monitor
              </span>
              <span className="font-label text-xs uppercase tracking-widest text-lp-muted">
                Executive Dashboard
              </span>
            </motion.div>
          </div>
          {/* Scan line effect */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 h-px bg-lp-accent/30"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lp-bg to-transparent" />

          {/* Support badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <div className="flex items-center gap-4 rounded-lg bg-lp-surface/70 p-4 backdrop-blur-md border border-lp-accent/10">
              <motion.div
                animate={{ boxShadow: ["0 0 0px rgba(188,255,95,0)", "0 0 12px rgba(188,255,95,0.5)", "0 0 0px rgba(188,255,95,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-lp-accent"
              >
                <span className="material-symbols-outlined text-lp-accent-on">
                  support_agent
                </span>
              </motion.div>
              <div>
                <p className="text-sm font-bold text-white">
                  {dict.done_with_you.support_badge}
                </p>
                <p className="text-xs text-lp-accent">
                  {dict.done_with_you.response_time}
                </p>
              </div>
            </div>
          </motion.div>
        </RevealOnScroll>

        {/* Copy */}
        <div>
          <RevealOnScroll>
            <h2 className="font-headline mb-6 text-4xl font-extrabold uppercase tracking-tight text-lp-text">
              {dict.done_with_you.title}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-lp-muted">
              {dict.done_with_you.description}
            </p>
          </RevealOnScroll>

          <StaggerContainer staggerDelay={0.12} className="space-y-6">
            {dict.done_with_you.items.map((item, i) => (
              <StaggerItem key={item.title} variants={fadeUp} className="flex gap-4">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-lp-accent/20">
                  <span className="material-symbols-outlined text-sm text-lp-accent">
                    {ITEM_ICONS[i] ?? "check"}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lp-text">{item.title}</h4>
                  <p className="text-sm text-lp-muted">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <RevealOnScroll delay={0.3}>
            <motion.a
              href="#cta"
              whileHover={{ scale: 1.02, backgroundColor: "#31394d" }}
              whileTap={{ scale: 0.98 }}
              className="mt-10 inline-block rounded-md bg-lp-surface-highest px-8 py-4 font-headline font-bold text-white"
            >
              {dict.done_with_you.cta}
            </motion.a>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
