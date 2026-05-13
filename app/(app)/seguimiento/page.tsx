import { createClient } from "@/lib/supabase/server";
import { SeguimientoView } from "@/components/seguimiento/seguimiento-view";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export type LiveExecution = {
  id: string;
  lead_id: string;
  sequence_id: string;
  current_step: number;
  status: "active" | "paused";
  next_step_at: string;
  created_at: string;
  lead: {
    name: string;
    phone: string | null;
    email: string | null;
    urgency: string | null;
    zone_interest: string | null;
    notes: string | null;
    property_type: string | null;
  };
};

export type CompletedExecution = {
  id: string;
  lead_id: string;
  current_step: number;
  status: "completed" | "cancelled";
  created_at: string;
  completed_at: string | null;
  lead: {
    name: string;
    urgency: string | null;
    zone_interest: string | null;
    property_type: string | null;
  };
};

export default async function SeguimientoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fall back to empty arrays if not authenticated
  if (!user) {
    return <SeguimientoView active={[]} completed={[]} availableLeads={[]} />;
  }

  // Fetch active executions joined with lead data
  const { data: rawActive } = await supabase
    .from("followup_executions" as keyof Database["public"]["Tables"])
    .select(`
      id, lead_id, sequence_id, current_step, status, next_step_at, created_at,
      leads ( name, phone, email, urgency, zone_interest, notes, property_type )
    `)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: false });

  // Fetch completed/cancelled executions (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rawCompleted } = await supabase
    .from("followup_executions" as keyof Database["public"]["Tables"])
    .select(`
      id, lead_id, current_step, status, created_at, completed_at,
      leads ( name, urgency, zone_interest, property_type )
    `)
    .in("status", ["completed", "cancelled"])
    .gte("completed_at", thirtyDaysAgo)
    .order("completed_at", { ascending: false })
    .limit(20);

  // Fetch leads without an active sequence (to offer starting one)
  const activeLeadIds = ((rawActive ?? []) as unknown as { lead_id: string }[])
    .map((e) => e.lead_id);

  const { data: rawLeads } = await supabase
    .from("leads")
    .select("id, name, urgency, zone_interest, property_type, pipeline_stage")
    .eq("user_id", user.id)
    .not("pipeline_stage", "eq", "cerrado")
    .order("created_at", { ascending: false })
    .limit(50);

  const availableLeads = ((rawLeads ?? []) as Lead[]).filter(
    (l) => !activeLeadIds.includes(l.id)
  );

  return (
    <SeguimientoView
      active={(rawActive ?? []) as unknown as LiveExecution[]}
      completed={(rawCompleted ?? []) as unknown as CompletedExecution[]}
      availableLeads={availableLeads}
    />
  );
}
