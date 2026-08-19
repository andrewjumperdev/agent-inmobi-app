"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, X, Loader2, Inbox } from "lucide-react";
import type { EscalationOut } from "@/lib/kore/client";

const REASON: Record<string, { label: string; color: string }> = {
  price_signal:         { label: "Pregunta precio",      color: "var(--success)" },
  close_ready:          { label: "Listo para cerrar",    color: "var(--success)" },
  proposal_review:      { label: "Propuesta a revisar",  color: "var(--info)" },
  content_review:       { label: "Contenido a revisar",  color: "var(--ai)" },
  cannot_classify:      { label: "No se pudo clasificar",color: "var(--warning)" },
  pipeline_stale:       { label: "Pipeline sin avance",  color: "var(--warning)" },
  overcontacted:        { label: "Contactado de más",    color: "var(--warning)" },
  tech_block:           { label: "Bloqueo técnico",      color: "var(--destructive)" },
  payment_confirmation: { label: "Confirmar pago",       color: "var(--info)" },
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "recién";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}


/* ── Detalle de la escalación ─────────────────────────────────────────
 * El resumen ejecutivo alcanza para triar, no para decidir. La propuesta y los
 * borradores de contenido viajan enteros en `payload`, así que se muestran acá
 * en vez de obligar a abrir la base para leerlos.
 *
 * Se colapsa por defecto: la cola se recorre de arriba abajo y cinco propuestas
 * desplegadas la vuelven ilegible. */
function Detalle({ payload }: { payload: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);

  const proposal = payload?.proposal as Record<string, unknown> | undefined;
  const drafts = payload?.drafts as unknown[] | undefined;
  const hasDetail = Boolean(proposal || drafts?.length);
  if (!hasDetail) return null;

  return (
    <div className="mt-3 border-t border-app-border pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 font-label text-[9.5px] font-semibold uppercase tracking-wider text-info transition-opacity hover:opacity-80"
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {open ? "Ocultar" : proposal ? "Ver la propuesta" : "Ver los borradores"}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {proposal &&
            Object.entries(proposal)
              .filter(([, v]) => v !== null && v !== "" && typeof v !== "object")
              .map(([k, v]) => (
                <div key={k}>
                  <p className="font-label text-[9px] uppercase tracking-[0.16em] text-app-label">
                    {k.replace(/_/g, " ")}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap font-headline text-[13px] leading-relaxed text-foreground">
                    {String(v)}
                  </p>
                </div>
              ))}

          {drafts?.map((d, i) => (
            <div key={i} className="rounded-xl bg-app-surface-hover p-3">
              <p className="whitespace-pre-wrap font-headline text-[13px] leading-relaxed text-foreground">
                {typeof d === "string" ? d : JSON.stringify(d, null, 2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EscalationsQueue({ items: initial }: { items: EscalationOut[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function resolve(id: string, status: "resolved" | "dismissed") {
    setBusy(id);
    const res = await fetch(`/api/seguimiento/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      setItems((xs) => xs.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success/10">
          <Inbox size={22} className="text-success" aria-hidden />
        </span>
        <div>
          <p className="font-headline text-lg font-extrabold tracking-[-0.02em] text-foreground">
            La cola está vacía
          </p>
          <p className="mt-1 font-headline text-[13px] text-muted-foreground">
            No hay nada esperando una decisión tuya. Los agentes están atendiendo solos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 p-4 md:p-7">
      <p className="font-headline text-[13px] text-muted-foreground">
        {items.length} {items.length === 1 ? "caso requiere" : "casos requieren"} tu
        atención. Los agentes prepararon cada uno; falta que decidas vos.
      </p>
      <AnimatePresence>
        {items.map((e) => {
          const r = REASON[e.reason] ?? { label: e.reason, color: "var(--muted-foreground)" };
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-app-border bg-app-surface p-[18px] transition-colors hover:bg-app-surface-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 font-label text-[9.5px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${r.color} 13%, transparent)`,
                        color: r.color,
                      }}
                    >
                      {r.label}
                    </span>
                    <span className="font-headline text-[11px] text-muted-foreground">{timeAgo(e.created_at)}</span>
                  </div>
                  <p className="font-headline text-[13.5px] font-bold text-foreground">{e.title}</p>
                  {e.executive_summary && (
                    <p className="mt-1 font-headline text-[13px] leading-relaxed text-muted-foreground">
                      {e.executive_summary}
                    </p>
                  )}
                  <Detalle payload={e.payload} />
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => resolve(e.id, "resolved")}
                    disabled={busy === e.id}
                    title="Resuelto" aria-label="Marcar como resuelto"
                    className="flex size-9 items-center justify-center rounded-[9px] transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ backgroundColor: "color-mix(in oklab, var(--success) 12%, transparent)", color: "var(--success)" }}
                  >
                    {busy === e.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={() => resolve(e.id, "dismissed")}
                    disabled={busy === e.id}
                    title="Descartar" aria-label="Descartar"
                    className="flex size-9 items-center justify-center rounded-[9px] transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ backgroundColor: "color-mix(in oklab, var(--destructive) 10%, transparent)", color: "var(--destructive)" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
