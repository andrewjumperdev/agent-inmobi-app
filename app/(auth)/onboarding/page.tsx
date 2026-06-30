"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface OnboardingInfo {
  niche_slug: string | null;
  niche_name: string | null;
  questions: string[];
  diagnosis_completed: boolean;
  enabled_modules: string[];
}
interface DiagnoseResult {
  summary: string | null;
  strategy: string | null;
  industry: string | null;
  enabled_modules: string[];
}

const MODULE_LABELS: Record<string, string> = {
  sdr: "Captación (SDR)",
  qualification: "Calificación de leads",
  followup: "Seguimiento automático",
  proposal: "Propuestas",
  content: "Generación de contenido",
  onboarding: "Onboarding de clientes",
  customer_service: "Atención al cliente (WhatsApp)",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "form" | "diagnosing" | "result" | "error">("loading");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding");
      if (!res.ok) throw new Error("info");
      const d = (await res.json()) as OnboardingInfo;
      if (d.diagnosis_completed) {
        router.replace("/dashboard");
        return;
      }
      setQuestions(
        d.questions.length
          ? d.questions
          : ["Contanos sobre tu negocio: qué ofrecés, a quién y cuál es tu mayor desafío hoy."]
      );
      setPhase("form");
    } catch {
      setError("No pudimos cargar tu onboarding. Reintentá en unos segundos.");
      setPhase("error");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const allAnswered =
    questions.length > 0 && questions.every((q) => (answers[q] || "").trim().length > 0);

  async function submit() {
    setPhase("diagnosing");
    setError(null);
    try {
      const res = await fetch("/api/onboarding/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("diagnose");
      const d = (await res.json()) as DiagnoseResult;

      // Marcar onboarding completado en Supabase (lo lee el proxy para dejar pasar al dashboard).
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      }

      setResult(d);
      setPhase("result");
    } catch {
      setError("No se pudo generar el diagnóstico. Intentá de nuevo.");
      setPhase("form");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#060609", color: "#f1f5f9" }}
    >
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
          >
            <Sparkles size={22} style={{ color: "#3b82f6" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Diagnóstico con tu Coach IA</h1>
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
            Respondé unas preguntas y el sistema se configura solo para tu negocio.
          </p>
        </div>

        {phase === "loading" && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" style={{ color: "#3b82f6" }} />
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-xl border p-6 text-center text-sm" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}>
            {error}
            <button onClick={load} className="mt-3 block w-full rounded-lg py-2 text-sm font-semibold" style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
              Reintentar
            </button>
          </div>
        )}

        {(phase === "form" || phase === "diagnosing") && (
          <div className="flex flex-col gap-4">
            {questions.map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: EASE }}>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "#cbd5e1" }}>{q}</label>
                <textarea
                  rows={2}
                  value={answers[q] || ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q]: e.target.value }))}
                  disabled={phase === "diagnosing"}
                  className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
                  style={{ backgroundColor: "#10101c", borderColor: "rgba(255,255,255,0.08)", color: "#f1f5f9" }}
                />
              </motion.div>
            ))}
            {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}
            <button
              onClick={submit}
              disabled={!allAnswered || phase === "diagnosing"}
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl text-base font-bold uppercase tracking-tight transition-all disabled:opacity-40"
              style={{ backgroundColor: "#3b82f6", color: "#fff" }}
            >
              {phase === "diagnosing" ? (
                <><Loader2 size={18} className="animate-spin" /> Diagnosticando tu negocio…</>
              ) : (
                <>Generar mi diagnóstico <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}

        {phase === "result" && result && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-5">
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "#10101c", borderColor: "rgba(59,130,246,0.25)" }}>
              <p className="mb-1 text-[11px] uppercase tracking-widest" style={{ color: "#3b82f6" }}>Tu diagnóstico</p>
              <p className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>{result.summary}</p>
              {result.strategy && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                  <span className="font-semibold" style={{ color: "#cbd5e1" }}>Estrategia: </span>
                  {result.strategy}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-widest" style={{ color: "#64748b" }}>Módulos activados para vos</p>
              <div className="flex flex-col gap-2">
                {(result.enabled_modules || []).map((m) => (
                  <div key={m} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ backgroundColor: "#10101c", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Check size={15} style={{ color: "#22c55e" }} />
                    <span className="text-sm" style={{ color: "#f1f5f9" }}>{MODULE_LABELS[m] ?? m}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => router.push("/dashboard")} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl text-base font-bold uppercase tracking-tight" style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
              Ir a mi dashboard <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
