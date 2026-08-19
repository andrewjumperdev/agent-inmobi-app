import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { DashboardReal } from "@/components/dashboard/metrics-real";
import { koreGet } from "@/lib/kore/server";
import type { ContactOut, MetricsSnapshot } from "@/lib/kore/client";
import { UserDropdown } from "@/components/cuenta/user-dropdown";
import { Greeting } from "@/components/dashboard/greeting";
import Link from "next/link";

const EMPTY_METRICS: MetricsSnapshot = {
  leads_new_7d: 0,
  leads_prev_7d: 0,
  leads_daily: [],
  temperature_distribution: {},
  auto_classification_rate: 0,
  cold_share: 0,
  plaud_leads: 0,
  open_escalations: 0,
  mrr_cents: 0,
  subscription_status: "none",
  alerts: [],
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, onboarding_completed, avatar_url, email, subscription_plan, subscription_status")
        .eq("id", user.id)
        .single()
    : { data: null };

  type ProfileRow = {
    full_name?: string | null;
    onboarding_completed?: boolean | null;
    avatar_url?: string | null;
    email?: string | null;
    subscription_plan?: string | null;
    subscription_status?: string | null;
  };

  const p = profile as ProfileRow | null;

  // Las dos lecturas en paralelo: son independientes y secuenciarlas sumaría
  // el round-trip de una a la otra en el render del servidor.
  const [metrics, contacts] = await Promise.all([
    koreGet<MetricsSnapshot>("/metrics", EMPTY_METRICS),
    koreGet<ContactOut[]>("/contacts", []),
  ]);

  const userName =
    p?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "usuario";

  const isFirstTime = !(p?.onboarding_completed ?? false);

  const hotCount = contacts.filter((c) => c.temperature === "hot").length;
  const summary = [
    `${metrics.leads_new_7d} lead${metrics.leads_new_7d === 1 ? "" : "s"} esta semana`,
    hotCount > 0 ? `${hotCount} ${hotCount === 1 ? "está caliente" : "están calientes"}` : null,
    metrics.open_escalations > 0
      ? `${metrics.open_escalations} ${metrics.open_escalations === 1 ? "espera" : "esperan"} tu decisión`
      : null,
  ]
    .filter(Boolean)
    .join(". ") + ".";

  const navUser = {
    name: p?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0],
    email: p?.email ?? user?.email ?? undefined,
    avatarUrl: p?.avatar_url ?? user?.user_metadata?.avatar_url ?? undefined,
    plan: p?.subscription_plan ?? undefined,
    status: p?.subscription_status ?? undefined,
  };

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Dashboard" icon="space_dashboard">
        {/* Indicador de sistema activo. El punto que late es decorativo; el
            texto es lo que comunica el estado a un lector de pantalla. */}
        <span className="mr-2 hidden items-center gap-2 rounded-full border border-app-border px-2.5 py-1 sm:flex">
          <span className="relative flex size-1.5" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest text-muted-foreground">
            En vivo
          </span>
        </span>

        <UserDropdown user={navUser} variant="navbar" />
      </PageHeader>

      {/* Lienzo del dashboard */}
      <div className="flex-1 space-y-4 p-4 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Greeting name={userName} />
            {/* Resumen en una frase: los mismos números que las tarjetas, pero
                leídos como una situación. Es lo que alguien contestaría si le
                preguntaran "¿cómo viene?" — las tarjetas responden el detalle. */}
            <p className="mt-[3px] font-headline text-[13px] text-muted-foreground">
              {summary}
            </p>
          </div>
          {/* Solo acciones reales. El mockup incluía "Exportar", que no existe:
              un botón que no hace nada es peor que su ausencia. */}
          <Link
            href="/crm"
            className="rounded-[9px] bg-info px-3.5 py-[7px] font-headline text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            Ver CRM
          </Link>
        </div>
        <DashboardReal metrics={metrics} contacts={contacts} />
      </div>

      {/* Pass context to widget via data attributes for hydration */}
      <div
        id="aria-context"
        data-name={userName}
        data-first-time={String(isFirstTime)}
        className="hidden"
      />
    </div>
  );
}
