"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── Animation config ──────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: d, ease: EASE },
  }),
};

const slideX = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -24,
    transition: { duration: 0.25 },
  }),
};

/* ── Password strength rules ───────────────────────────────── */
type Rule = { id: string; label: string; test: (pw: string) => boolean };

const RULES: Rule[] = [
  { id: "len",   label: "Mínimo 8 caracteres",          test: (p) => p.length >= 8 },
  { id: "upper", label: "Una letra mayúscula",           test: (p) => /[A-Z]/.test(p) },
  { id: "num",   label: "Un número",                    test: (p) => /[0-9]/.test(p) },
  { id: "spec",  label: "Un carácter especial (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(pw: string) {
  const passed = RULES.filter((r) => r.test(pw)).length;
  if (passed <= 1) return { score: 1, label: "Muy débil", color: "#ef4444" };
  if (passed === 2) return { score: 2, label: "Débil",    color: "#f97316" };
  if (passed === 3) return { score: 3, label: "Buena",    color: "#eab308" };
  return              { score: 4, label: "Fuerte",        color: "#bcff5f" };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ── Page export ───────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

/* ── Core component ────────────────────────────────────────── */
function LoginContent() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const redirectPath  = searchParams.get("redirect") ?? "/dashboard";
  const callbackError = searchParams.get("error") === "auth_callback_failed";

  const [mode, setMode]       = useState<"signin" | "signup">("signin");
  const [dir,  setDir]        = useState(1);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);

  const [loading, setLoading]   = useState<"google" | "email" | null>(null);
  const [error,   setError]     = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  /* derived */
  const emailOk    = EMAIL_RE.test(email);
  const strength   = getStrength(password);
  const passwordOk = strength.score === 4;
  const confirmOk  = confirm === password && confirm.length > 0;

  const canSubmit =
    mode === "signin"
      ? emailOk && password.length > 0
      : emailOk && passwordOk && confirmOk;

  function switchMode(next: "signin" | "signup") {
    setDir(next === "signup" ? 1 : -1);
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirm("");
  }

  /* ── Google OAuth ────────────────────────────────────────── */
  async function signInGoogle() {
    if (loading) return;
    setLoading("google");
    setError(null);
    const supabase = createClient();
    const cb = new URL("/auth/callback", window.location.origin);
    cb.searchParams.set("next", redirectPath);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: cb.toString(),
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      setError("No se pudo conectar con Google.");
      setLoading(null);
    }
  }

  /* ── Email / password auth ───────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading("email");
    setError(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message.includes("Invalid login")
            ? "Email o contraseña incorrectos."
            : "Error al iniciar sesión. Intentá de nuevo."
        );
        setLoading(null);
      } else {
        router.push(redirectPath);
      }
    } else {
      const cb = `${window.location.origin}/auth/callback?next=${redirectPath}`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: cb },
      });
      if (error) {
        setError(
          error.message.includes("already registered")
            ? "Ya existe una cuenta con ese email."
            : "Error al crear la cuenta. Intentá de nuevo."
        );
        setLoading(null);
      } else {
        setSuccess("Revisá tu email para confirmar tu cuenta.");
        setLoading(null);
      }
    }
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}
    >
      {/* Ambient glows */}
      <motion.div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(188,255,95,0.06) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(188,198,224,0.04) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#bcff5f 1px, transparent 1px), linear-gradient(90deg, #bcff5f 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-[420px] flex flex-col gap-7">
        {/* Brand */}
        <motion.div
          initial="hidden" animate="visible" custom={0} variants={fadeUp}
          className="flex flex-col items-center gap-1"
        >
          <span
            className="font-headline text-2xl font-black uppercase tracking-tighter"
            style={{ color: "#bcff5f" }}
          >
            InMobi AI OS
          </span>
          <p className="text-sm" style={{ color: "#c6c6cd" }}>
            {mode === "signin"
              ? "Accedé a tu sistema operativo"
              : "Creá tu cuenta y desplegá tu OS"}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial="hidden" animate="visible" custom={0.1} variants={fadeUp}
          className="rounded-2xl border p-8 flex flex-col gap-5"
          style={{ backgroundColor: "#171f33", borderColor: "rgba(69,70,77,0.5)" }}
        >
          {/* Callback error banner */}
          {callbackError && (
            <div
              className="rounded-lg border px-4 py-3 text-sm"
              style={{ borderColor: "rgba(255,180,171,0.3)", backgroundColor: "rgba(147,0,10,0.2)", color: "#ffb4ab" }}
            >
              Algo salió mal. Intentá de nuevo.
            </div>
          )}

          {/* Success banner */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-lg border px-4 py-3 text-sm flex items-start gap-2"
                style={{ borderColor: "rgba(188,255,95,0.3)", backgroundColor: "rgba(188,255,95,0.08)", color: "#bcff5f" }}
              >
                <Check className="mt-0.5 shrink-0" size={14} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode tabs */}
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ backgroundColor: "#0b1326" }}
          >
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="flex-1 rounded-lg py-2 text-sm font-headline font-bold uppercase tracking-tight transition-all duration-200"
                style={{
                  backgroundColor: mode === m ? "#bcff5f" : "transparent",
                  color: mode === m ? "#203600" : "#c6c6cd",
                }}
              >
                {m === "signin" ? "Ingresar" : "Registrarse"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            type="button"
            disabled={loading !== null}
            onClick={signInGoogle}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-[15px] font-medium transition-colors active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            style={{ borderColor: "rgba(69,70,77,0.6)", backgroundColor: "#222a3d", color: "#dae2fd" }}
          >
            {loading === "google"
              ? <Loader2 className="size-5 animate-spin" style={{ color: "#c6c6cd" }} />
              : <GoogleIcon className="size-5 shrink-0" />
            }
            {loading === "google" ? "Redirigiendo…" : "Continuar con Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "#45464d" }} />
            <span className="text-xs" style={{ color: "#909097" }}>o con email</span>
            <div className="h-px flex-1" style={{ backgroundColor: "#45464d" }} />
          </div>

          {/* Form — slides on mode switch */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.form
              key={mode}
              custom={dir}
              variants={slideX}
              initial="enter"
              animate="center"
              exit="exit"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              {/* Email */}
              <Field label="Email">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border bg-transparent px-4 pr-9 text-sm outline-none transition-colors placeholder:opacity-30"
                    style={inputStyle(email ? (emailOk ? "ok" : "err") : "idle")}
                  />
                  {email && (
                    <StatusIcon ok={emailOk} />
                  )}
                </div>
                {email && !emailOk && (
                  <Hint color="red">Ingresá un email válido.</Hint>
                )}
              </Field>

              {/* Password */}
              <Field label="Contraseña">
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="h-11 w-full rounded-xl border bg-transparent px-4 pr-9 text-sm outline-none transition-colors placeholder:opacity-30"
                    style={inputStyle(
                      password
                        ? mode === "signup"
                          ? passwordOk ? "ok" : "warn"
                          : "ok"
                        : "idle"
                    )}
                  />
                  <ToggleVisibility show={showPw} onToggle={() => setShowPw((v) => !v)} />
                </div>

                {/* Strength — signup only */}
                {mode === "signup" && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden flex flex-col gap-2 pt-1"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= strength.score ? strength.color : "#2d3449" }}
                        />
                      ))}
                    </div>
                    <span className="font-label text-[11px]" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {RULES.map((rule) => {
                        const pass = rule.test(password);
                        return (
                          <div key={rule.id} className="flex items-center gap-1.5">
                            {pass
                              ? <Check size={10} style={{ color: "#bcff5f", flexShrink: 0 }} />
                              : <X size={10} style={{ color: "#909097", flexShrink: 0 }} />
                            }
                            <span
                              className="text-[10px]"
                              style={{ color: pass ? "#bcff5f" : "#909097" }}
                            >
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </Field>

              {/* Confirm password */}
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Field label="Confirmar contraseña">
                    <div className="relative">
                      <input
                        type={showCf ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-11 w-full rounded-xl border bg-transparent px-4 pr-9 text-sm outline-none transition-colors placeholder:opacity-30"
                        style={inputStyle(confirm ? (confirmOk ? "ok" : "err") : "idle")}
                      />
                      <ToggleVisibility show={showCf} onToggle={() => setShowCf((v) => !v)} />
                    </div>
                    {confirm && !confirmOk && (
                      <Hint color="red">Las contraseñas no coinciden.</Hint>
                    )}
                  </Field>
                </motion.div>
              )}

              {/* API error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-lg border px-4 py-3 text-sm flex items-start gap-2"
                    style={{ borderColor: "rgba(255,180,171,0.3)", backgroundColor: "rgba(147,0,10,0.2)", color: "#ffb4ab" }}
                  >
                    <X className="mt-0.5 shrink-0" size={13} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!canSubmit || loading !== null}
                whileHover={canSubmit && !loading ? { scale: 1.02, boxShadow: "0 0 28px rgba(188,255,95,0.4)" } : {}}
                whileTap={{ scale: 0.97 }}
                className="h-12 w-full rounded-xl font-headline text-base font-bold uppercase tracking-tight transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#bcff5f", color: "#203600" }}
              >
                {loading === "email"
                  ? <Loader2 className="mx-auto size-5 animate-spin" style={{ color: "#203600" }} />
                  : mode === "signin" ? "Ingresar" : "Crear cuenta"
                }
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* Legal footer */}
        <motion.p
          initial="hidden" animate="visible" custom={0.35} variants={fadeUp}
          className="text-center text-xs leading-relaxed"
          style={{ color: "rgba(198,198,205,0.45)" }}
        >
          Al continuar aceptás los{" "}
          <a href="#" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
            Términos de Servicio
          </a>{" "}
          y la{" "}
          <a href="#" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
            Política de Privacidad
          </a>.
        </motion.p>
      </div>
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-[11px] uppercase tracking-widest" style={{ color: "#c6c6cd" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Hint({ children, color }: { children: React.ReactNode; color: "red" | "green" }) {
  return (
    <p className="text-xs" style={{ color: color === "red" ? "#ef4444" : "#bcff5f" }}>
      {children}
    </p>
  );
}

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2">
      {ok
        ? <Check size={13} style={{ color: "#bcff5f" }} />
        : <X size={13} style={{ color: "#ef4444" }} />
      }
    </span>
  );
}

function ToggleVisibility({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
      style={{ color: "#909097" }}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

function inputStyle(state: "idle" | "ok" | "err" | "warn"): React.CSSProperties {
  const borders: Record<string, string> = {
    idle: "rgba(69,70,77,0.6)",
    ok:   "rgba(188,255,95,0.45)",
    err:  "rgba(239,68,68,0.6)",
    warn: "rgba(234,179,8,0.5)",
  };
  return {
    borderColor: borders[state],
    color: "#dae2fd",
    backgroundColor: "#0f172a",
  };
}

/* ── Google icon ───────────────────────────────────────────── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
