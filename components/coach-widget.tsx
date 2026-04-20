"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotMessageSquare, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

// Mensaje dinámico del Coach — en producción esto viene del servidor
// según el estado del usuario (onboarding completado, leads activos, etc.)
const COACH_MESSAGE = {
  title: "Tu próximo paso",
  body: "Conectá WhatsApp para activar la captación automática de leads. Tarda menos de 2 minutos.",
  cta: {
    label: "Conectar WhatsApp",
    href: "/captacion",
  },
};

export function CoachWidget() {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Panel expandido */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn(
              "w-72 rounded-2xl border shadow-xl",
              "border-[var(--ai)]/20 bg-card"
            )}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between rounded-t-2xl px-4 py-3"
              style={{ backgroundColor: "var(--ai-muted)" }}
            >
              <div className="flex items-center gap-2">
                <BotMessageSquare
                  className="size-4"
                  style={{ color: "var(--ai)" }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--ai)" }}
                >
                  Coach IA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">
                  {COACH_MESSAGE.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {COACH_MESSAGE.body}
                </p>
              </div>

              <a
                href={COACH_MESSAGE.cta.href}
                className="flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--ai)",
                  color: "var(--ai-foreground)",
                }}
              >
                {COACH_MESSAGE.cta.label}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
        style={{
          backgroundColor: "var(--ai)",
          color: "var(--ai-foreground)",
        }}
        whileHover={{ scale: 1.05 }}
        aria-label="Abrir Coach IA"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <BotMessageSquare className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
