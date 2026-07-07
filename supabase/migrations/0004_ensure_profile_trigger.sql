-- ─────────────────────────────────────────────────────────────────────────────
-- 0004 · Garantizar el trigger que crea `profiles` al registrarse + backfill
--
-- Síntoma en producción: el usuario aparecía en auth.users pero NO se creaba su
-- fila en public.profiles → getTenantCredentials no podía guardar la API key
-- (tenants huérfanos + colisiones de slug) y onboarding_completed nunca se
-- seteaba (loop dashboard↔onboarding). Causa: el trigger de 0001 quedó sin
-- aplicar (ese archivo está como .bak). Este migration lo instala de forma
-- idempotente y backfillea los perfiles faltantes.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Función: crea el perfil cuando se registra un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) Trigger en auth.users (recreado idempotentemente).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Backfill: crear el perfil de los usuarios existentes que no lo tengan.
insert into public.profiles (id, full_name, avatar_url)
select u.id,
       u.raw_user_meta_data->>'full_name',
       u.raw_user_meta_data->>'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
