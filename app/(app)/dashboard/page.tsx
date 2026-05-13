import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { DashboardKPI } from "@/components/dashboard/kpi";
import { AgentGrid } from "@/components/dashboard/agent-grid";
import { PortfolioMap } from "@/components/dashboard/portfolio-map";
import { UserDropdown } from "@/components/cuenta/user-dropdown";

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

  const userName =
    p?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "usuario";

  const isFirstTime = !(p?.onboarding_completed ?? false);

  const navUser = {
    name: p?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0],
    email: p?.email ?? user?.email ?? undefined,
    avatarUrl: p?.avatar_url ?? user?.user_metadata?.avatar_url ?? undefined,
    plan: p?.subscription_plan ?? undefined,
    status: p?.subscription_status ?? undefined,
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-svh"
      style={{ backgroundColor: "#060609", color: "#f1f5f9" }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6"
        style={{
          backgroundColor: "#080812",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 0 20px rgba(59,130,246,0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" style={{ color: "#94a3b8" }} />
          <Separator orientation="vertical" className="h-4 opacity-30" />
          <span
            className="font-headline text-sm font-bold uppercase tracking-tighter"
            style={{ color: "#3b82f6" }}
          >
            KORE AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="relative hidden sm:block">
            <span
              className="material-symbols-outlined cursor-pointer text-xl"
              style={{ color: "#94a3b8" }}
            >
              sensors
            </span>
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full"
              style={{ backgroundColor: "#3b82f6" }}
            />
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: "#3b82f6" }}
            />
          </div>
          <span
            className="material-symbols-outlined cursor-pointer text-xl"
            style={{ color: "#94a3b8" }}
          >
            notifications
          </span>
          <span
            className="material-symbols-outlined cursor-pointer text-xl"
            style={{ color: "#94a3b8" }}
          >
            settings
          </span>

          {/* User avatar dropdown */}
          <UserDropdown user={navUser} variant="navbar" />
        </div>
      </header>

      {/* Dashboard canvas */}
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <DashboardKPI />
        <AgentGrid />
        <PortfolioMap />
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
