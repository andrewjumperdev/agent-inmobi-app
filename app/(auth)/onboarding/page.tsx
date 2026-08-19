"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  GraduationCap,
  Home,
  Loader2,
  Scale,
  Sparkles,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface NicheBrief {
  slug: string;
  name: string;
}
interface CoachQuestion {
  text: string;
  example: string;
}
interface OnboardingInfo {
  niche_slug: string | null;
  niche_name: string | null;
  questions: CoachQuestion[];
  diagnosis_completed: boolean;
  enabled_modules: string[];
  niches: NicheBrief[];
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

const NICHE_ICON: Record<string, React.ElementType> = {
  constructoras: Building2,
  abogados: Scale,
  "real-estate": Home,
  educacion: GraduationCap,
};

const FALLBACK_QUESTION: CoachQuestion = {
  text: "Contanos sobre tu negocio: qué ofrecés, a quién y cuál es tu mayor desafío hoy.",
  example: "Vendo software de gestión a pymes; me cuesta hacer seguimiento",
};

/**
 * Borrador en el navegador.
 *
 * Se guarda local y no en el servidor a propósito: las respuestas recién
 * significan algo como conjunto, al momento de diagnosticar. Lo que hay que
 * evitar es el modo de falla real —refrescar sin querer y perder diez minutos de
 * escritura—, y para eso localStorage alcanza sin agregar endpoints ni estado
 * a medio completar en la base.
 */
const draftKey = (slug: string) => `kore:onboarding:${slug}`;

function loadDraft(slug: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(draftKey(slug)) || "{}");
  } catch {
    return {};
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<
    "loading" | "niche" | "question" | "diagnosing" | "result" | "error"
  >("loading");
  const [niches, setNiches] = useState<NicheBrief[]>([]);
  const [nicheSlug, setNicheSlug] = useState<string>("");
  const [questions, setQuestions] = useState<CoachQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding");
      if (!res.ok) throw new Error("info");
      const d = (await res.json()) as OnboardingInfo;
      if (d.diagnosis_completed) {
        router.replace("/dashboard");
        return;
      }
      setNiches(d.niches || []);
      setPhase("niche");
    } catch {
      setError("No pudimos cargar tu onboarding. Reintentá en unos segundos.");
      setPhase("error");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // El foco al avanzar de paso es lo que hace que se sienta un flujo y no un
  // formulario: se puede responder entero sin tocar el mouse.
  useEffect(() => {
    if (phase === "question") inputRef.current?.focus();
  }, [phase, step]);

  async function pickNiche(slug: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/niche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche_slug: slug }),
      });
      if (!res.ok) throw new Error("niche");
      const d = (await res.json()) as OnboardingInfo;

      const qs = d.questions.length ? d.questions : [FALLBACK_QUESTION];
      const draft = loadDraft(slug);
      setNicheSlug(slug);
      setQuestions(qs);
      setAnswers(draft);
      // Retoma en la primera pregunta sin responder, no en la cero: quien vuelve
      // no debería tener que pasar de nuevo por lo que ya escribió.
      const resume = qs.findIndex((q) => !(draft[q.text] || "").trim());
      setStep(resume === -1 ? qs.length - 1 : resume);
      setPhase("question");
    } catch {
      setError("No se pudo seleccionar el rubro. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  function setAnswer(value: string) {
    const question = questions[step];
    if (!question) return;
    const next = { ...answers, [question.text]: value };
    setAnswers(next);
    try {
      localStorage.setItem(draftKey(nicheSlug), JSON.stringify(next));
    } catch {
      // Modo incógnito o cuota llena: el borrador es una comodidad, no un
      // requisito. Se sigue igual.
    }
  }

  const current = questions[step];
  const currentAnswer = (answers[current?.text ?? ""] || "").trim();
  const isLast = step === questions.length - 1;
  const answeredCount = questions.filter((q) => (answers[q.text] || "").trim()).length;

  function next() {
    if (!currentAnswer) return;
    if (isLast) void submit();
    else setStep((s) => s + 1);
  }

  function handleKey(e: React.KeyboardEvent) {
    // Enter avanza, Shift+Enter hace salto de línea. Las respuestas son de una
    // o dos líneas, así que optimizamos para el caso frecuente.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      next();
    }
  }

  async function submit() {
    setPhase("diagnosing");
    setError(null);
    try {
      const res = await fetch("/api/onboarding/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(e.detail || e.error || `HTTP ${res.status}`);
      }
      const d = (await res.json()) as DiagnoseResult;
      try {
        localStorage.removeItem(draftKey(nicheSlug));
      } catch {
        /* nada que hacer si no se puede limpiar */
      }
      setResult(d);
      setPhase("result");
    } catch (err) {
      setError(
        `No se pudo generar el diagnóstico: ${err instanceof Error ? err.message : "error"}`
      );
      setPhase("question");
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--app-canvas)", color: "var(--foreground)" }}
    >
      <div className="w-full max-w-xl">
        {/* ── Cabecera ── */}
        {phase !== "result" && (
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: "color-mix(in oklab, var(--info) 12%, transparent)",
                border: "1px solid color-mix(in oklab, var(--info) 25%, transparent)",
              }}
            >
              <Sparkles size={22} style={{ color: "var(--info)" }} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {phase === "niche" ? "¿En qué rubro trabajás?" : "Contame de tu negocio"}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              {phase === "niche"
                ? "Con esto armo las preguntas específicas para vos."
                : "Cinco preguntas cortas. Con eso configuro tu sistema."}
            </p>
          </div>
        )}

        {phase === "loading" && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" style={{ color: "var(--info)" }} />
          </div>
        )}

        {phase === "error" && (
          <div
            className="rounded-xl border p-6 text-center text-sm"
            style={{
              borderColor: "color-mix(in oklab, var(--destructive) 30%, transparent)",
              color: "var(--destructive)",
            }}
          >
            {error}
            <button
              onClick={load}
              className="mt-3 block w-full rounded-lg py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--info)", color: "#fff" }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Selección de rubro ── */}
        {phase === "niche" && (
          <div className="flex flex-col gap-3">
            {niches.map((n, i) => {
              const Icon = NICHE_ICON[n.slug] ?? Briefcase;
              return (
                <motion.button
                  key={n.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: EASE }}
                  onClick={() => pickNiche(n.slug)}
                  disabled={busy}
                  className="group flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--app-surface-hover)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "color-mix(in oklab, var(--info) 12%, transparent)",
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--info)" }} />
                  </div>
                  <span
                    className="flex-1 text-[15px] font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {n.name}
                  </span>
                  {busy ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  ) : (
                    <ArrowRight
                      size={16}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--info)" }}
                    />
                  )}
                </motion.button>
              );
            })}
            {error && (
              <p className="text-sm" style={{ color: "var(--destructive)" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Una pregunta por pantalla ── */}
        {(phase === "question" || phase === "diagnosing") && current && (
          <div className="flex flex-col gap-5">
            {/* Progreso: el punto no es decorar, es que se vea que son pocas y
                cuántas faltan. Sin esto, cinco campos vacíos parecen infinitos. */}
            <div className="flex items-center gap-3">
              <div
                className="h-1 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--app-surface-hover)" }}
                role="progressbar"
                aria-valuenow={answeredCount}
                aria-valuemin={0}
                aria-valuemax={questions.length}
                aria-label={`${answeredCount} de ${questions.length} respondidas`}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: "var(--info)" }}
                  animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  transition={{ ease: EASE, duration: 0.4 }}
                />
              </div>
              <span
                className="font-label shrink-0 text-[11px] uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                {step + 1} de {questions.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <label
                  htmlFor="respuesta"
                  className="text-lg font-semibold leading-snug"
                  style={{ color: "var(--foreground)" }}
                >
                  {current.text}
                </label>

                <textarea
                  id="respuesta"
                  ref={inputRef}
                  rows={3}
                  value={answers[current.text] || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={phase === "diagnosing"}
                  // El ejemplo va de placeholder: se ve mientras el campo está
                  // vacío, que es justo cuando hace falta, y desaparece solo.
                  placeholder={current.example ? `Ej: ${current.example}` : "Escribí tu respuesta…"}
                  className="w-full resize-none rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--app-surface-hover)",
                    borderColor: currentAnswer ? "var(--info)" : "var(--app-border)",
                    color: "var(--foreground)",
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="text-sm" style={{ color: "var(--destructive)" }}>
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => (step === 0 ? setPhase("niche") : setStep((s) => s - 1))}
                disabled={phase === "diagnosing"}
                className="inline-flex h-12 items-center gap-1.5 rounded-xl px-4 text-sm font-medium transition-colors disabled:opacity-40"
                style={{ color: "var(--muted-foreground)" }}
              >
                <ArrowLeft size={16} />
                {step === 0 ? "Cambiar rubro" : "Atrás"}
              </button>

              <button
                onClick={next}
                disabled={!currentAnswer || phase === "diagnosing"}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-base font-bold tracking-tight transition-opacity disabled:opacity-40"
                style={{ backgroundColor: "var(--info)", color: "#fff" }}
              >
                {phase === "diagnosing" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Configurando tu sistema…
                  </>
                ) : isLast ? (
                  <>
                    Generar mi diagnóstico <Sparkles size={17} />
                  </>
                ) : (
                  <>
                    Siguiente <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              Enter para seguir · Shift + Enter para otra línea · se guarda solo
            </p>
          </div>
        )}

        {/* ── Resultado ── */}
        {phase === "result" && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <div
                className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "color-mix(in oklab, var(--success) 12%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--success) 25%, transparent)",
                }}
              >
                <Check size={22} style={{ color: "var(--success)" }} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Tu sistema está configurado</h1>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: "var(--app-surface-hover)",
                borderColor: "color-mix(in oklab, var(--info) 25%, transparent)",
              }}
            >
              <p
                className="mb-1 text-[11px] uppercase tracking-widest"
                style={{ color: "var(--info)" }}
              >
                Tu diagnóstico
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {result.summary}
              </p>
              {result.strategy && (
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    Estrategia:{" "}
                  </span>
                  {result.strategy}
                </p>
              )}
            </div>

            <div>
              <p
                className="mb-2 text-[11px] uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                Módulos activados para vos
              </p>
              <div className="flex flex-col gap-2">
                {(result.enabled_modules || []).map((m) => (
                  <div
                    key={m}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
                    style={{
                      backgroundColor: "var(--app-surface-hover)",
                      border: "1px solid color-mix(in oklab, var(--success) 20%, transparent)",
                    }}
                  >
                    <Check size={15} style={{ color: "var(--success)" }} />
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>
                      {MODULE_LABELS[m] ?? m}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navegación DURA (full reload) a propósito: fuerza una nueva
                evaluación del middleware con el flag ya seteado y evita cualquier
                estado trabado del router del cliente. Con <Link /> el router
                cliente reusa su caché y el middleware puede seguir viendo
                onboarding_completed=false → vuelve a mandar acá (el loop
                dashboard↔onboarding que ya nos pasó). */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl text-base font-bold tracking-tight no-underline"
              style={{ backgroundColor: "var(--info)", color: "#fff" }}
            >
              Ir a mi dashboard <ArrowRight size={18} />
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
