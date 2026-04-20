"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fadeUp, scaleIn, ParallaxBlob } from "./motion";

const AGENTS = [
  { icon: "auto_awesome", key: "agent01" as const, num: "01" },
  { icon: "campaign", key: "agent02" as const, num: "02" },
  { icon: "person_search", key: "agent03" as const, num: "03" },
  { icon: "query_stats", key: "agent04" as const, num: "04" },
];

export function HeroSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-24">
      {/* Parallax ambient blobs */}
      <ParallaxBlob className="pointer-events-none absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-lp-accent/5 blur-[120px]" />
      <ParallaxBlob className="pointer-events-none absolute bottom-[10%] -right-[10%] h-[30%] w-[30%] rounded-full bg-lp-text/5 blur-[100px]" />

      {/* Animated grid lines */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#bcff5f 1px, transparent 1px), linear-gradient(90deg, #bcff5f 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Copy */}
        <div className="lg:col-span-7">
          <motion.span
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="font-label mb-4 block text-xs uppercase tracking-widest text-lp-accent"
          >
            {dict.hero.eyebrow}
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className="font-headline mb-6 text-5xl font-extrabold leading-tight tracking-tighter text-lp-text md:text-7xl"
          >
            {[dict.hero.headline1, dict.hero.headline2, dict.hero.headline3].map(
              (line, i) => (
                <motion.span
                  key={i}
                  variants={fadeUp}
                  custom={0}
                  className={`block ${i === 1 ? "bg-gradient-to-r from-lp-accent to-lp-accent-dim bg-clip-text text-transparent" : ""}`}
                >
                  {line}
                </motion.span>
              )
            )}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.45}
            variants={fadeUp}
            className="mb-10 max-w-2xl text-lg leading-relaxed text-lp-muted md:text-xl"
          >
            {dict.hero.description}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } },
            }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <motion.a
              variants={scaleIn}
              href="#cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-lp-accent to-lp-accent-dim px-8 py-4 font-headline text-lg font-bold text-lp-accent-on shadow-[0_0_30px_rgba(188,255,95,0.25)]"
            >
              {dict.hero.cta_primary}
              <span className="material-symbols-outlined text-xl">
                rocket_launch
              </span>
            </motion.a>
            <motion.a
              variants={scaleIn}
              href="#comparison"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-md border border-lp-border px-8 py-4 font-headline text-lg font-bold text-lp-text transition-colors hover:bg-lp-surface-highest/40"
            >
              {dict.hero.cta_secondary}
            </motion.a>
          </motion.div>
        </div>

        {/* Agent cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
          }}
          className="lg:col-span-5"
        >
          <div className="grid grid-cols-2 gap-4">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.key}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    y: i % 2 === 0 ? 32 : 0,
                    scale: 1,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{
                  y: i % 2 === 0 ? 28 : -4,
                  boxShadow: "0 0 24px rgba(188,255,95,0.15)",
                  borderColor: "rgba(188,255,95,0.3)",
                  transition: { duration: 0.3 },
                }}
                className="rounded-xl border border-lp-accent/10 bg-lp-surface/60 p-6 backdrop-blur-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lp-accent/10">
                  <span
                    className="material-symbols-outlined text-lp-accent"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {agent.icon}
                  </span>
                </div>
                <span className="font-label mb-1 block text-[10px] uppercase tracking-widest text-lp-accent">
                  AGENT {agent.num}
                </span>
                <h3 className="font-headline text-sm font-bold uppercase text-white">
                  {dict.agents[agent.key]}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
