import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { CrmBoard } from "@/components/crm/crm-board";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default async function CrmPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = user
    ? await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  const safeLeads: Lead[] = (leads ?? []) as Lead[];

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
            group
          </span>
          <h1
            className="font-headline text-sm font-bold uppercase tracking-tight"
            style={{ color: "#dae2fd" }}
          >
            CRM
          </h1>
        </div>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: "#45464d" }}>
          Pipeline de ventas
        </span>
      </header>

      <CrmBoard leads={safeLeads} />
    </div>
  );
}
