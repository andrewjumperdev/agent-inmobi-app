-- ─────────────────────────────────────────────────────────────────────────────
-- 0003 · Binding usuario Supabase ↔ tenant del backend KORE IA (FastAPI)
--
-- Cada perfil queda vinculado a su tenant del backend. La API key (kore_…) es un
-- SECRETO: se escribe/lee únicamente server-side con la service-role key. El
-- REVOKE de abajo impide que el rol del cliente (anon/authenticated) la lea aun
-- cuando una policy RLS permita SELECT de la propia fila.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists kore_tenant_id uuid,
  add column if not exists kore_api_key   text;

comment on column public.profiles.kore_tenant_id is
  'ID del tenant en el backend KORE IA (FastAPI).';
comment on column public.profiles.kore_api_key is
  'API key del tenant (kore_…). Secreto — solo acceso server-side vía service role.';

-- Endurecimiento: el secreto nunca debe viajar al navegador.
revoke select (kore_api_key) on public.profiles from anon, authenticated;
