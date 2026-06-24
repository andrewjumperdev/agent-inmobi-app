import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ── GET /api/seguimiento ───────────────────────────────────── */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("followup_executions")
    .select(`
      id,
      lead_id,
      sequence_id,
      current_step,
      status,
      next_step_at,
      started_at,
      created_at,
      leads (
        id,
        name,
        phone,
        email,
        urgency,
        zone_interest,
        notes,
        property_type
      )
    `)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ executions: data ?? [] });
}

/* ── POST /api/seguimiento ──────────────────────────────────── */
// Body: { lead_id: string, sequence_id?: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { lead_id, sequence_id } = body ?? {};

  if (!lead_id) {
    return NextResponse.json({ error: "lead_id es requerido" }, { status: 400 });
  }

  // Verify lead belongs to user
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id")
    .eq("id", lead_id)
    .eq("user_id", user.id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  // Resolve sequence: use provided UUID or fall back to first active global sequence
  let resolvedSequenceId = sequence_id as string | undefined;

  if (!resolvedSequenceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: defaultSeq } = await (supabase as any)
      .from("followup_sequences")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single();

    resolvedSequenceId = (defaultSeq as unknown as { id: string } | null)?.id;
  }

  if (!resolvedSequenceId) {
    return NextResponse.json(
      { error: "No hay secuencias activas. Corré la migración 0002 en Supabase." },
      { status: 422 }
    );
  }

  // Check if lead already has an active execution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("followup_executions")
    .select("id")
    .eq("lead_id", lead_id)
    .in("status", ["active", "paused"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Este lead ya tiene una secuencia activa." },
      { status: 409 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: execution, error: insertError } = await (supabase as any)
    .from("followup_executions")
    .insert({
      lead_id,
      sequence_id: resolvedSequenceId,
      current_step: 1,
      status: "active",
      next_step_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ execution }, { status: 201 });
}
