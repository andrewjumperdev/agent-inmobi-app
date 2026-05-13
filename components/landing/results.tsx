"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem, fadeUp } from "./motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ResultsSection({ dict }: { dict: Dictionary }) {
  return (
    <section id="results" className="px-6 py-24" style={{ background: "#08080f" }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <RevealOnScroll className="mb-16 text-center">
          <span className="font-label mb-4 block text-xs uppercase tracking-widest" style={{ color: "#3b82f6" }}>
            {dict.results.eyebrow}
          </span>
          <h2
            className="font-headline font-extrabold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#f1f5f9" }}
          >
            {dict.results.title}
          </h2>
        </RevealOnScroll>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Before / After table */}
          <RevealOnScroll variant="fadeIn" className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Table header */}
            <div
              className="grid grid-cols-3 gap-px text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="py-4 px-3" style={{ background: "#0c0c16" }}>
                <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
                  Métrica
                </span>
              </div>
              <div className="py-4 px-3" style={{ background: "#0c0c16" }}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500/50" />
                  <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#ef4444" }}>
                    {dict.results.before_label}
                  </span>
                </div>
              </div>
              <div className="py-4 px-3" style={{ background: "#0c0c16" }}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#3b82f6" }}>
                    {dict.results.after_label}
                  </span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {dict.results.items.map((row, i) => (
              <motion.div
                key={row.metric}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: EASE }}
                className="grid grid-cols-3 gap-px"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="flex items-center px-4 py-4"
                  style={{ background: "#09090f" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                    {row.metric}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center px-3 py-4"
                  style={{ background: "#09090f" }}
                >
                  <span
                    className="rounded-md px-2 py-1 font-label text-xs font-bold"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                  >
                    {row.before}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center px-3 py-4"
                  style={{ background: "#09090f" }}
                >
                  <span
                    className="rounded-md px-2 py-1 font-label text-xs font-bold"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                  >
                    {row.after}
                  </span>
                </div>
              </motion.div>
            ))}
          </RevealOnScroll>

          {/* Testimonial */}
          <RevealOnScroll variant="scaleIn" className="flex flex-col justify-center">
            <motion.div
              whileHover={{ borderColor: "rgba(59,130,246,0.2)", transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-8"
              style={{
                background: "rgba(59,130,246,0.03)",
                border: "1px solid rgba(59,130,246,0.1)",
              }}
            >
              {/* Quote mark */}
              <div
                className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <span className="font-headline text-2xl font-black leading-none" style={{ color: "#3b82f6" }}>
                  "
                </span>
              </div>

              <blockquote
                className="mb-8 text-lg leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                {dict.results.testimonial}
              </blockquote>

              <div className="flex items-center gap-4">
                {/* Avatar placeholder */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full font-headline text-lg font-bold"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "#fff",
                  }}
                >
                  {dict.results.testimonial_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#f1f5f9" }}>
                    {dict.results.testimonial_name}
                  </p>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    {dict.results.testimonial_role}
                  </p>
                </div>
                {/* RE/MAX logo placeholder */}
                <div className="ml-auto">
                  <div
                    className="rounded-lg px-3 py-1.5 font-label text-[10px] uppercase tracking-widest"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#334155" }}
                  >
                    RE MAX
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="mt-5 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-base"
                    style={{ color: "#f59e0b", fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
                <span className="ml-2 font-label text-[10px] uppercase tracking-widest" style={{ color: "#475569" }}>
                  +40% cierres · Primer mes
                </span>
              </div>
            </motion.div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
