"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ContentFormat,
  ContentPillar,
  PiezaGuardada,
  FORMAT_LABELS,
  FORMAT_ICONS,
  PILLAR_LABELS,
  PILLAR_COLORS,
  PILLAR_DESCRIPTIONS,
} from "./types";

/* ── Helpers ───────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2);
}

/* ── Selector de formato ───────────────────────────────────── */
function FormatSelector({
  value,
  onChange,
}: {
  value: ContentFormat;
  onChange: (v: ContentFormat) => void;
}) {
  const formats: ContentFormat[] = ["reel", "carrusel", "historia", "post"];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {formats.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all"
            style={{
              borderColor: active
                ? "rgba(59,130,246,0.5)"
                : "rgba(255,255,255,0.10)",
              backgroundColor: active
                ? "rgba(59,130,246,0.07)"
                : "#10101c",
              color: active ? "#3b82f6" : "#64748b",
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {FORMAT_ICONS[f]}
            </span>
            <span className="font-label text-xs uppercase tracking-widest">
              {FORMAT_LABELS[f]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Selector de pilar ─────────────────────────────────────── */
function PillarSelector({
  value,
  onChange,
}: {
  value: ContentPillar;
  onChange: (v: ContentPillar) => void;
}) {
  const pillars: ContentPillar[] = [
    "autoridad",
    "conversion",
    "confianza",
    "atraccion",
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {pillars.map((p) => {
        const active = value === p;
        const color = PILLAR_COLORS[p];
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
            style={{
              borderColor: active
                ? `${color}60`
                : "rgba(255,255,255,0.10)",
              backgroundColor: active ? `${color}10` : "#10101c",
            }}
          >
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div>
              <p
                className="font-label text-xs font-bold uppercase tracking-widest"
                style={{ color: active ? color : "#f1f5f9" }}
              >
                {PILLAR_LABELS[p]}
              </p>
              <p
                className="mt-0.5 text-[11px] leading-snug"
                style={{ color: "#64748b" }}
              >
                {PILLAR_DESCRIPTIONS[p]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Output card ───────────────────────────────────────────── */
function OutputCard({
  content,
  streaming,
  format,
  pillar,
  onGuardar,
}: {
  content: string;
  streaming: boolean;
  format: ContentFormat;
  pillar: ContentPillar;
  onGuardar: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border"
      style={{
        borderColor: "rgba(59,130,246,0.2)",
        backgroundColor: "#080812",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ backgroundColor: "rgba(59,130,246,0.12)" }}
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ color: "#3b82f6", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <span
            className="font-label text-xs uppercase tracking-widest"
            style={{ color: "#3b82f6" }}
          >
            {FORMAT_LABELS[format]} · {PILLAR_LABELS[pillar]}
          </span>
          {streaming && (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: "#3b82f6" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {!streaming && content && (
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-label text-xs uppercase tracking-widest transition-all"
              style={{
                borderColor: copied
                  ? "rgba(34,197,94,0.4)"
                  : "rgba(255,255,255,0.10)",
                backgroundColor: copied
                  ? "rgba(34,197,94,0.08)"
                  : "transparent",
                color: copied ? "#22c55e" : "#64748b",
              }}
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button
              onClick={onGuardar}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-label text-xs uppercase tracking-widest transition-all"
              style={{
                borderColor: "rgba(59,130,246,0.3)",
                backgroundColor: "rgba(59,130,246,0.07)",
                color: "#3b82f6",
              }}
            >
              <span className="material-symbols-outlined text-sm">
                bookmark_add
              </span>
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <pre
          className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
          style={{ color: "#f1f5f9" }}
        >
          {content}
          {streaming && (
            <motion.span
              className="ml-0.5 inline-block h-4 w-0.5 rounded-full align-middle"
              style={{ backgroundColor: "#3b82f6" }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          )}
        </pre>
      </div>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export function Generador({
  onGuardar,
}: {
  onGuardar: (pieza: PiezaGuardada) => void;
}) {
  const [format, setFormat] = useState<ContentFormat>("reel");
  const [pillar, setPillar] = useState<ContentPillar>("autoridad");
  const [context, setContext] = useState("");
  const [zona, setZona] = useState("");

  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [generated, setGenerated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (streaming) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setOutput("");
    setStreaming(true);
    setGenerated(false);

    try {
      const res = await fetch("/api/contenido/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, pillar, context, zona }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const { text } = JSON.parse(payload) as { text: string };
            setOutput((prev) => prev + text);
          } catch {}
        }
      }

      setGenerated(true);
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setOutput("Error al generar el contenido. Intentá de nuevo.");
      }
    } finally {
      setStreaming(false);
    }
  }, [format, pillar, context, zona, streaming]);

  function handleGuardar() {
    onGuardar({
      id: uid(),
      format,
      pillar,
      context,
      zona,
      content: output,
      createdAt: new Date(),
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2
          className="font-headline text-xl font-bold"
          style={{ color: "#f1f5f9" }}
        >
          Agente de Contenido
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
          Generá publicaciones para redes sociales adaptadas a tu mercado y
          propiedades.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Formato */}
        <div>
          <label
            className="mb-2 block font-label text-xs uppercase tracking-widest"
            style={{ color: "#64748b" }}
          >
            Formato
          </label>
          <FormatSelector value={format} onChange={setFormat} />
        </div>

        {/* Pilar */}
        <div>
          <label
            className="mb-2 block font-label text-xs uppercase tracking-widest"
            style={{ color: "#64748b" }}
          >
            Pilar de contenido
          </label>
          <PillarSelector value={pillar} onChange={setPillar} />
        </div>

        {/* Context + Zona */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              className="mb-1.5 block font-label text-xs uppercase tracking-widest"
              style={{ color: "#64748b" }}
            >
              Contexto / Propiedad
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ej: depto 2 amb con balcón en Palermo, precio USD 120k..."
              rows={3}
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:opacity-30"
              style={{
                backgroundColor: "#10101c",
                borderColor: context
                  ? "rgba(59,130,246,0.3)"
                  : "rgba(255,255,255,0.10)",
                color: "#f1f5f9",
              }}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block font-label text-xs uppercase tracking-widest"
              style={{ color: "#64748b" }}
            >
              Zona / Mercado
            </label>
            <input
              type="text"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Ej: Palermo, CABA"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder:opacity-30"
              style={{
                backgroundColor: "#10101c",
                borderColor: zona
                  ? "rgba(59,130,246,0.3)"
                  : "rgba(255,255,255,0.10)",
                color: "#f1f5f9",
              }}
            />
            <p
              className="mt-1.5 text-xs"
              style={{ color: "#64748b" }}
            >
              Opcional — personaliza el contenido a tu mercado
            </p>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <motion.button
        onClick={generate}
        disabled={streaming}
        whileHover={!streaming ? { scale: 1.01 } : {}}
        whileTap={!streaming ? { scale: 0.98 } : {}}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-label text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50"
        style={{
          backgroundColor: streaming ? "rgba(59,130,246,0.15)" : "#3b82f6",
          color: streaming ? "#3b82f6" : "#ffffff",
          border: streaming ? "1px solid rgba(59,130,246,0.3)" : "none",
        }}
      >
        <span
          className="material-symbols-outlined text-base"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {streaming ? "hourglass_top" : "auto_awesome"}
        </span>
        {streaming ? "Generando..." : generated ? "Regenerar" : "Generar contenido"}
      </motion.button>

      {/* Output */}
      <AnimatePresence>
        {(output || streaming) && (
          <OutputCard
            content={output}
            streaming={streaming}
            format={format}
            pillar={pillar}
            onGuardar={handleGuardar}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
