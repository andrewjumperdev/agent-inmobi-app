import { AppSidebar } from "@/components/app-sidebar";
import { AriaWidget } from "@/components/dashboard/aria-widget";
import { createClient } from "@/lib/supabase/server";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { koreGet } from "@/lib/kore/server";
import type { MetricsSnapshot } from "@/lib/kore/client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, onboarding_completed")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Una sola lectura para los contadores del sidebar: /metrics ya trae el total
  // de contactos (suma de la distribución de temperatura) y la cola humana, así
  // que no hace falta pedir la lista de contactos en cada página.
  const metrics = await koreGet<MetricsSnapshot | null>("/metrics", null);
  const navCounts = {
    crm: metrics
      ? Object.values(metrics.temperature_distribution || {}).reduce((a, b) => a + b, 0)
      : 0,
    seguimiento: metrics?.open_escalations ?? 0,
  };

  const userProfile = {
    name:
      (profile as { full_name?: string } | null)?.full_name ??
      user?.user_metadata?.full_name ??
      user?.email?.split("@")[0] ??
      undefined,
    first_time: !(
      (profile as { onboarding_completed?: boolean } | null)
        ?.onboarding_completed ?? false
    ),
  };

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar userName={userProfile.name} counts={navCounts} />
        <SidebarInset>
          <main className="flex flex-1 flex-col min-h-svh">{children}</main>
        </SidebarInset>
        <AriaWidget userProfile={userProfile} />
      </SidebarProvider>
    </TooltipProvider>
  );
}
