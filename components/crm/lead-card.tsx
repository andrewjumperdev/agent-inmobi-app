"use client";

import { motion } from "framer-motion";
import type { Database } from "@/lib/supabase/types";
import { URGENCY_COLOR, OP_LABEL, SOURCE_ICON } from "./crm-board";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

export function LeadCard({
  lead,
  index,
  selected,
  stageColor,
  onClick,
}: {
  lead: Lead;
  index: number;
  selected: boolean;
  stageColor: string;
  onClick: () => void;
}) {
  const urg = URGENCY_COLOR[lead.urgency ?? "cold"] ?? URGENCY_COLOR.cold;
  const overdue = isOverdue(lead.next_followup_at);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      draggable
      onDragStart={(e) => {
        (e as unknown as React.DragEvent).dataTransfer.setData("lead_id", lead.id);
      }}
      onClick={onClick}
      className="rounded-xl p-3.5 cursor-pointer select-none transition-all group"
      style={{
        backgroundColor: selected ? `${stageColor}10` : "#0c0c14",
        border: selected
          ? `1px solid ${stageColor}50`
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: selected ? `0 0 0 1px ${stageColor}20` : "none",
      }}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-headline text-xs font-bold"
            style={{ backgroundColor: `${stageColor}18`, color: stageColor }}
          >
            {(lead.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-headline text-xs font-bold truncate" style={{ color: "#f1f5f9" }}>
              {lead.name ?? "Sin nombre"}
            </p>
            <p className="font-label text-[10px] truncate" style={{ color: "#334155" }}>
              {lead.zone_interest ?? lead.phone}
            </p>
          </div>
        </div>

        {/* Urgency dot */}
        {lead.urgency === "hot" && (
          <motion.span
            className="h-2 w-2 shrink-0 rounded-full mt-1"
            style={{ backgroundColor: "#ef4444" }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Chips row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Source */}
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs" style={{ color: "#334155" }}>
            {SOURCE_ICON[lead.source ?? ""] ?? "person"}
          </span>
        </div>

        {/* Operation */}
        {lead.operation_type && (
          <span
            className="rounded-full px-1.5 py-0.5 font-label text-[9px] uppercase tracking-widest"
            style={{ backgroundColor: "rgba(188,198,224,0.08)", color: "#64748b" }}
          >
            {OP_LABEL[lead.operation_type] ?? lead.operation_type}
          </span>
        )}

        {/* Urgency */}
        {lead.urgency && (
          <span
            className="rounded-full px-1.5 py-0.5 font-label text-[9px] uppercase tracking-widest"
            style={{ backgroundColor: urg.bg, color: urg.text }}
          >
            {urg.label}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5">
        {/* Budget */}
        <span className="font-label text-[10px]" style={{ color: "#334155" }}>
          {lead.budget_min
            ? `$${(lead.budget_min / 1000).toFixed(0)}k${lead.budget_max ? `–$${(lead.budget_max / 1000).toFixed(0)}k` : ""}`
            : "Sin presupuesto"}
        </span>

        {/* Followup / last contact */}
        {lead.next_followup_at ? (
          <span
            className="flex items-center gap-0.5 font-label text-[10px]"
            style={{ color: overdue ? "#ef4444" : "#334155" }}
          >
            <span className="material-symbols-outlined text-xs">
              {overdue ? "alarm" : "calendar_month"}
            </span>
            {overdue ? "Vencido" : timeAgo(lead.next_followup_at)}
          </span>
        ) : lead.last_contact_at ? (
          <span className="font-label text-[10px]" style={{ color: "#334155" }}>
            {timeAgo(lead.last_contact_at)} atrás
          </span>
        ) : (
          <span className="font-label text-[10px]" style={{ color: "#1e2a42" }}>Sin contacto</span>
        )}
      </div>
    </motion.div>
  );
}
