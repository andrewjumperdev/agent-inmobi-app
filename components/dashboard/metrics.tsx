"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, MessageSquare, Target, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

type Metric = {
  label: string;
  value: string;
  trend: number; // porcentaje vs semana anterior
  icon: React.ElementType;
  color: "success" | "ai" | "warning" | "info";
};

// En producción: datos reales de Supabase
const METRICS: Metric[] = [
  {
    label: "Leads totales",
    value: "12",
    trend: 40,
    icon: Users,
    color: "info",
  },
  {
    label: "Conversaciones IA",
    value: "8",
    trend: 60,
    icon: MessageSquare,
    color: "ai",
  },
  {
    label: "Leads calificados",
    value: "3",
    trend: -25,
    icon: Target,
    color: "warning",
  },
  {
    label: "Cierres este mes",
    value: "1",
    trend: 0,
    icon: DollarSign,
    color: "success",
  },
];

const COLOR_MAP = {
  success: {
    bg: "var(--success-muted)",
    icon: "var(--success)",
    badge: "var(--success)",
  },
  ai: {
    bg: "var(--ai-muted)",
    icon: "var(--ai)",
    badge: "var(--ai)",
  },
  warning: {
    bg: "var(--warning-muted)",
    icon: "var(--warning)",
    badge: "var(--warning)",
  },
  info: {
    bg: "var(--info-muted)",
    icon: "var(--info)",
    badge: "var(--info)",
  },
};

export function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((metric, i) => {
        const colors = COLOR_MAP[metric.color];
        const positive = metric.trend > 0;
        const neutral = metric.trend === 0;

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: EASE }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
          >
            {/* Icon */}
            <div
              className="flex size-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.bg }}
            >
              <metric.icon
                className="size-4"
                style={{ color: colors.icon }}
              />
            </div>

            {/* Value */}
            <div className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {metric.value}
              </p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1.5">
              {neutral ? (
                <span className="text-xs text-muted-foreground">Sin cambios</span>
              ) : (
                <>
                  {positive ? (
                    <TrendingUp className="size-3.5 text-success" />
                  ) : (
                    <TrendingDown className="size-3.5 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      positive ? "text-success" : "text-destructive"
                    )}
                  >
                    {positive ? "+" : ""}
                    {metric.trend}% vs semana pasada
                  </span>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
