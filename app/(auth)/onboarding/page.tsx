"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StepOption = {
  value: string;
  label: string;
  description?: string;
};

type Step = {
  id: string;
  question_key: string; // alineado con onboarding_questions.question_key
  question: string;
  options: StepOption[];
};

// ─── Pasos del quiz ───────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: "volume",
    question_key: "monthly_leads",
    question: "¿Cuántos leads generás por mes?",
    options: [
      { value: "0-10", label: "Menos de 10", description: "Recién arrancando" },
      { value: "10-30", label: "Entre 10 y 30", description: "Creciendo" },
      { value: "30-100", label: "Entre 30 y 100", description: "Escala media" },
      { value: "100+", label: "Más de 100", description: "Equipo activo" },
    ],
  },
  {
    id: "channel",
    question_key: "crm_usage",
    question: "¿Desde dónde captás más leads hoy?",
    options: [
      { value: "whatsapp", label: "WhatsApp directo" },
      { value: "portals", label: "Portales (Zonaprop, MercadoLibre)" },
      { value: "social", label: "Redes sociales" },
      { value: "referrals", label: "Referidos / boca en boca" },
    ],
  },
  {
    id: "pain",
    question_key: "main_challenge",
    question: "¿Qué te consume más tiempo?",
    options: [
      { value: "followup", label: "Hacer seguimiento de leads" },
      { value: "content", label: "Generar contenido para redes" },
      { value: "qualify", label: "Calificar si un lead es serio" },
      { value: "coordination", label: "Coordinar visitas y reuniones" },
    ],
  },
  {
    id: "team",
    question_key: "team_size",
    question: "¿Trabajás solo o con equipo?",
    options: [
      { value: "solo", label: "Solo/a" },
      { value: "small", label: "Con 1 o 2 personas" },
      { value: "medium", label: "Equipo de 3 a 10" },
      { value: "large", label: "Más de 10 personas" },
    ],
  },
];

// ─── Score map (alineado con classify_user() en el schema) ────────────────────

const SCORE_MAP: Record<string, number> = {
  "0-10": 0, "10-30": 2, "30-100": 4, "100+": 5,
  whatsapp: 2, portals: 3, social: 2, referrals: 1,
  followup: 2, content: 1, qualify: 2, coordination: 1,
  solo: 0, small: 2, medium: 3, large: 5,
};

// ─── Lógica de nivel ──────────────────────────────────────────────────────────

type Level = {
  name: string;
  classification: "principiante" | "crecimiento" | "establecido" | "avanzado";
  description: string;
  color: string;
  modules: string[];
};

function resolveLevel(answers: Record<string, string>): Level {
  const total = Object.values(answers).reduce(
    (acc, v) => acc + (SCORE_MAP[v] ?? 0),
    0
  );

  if (total > 20) return {
    name: "Avanzado",
    classification: "avanzado",
    description: "Tenés un sistema funcionando. La IA lo va a escalar.",
    color: "var(--ai)",
    modules: ["Captación con IA", "Agente WhatsApp", "CRM inteligente", "Generador de contenido", "Analytics", "Seguimiento automático", "Optimización"],
  };
  if (total > 12) return {
    name: "Establecido",
    classification: "establecido",
    description: "Tenés base sólida. Ahora automatizamos y optimizamos.",
    color: "var(--success)",
    modules: ["Captación con IA", "Agente WhatsApp", "CRM inteligente", "Generador de contenido", "Analytics"],
  };
  if (total > 5) return {
    name: "Crecimiento",
    classification: "crecimiento",
    description: "Estás escalando. Es el momento exacto para automatizar.",
    color: "var(--info)",
    modules: ["Captación con IA", "Agente WhatsApp", "CRM inteligente", "Generador de contenido"],
  };
  return {
    name: "Principiante",
    classification: "principiante",
    description: "Construís tu sistema desde cero con IA desde el día 1.",
    color: "var(--warning)",
    modules: ["Captación con IA", "Agente WhatsApp", "CRM inteligente"],
  };
}

