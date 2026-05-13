"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut,
  User,
  Mail,
  Building2,
  Phone,
  CreditCard,
  Calendar,
  ChevronRight,
  Loader2,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── Types ──────────────────────────────────────────────────── */
interface Profile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  company_name: string | null;
  phone: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  created_at: string | null;
}

interface Props {
  profile: Profile;
  authEmail: string;
}

/* ── Animation ──────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: d, ease: EASE },
  }),
};

/* ── Plan badge config ──────────────────────────────────────── */
const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pro:   { label: "Pro",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  trial: { label: "Trial",    color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  free:  { label: "Free",     color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

function getPlanDisplay(plan: string | null, status: string | null) {
  const key = plan?.toLowerCase() ?? (status === "trialing" ? "trial" : "free");
  return PLAN_LABELS[key] ?? PLAN_LABELS.free;
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return email[0].toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/* ── Main component ─────────────────────────────────────────── */
export function CuentaView({ profile, authEmail }: Props) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const email = profile.email ?? authEmail;
  const displayName = profile.full_name ?? email.split("@")[0];
  const initials = getInitials(profile.full_name, email);
  const plan = getPlanDisplay(profile.subscription_plan, profile.subscription_status);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">

      {/* Page header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Mi cuenta
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Administrá tu perfil y suscripción
        </p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial="hidden" animate="visible" custom={0.05} variants={fadeUp}
        className="rounded-2xl border border-border bg-card p-6 flex items-start gap-5"
      >
        {/* Avatar */}
        <div
          className="size-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
          style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#3b82f6" }}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="size-full rounded-2xl object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-semibold text-foreground truncate">
              {displayName}
            </span>
            {/* Plan badge */}
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{ color: plan.color, backgroundColor: plan.bg }}
            >
              {plan.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{email}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Cuenta creada el {formatDate(profile.created_at)}
          </p>
        </div>
      </motion.div>

      {/* Details section */}
      <motion.div
        initial="hidden" animate="visible" custom={0.1} variants={fadeUp}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Información personal
          </span>
        </div>
        <div className="divide-y divide-border">
          <InfoRow icon={User} label="Nombre completo" value={profile.full_name} />
          <InfoRow icon={Mail} label="Email" value={email} />
          <InfoRow icon={Building2} label="Empresa / Inmobiliaria" value={profile.company_name} />
          <InfoRow icon={Phone} label="Teléfono" value={profile.phone} />
        </div>
      </motion.div>

      {/* Subscription section */}
      <motion.div
        initial="hidden" animate="visible" custom={0.15} variants={fadeUp}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Suscripción
          </span>
        </div>
        <div className="divide-y divide-border">
          <InfoRow
            icon={CreditCard}
            label="Plan actual"
            value={
              <span style={{ color: plan.color }} className="font-semibold">
                {plan.label}
              </span>
            }
          />
          <InfoRow
            icon={Shield}
            label="Estado"
            value={
              <span className={
                profile.subscription_status === "active"
                  ? "text-green-400"
                  : "text-muted-foreground"
              }>
                {profile.subscription_status === "active"
                  ? "Activa"
                  : profile.subscription_status === "trialing"
                  ? "En período de prueba"
                  : profile.subscription_status ?? "Sin suscripción"}
              </span>
            }
          />
          {profile.trial_ends_at && (
            <InfoRow
              icon={Calendar}
              label="Trial vence"
              value={formatDate(profile.trial_ends_at)}
            />
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial="hidden" animate="visible" custom={0.2} variants={fadeUp}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Acciones
          </span>
        </div>
        <div className="divide-y divide-border">
          {/* Sign out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-destructive/5 disabled:opacity-50 group"
          >
            <div className="size-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              {signingOut
                ? <Loader2 size={15} className="animate-spin text-destructive" />
                : <LogOut size={15} className="text-destructive" />
              }
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
              </p>
              <p className="text-xs text-muted-foreground">
                Salís de tu cuenta en este dispositivo
              </p>
            </div>
            <ChevronRight size={15} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </button>
        </div>
      </motion.div>

    </div>
  );
}

/* ── InfoRow helper ─────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-sm text-foreground truncate">
        {value ?? <span className="text-muted-foreground/50">—</span>}
      </span>
    </div>
  );
}
