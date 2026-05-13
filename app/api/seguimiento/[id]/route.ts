import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TOTAL_STEPS = 5;

/* ── PATCH /api/seguimiento/[id] ────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const { action } = body ?? {};

  if (!["advance", "pause", "resume", "cancel"].includes(action)) {
    return NextResponse.json(
      { error: "action debe ser: advance | pause | resume | cancel" },
      { status: 400 }
    );
  }

  // Fetch execution — RLS ensures the lead belongs to this user
  const { data: raw, error: fetchError } = await supabase
    .from("followup_executions" as "leads")
    .select("id, current_step, status, lead_id")
    .eq("id", id)
    .single();

  if (fetchError || !raw) {
    return NextResponse.json({ error: "Ejecución no encontrada" }, { status: 404 });
  }

  const exec = raw as unknown as {
    id: string;
    current_step: number;
    status: string;
    lead_id: string;
  };

  let patch: Record<string, unknown> = {};

  if (action === "advance") {
    const nextStep = exec.current_step + 1;
    if (nextStep > TOTAL_STEPS) {
      patch = { status: "completed", completed_at: new Date().toISOString() };
    } else {
      const nextStepAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      patch = { current_step: nextStep, status: "active", next_step_at: nextStepAt };
    }
  } else if (action === "pause") {
    patch = { status: "paused" };
  } else if (action === "resume") {
    patch = { status: "active", next_step_at: new Date().toISOString() };
  } else if (action === "cancel") {
    patch = { status: "cancelled", completed_at: new Date().toISOString() };
  }

  const { data: updated, error: updateError } = await supabase
    .from("followup_executions" as "leads")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ execution: updated });
}