// ─── Animaciones ──────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    transition: { duration: 0.2, ease: EASE },
  }),
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const step = STEPS[stepIndex];
  const progress = (stepIndex / STEPS.length) * 100;

  function select(value: string) {
    const next = { ...answers, [step.id]: value };
    setAnswers(next);

    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return <ResultScreen answers={answers} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--ai)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <motion.p
            key={`counter-${stepIndex}`}
            className="mb-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {stepIndex + 1} de {STEPS.length}
          </motion.p>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-6"
            >
              <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {step.question}
              </h2>

              <div className="grid gap-3">
                {step.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => select(opt.value)}
                    className={cn(
                      "group flex flex-col gap-0.5 rounded-xl border border-border bg-card px-5 py-4 text-left transition-all",
                      "hover:border-[var(--ai)] hover:bg-[var(--ai-muted)] active:scale-[0.99]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <span className="text-[15px] font-medium text-foreground">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-sm text-muted-foreground">
                        {opt.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Pantalla de resultado ────────────────────────────────────────────────────

function ResultScreen({ answers }: { answers: Record<string, string> }) {
  const router = useRouter();
  const level = resolveLevel(answers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoToDashboard() {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Obtener el usuario actual desde la sesión local
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("No hay sesión activa");

      // 2. Guardar respuestas en onboarding_responses
      // Cast a any hasta reemplazar el stub con tipos generados por supabase CLI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      // 2a. Garantizar que el perfil existe (el trigger puede haber fallado)
      const { error: profileUpsertError } = await db
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email ?? "",
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "Usuario",
          avatar_url: user.user_metadata?.avatar_url ?? null,
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: "id" });

      if (profileUpsertError) {
        console.error("upsert profiles:", JSON.stringify(profileUpsertError));
        throw profileUpsertError;
      }

      const responses = STEPS.map((s) => ({
        user_id: user.id,
        question_key: s.question_key,
        question_text: s.question,
        answer_value: answers[s.id] ?? "",
        answer_score: SCORE_MAP[answers[s.id]] ?? 0,
      }));

      const { error: insertError } = await db
        .from("onboarding_responses")
        .upsert(responses, { onConflict: "user_id,question_key" });

      if (insertError) {
        console.error("upsert onboarding_responses:", JSON.stringify(insertError));
        throw insertError;
      }

      // 3. Marcar onboarding como completado y guardar clasificación
      const { error: profileError } = await db
        .from("profiles")
        .update({
          onboarding_completed: true,
          classification: level.classification,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("update profiles:", JSON.stringify(profileError));
        throw profileError;
      }

      // 4. Navegar al dashboard — el proxy ahora verá onboarding_completed = true
      router.push("/dashboard");
    } catch (err) {
      console.error("Error guardando onboarding:", JSON.stringify(err));
      setError("Algo salió mal. Intentalo de nuevo.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${level.color}1a, transparent)`,
        }}
      />

      <div className="relative flex flex-col items-center gap-8 text-center max-w-md">
        {/* Badge de nivel */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-bold shadow-lg"
            style={{
              backgroundColor: `${level.color}20`,
              border: `2px solid ${level.color}40`,
              color: level.color,
            }}
          >
            {level.name[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Tu nivel
            </p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: level.color }}>
              {level.name}
            </h1>
          </div>
        </motion.div>

        <motion.p
          className="text-muted-foreground text-base leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
        >
          {level.description}
        </motion.p>

        {/* Módulos */}
        <div className="w-full flex flex-col gap-2">
          <motion.p
            className="text-sm font-medium text-muted-foreground mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            Módulos activos en tu plan
          </motion.p>
          {level.modules.map((mod, i) => (
            <motion.div
              key={mod}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.07, ease: EASE }}
            >
              <div className="size-2 rounded-full" style={{ backgroundColor: level.color }} />
              <span className="text-sm font-medium text-foreground">{mod}</span>
            </motion.div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* CTA */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: EASE }}
        >
          <button
            type="button"
            onClick={handleGoToDashboard}
            disabled={saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            style={{ backgroundColor: level.color, color: "oklch(0.98 0 0)" }}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Ir al dashboard →"
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
