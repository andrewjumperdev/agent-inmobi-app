-- Run this in Supabase SQL Editor:
-- supabase.com → project → SQL Editor → New query → paste → Run

-- ── 1. Insert default global sequence ──────────────────────────
insert into followup_sequences (name, trigger_score, is_active)
values ('Secuencia estándar 7 días', 'hot', true)
on conflict do nothing;

-- ── 2. Seed the 5 steps ─────────────────────────────────────────
do $$
declare
  seq_id uuid;
begin
  select id into seq_id
  from followup_sequences
  where name = 'Secuencia estándar 7 días'
  limit 1;

  insert into followup_steps (sequence_id, step_number, delay_hours, message_template)
  values
    (seq_id, 1,   0, 'Respuesta inmediata — Día 1'),
    (seq_id, 2,  24, 'Seguimiento — Día 2'),
    (seq_id, 3,  48, 'Contenido de valor — Día 3'),
    (seq_id, 4, 120, 'Reactivación — Día 5'),
    (seq_id, 5, 168, 'Cierre de secuencia — Día 7')
  on conflict do nothing;
end $$;

-- ── 3. RLS policies for followup_executions ─────────────────────
alter table followup_executions enable row level security;

create policy "Users see own executions via leads"
  on followup_executions for select
  using (
    exists (
      select 1 from leads
      where leads.id = followup_executions.lead_id
        and leads.user_id = auth.uid()
    )
  );

create policy "Users insert own executions"
  on followup_executions for insert
  with check (
    exists (
      select 1 from leads
      where leads.id = followup_executions.lead_id
        and leads.user_id = auth.uid()
    )
  );

create policy "Users update own executions"
  on followup_executions for update
  using (
    exists (
      select 1 from leads
      where leads.id = followup_executions.lead_id
        and leads.user_id = auth.uid()
    )
  );
