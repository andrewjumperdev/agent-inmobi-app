import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { CaptacionView } from "@/components/captacion/captacion-view";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default async function CaptacionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch leads for this user
  const { data: leads } = user
    ? await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const safeLeads: Lead[] = (leads ?? []) as Lead[];

  // Compute KPIs server-side
  const total       = safeLeads.length;
  const qualified   = safeLeads.filter((l) => l.score === "qualified" || l.urgency === "hot").length;
  const hot         = safeLeads.filter((l) => l.urgency === "hot").length;
  const unclassified = safeLeads.filter((l) => !l.operation_type || !l.urgency).length;

  const today = new Date().toISOString().slice(0, 10);
  const newToday = safeLeads.filter(
    (l) => l.created_at && l.created_at.slice(0, 10) === today
  ).length;

  const sourceCounts = safeLeads.reduce<Record<string, number>>((acc, l) => {
    const src = l.source ?? "directo";
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {});

  const kpis = { total, qualified, hot, unclassified, newToday, sourceCounts };

  return (
    <div
      className="flex flex-col flex-1 min-h-svh"
      style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6"
        style={{
          backgroundColor: "#0f172a",
          borderColor: "rgba(69,70,77,0.3)",
          boxShadow: "0 0 20px rgba(188,255,95,0.04)",
        }}
      >
        <SidebarTrigger className="-ml-1" style={{ color: "#c6c6cd" }} />
        <Separator orientation="vertical" className="h-4 opacity-30" />
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg" style={{ color: "#bcff5f" }}>
            person_search
          </span>
          <h1
            className="font-headline text-sm font-bold uppercase tracking-tight"
            style={{ color: "#dae2fd" }}
          >
            Captación
          </h1>
        </div>
      </header>

      <CaptacionView leads={safeLeads} kpis={kpis} />
    </div>
  );
}
