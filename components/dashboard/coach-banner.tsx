"use client";

import { motion } from "framer-motion";
import { BotMessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

// En producción: server component que lee el estado del usuario
// y decide qué mensaje mostrar.
const COACH_STATE = {
  message: "Conectá WhatsApp para activar la captación automática de leads.",
  cta: { label: "Conectar ahora", href: "/captacion" },
};

export function CoachBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor: "var(--ai-muted)",
        background:
          "linear-gradient(135deg, var(--ai-muted) 0%, var(--background) 100%)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "var(--ai)", color: "var(--ai-foreground)" }}
        >
          <BotMessageSquare className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Coach IA — Próximo paso
          </p>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {COACH_STATE.message}
          </p>
        </div>
      </div>

      <Link
        href={COACH_STATE.cta.href}
        className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] hover:opacity-90"
        style={{
          backgroundColor: "var(--ai)",
          color: "var(--ai-foreground)",
        }}
      >
        {COACH_STATE.cta.label}
        <ArrowRight className="size-3.5" />
      </Link>
    </motion.div>
  );
}
