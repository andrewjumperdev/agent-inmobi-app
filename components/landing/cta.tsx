"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll } from "./motion";

export function CTASection({ dict }: { dict: Dictionary }) {
  return (
    <section id="cta" className="px-6 py-24 text-center">
      <RevealOnScroll variant="scaleIn">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-lp-accent/20 bg-lp-surface/60 p-12 backdrop-blur-md md:p-16">
          {/* Animated corner glow */}
          <motion.div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-lp-accent/10 blur-3xl"
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-lp-accent/5 blur-3xl"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <h2 className="font-headline mb-6 text-4xl font-extrabold uppercase tracking-tight text-lp-text">
            {dict.cta_final.title}
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-lp-muted">
            {dict.cta_final.description}
          </p>

          <motion.a
            href="/login"
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 40px rgba(188,255,95,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            className="inline-block rounded-md bg-lp-accent px-10 py-5 font-headline text-xl font-black uppercase tracking-tighter text-lp-accent-on shadow-[0_0_20px_rgba(188,255,95,0.3)]"
          >
            {dict.cta_final.cta}
          </motion.a>

          <p className="mt-6 font-label text-xs uppercase tracking-widest text-lp-outline">
            {dict.cta_final.disclaimer}
          </p>
        </div>
      </RevealOnScroll>
    </section>
  );
}
