-- ============================================================
-- InMobi.ai — Schema inicial
-- ============================================================

-- ─── Extensiones ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda de texto en leads

-- ============================================================
-- DOMINIO 1: USUARIOS Y PERFILES
-- ============================================================

-- Perfil extendido de cada usuario (linked a auth.users de Supabase)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  phone         text,
  city          text,
  country       text default 'AR',
  -- Estado del onboarding
  onboarding_completed  boolean  not null default false,
  onboarding_step       integer  not null default 0,
  -- Clasificación del usuario
  user_level    text check (user_level in ('arranque', 'crecimiento', 'pro')) default 'arranque',
  level_score   integer not null default 0,
  -- Metadata
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Trigger: crear perfil automáticamente cuando se registra un usuario
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Trigger: updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- DOMINIO 2: ONBOARDING
-- ============================================================

-- Catálogo de preguntas (editable sin tocar código)
create table onboarding_questions (
  id          serial primary key,
  step        integer not null unique,  -- orden de aparición
  field_id    text    not null unique,  -- eg. 'volume', 'channel'
  question    text    not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Opciones de cada pregunta
create table onboarding_options (
  id          serial primary key,
  question_id integer not null references onboarding_questions(id) on delete cascade,
  value       text    not null,
  label       text    not null,
  description text,
  score       integer not null default 0, -- suma para calcular nivel
  sort_order  integer not null default 0
);

-- Respuestas del usuario
create table onboarding_responses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  question_id integer not null references onboarding_questions(id),
  option_value text not null,
  score       integer not null default 0,
  answered_at timestamptz not null default now(),
  unique (user_id, question_id)
);

-- Función: clasificar usuario según score acumulado
create or replace function classify_user(p_user_id uuid)
returns text language plpgsql as $$
declare
  v_score integer;
  v_level text;
begin
  select coalesce(sum(score), 0)
  into v_score
  from onboarding_responses
  where user_id = p_user_id;

  v_level := case
    when v_score >= 13 then 'pro'
    when v_score >= 6  then 'crecimiento'
    else 'arranque'
  end;

  update profiles
  set user_level = v_level, level_score = v_score, onboarding_completed = true
  where id = p_user_id;

  return v_level;
end;
$$;

-- ============================================================
-- DOMINIO 3: MÓDULOS
-- ============================================================

-- Catálogo de módulos disponibles en la plataforma
create table modules (
  id            serial primary key,
  slug          text not null unique,   -- eg. 'captacion', 'contenido'
  name          text not null,
  description   text,
  icon          text,                   -- nombre del ícono lucide
  min_level     text not null default 'arranque' check (min_level in ('arranque', 'crecimiento', 'pro')),
  sort_order    integer not null default 0,
  is_active     boolean not null default true
);

-- Módulos asignados a cada usuario (con progreso)
create table user_modules (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  module_id   integer not null references modules(id),
  unlocked    boolean not null default false,
  progress    integer not null default 0 check (progress between 0 and 100),
  unlocked_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, module_id)
);

-- Función: asignar módulos según nivel del usuario
create or replace function assign_modules(p_user_id uuid)
returns void language plpgsql as $$
declare
  v_level text;
begin
  select user_level into v_level from profiles where id = p_user_id;

  insert into user_modules (user_id, module_id, unlocked)
  select
    p_user_id,
    m.id,
    case
      when v_level = 'pro'        then true
      when v_level = 'crecimiento' and m.min_level in ('arranque', 'crecimiento') then true
      when v_level = 'arranque'   and m.min_level = 'arranque' then true
      else false
    end
  from modules m
  where m.is_active = true
  on conflict (user_id, module_id) do nothing;
end;
$$;

-- ============================================================
-- DOMINIO 4: WHATSAPP / CAPTACIÓN
-- ============================================================

-- Instancia de Evolution API por usuario
create table whatsapp_instances (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references profiles(id) on delete cascade,
  instance_name   text not null unique, -- eg. 'inmobi_user123'
  status          text not null default 'disconnected'
                  check (status in ('disconnected', 'connecting', 'connected', 'error')),
  phone_number    text,                 -- número vinculado, llena Evolution API al conectar
  qr_code         text,                 -- base64 del QR actual
  qr_expires_at   timestamptz,
  last_seen       timestamptz,
  connected_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger whatsapp_instances_updated_at
  before update on whatsapp_instances
  for each row execute function set_updated_at();

-- ============================================================
-- DOMINIO 5: CRM — LEADS
-- ============================================================

create table leads (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  -- Datos del lead
  name            text,
  phone           text not null,        -- índice, es la clave de lookup desde Evolution
  email           text,
  source          text default 'whatsapp' check (source in ('whatsapp', 'portal', 'social', 'referral', 'manual')),
  -- Pipeline
  stage           text not null default 'nuevo'
                  check (stage in ('nuevo', 'contactado', 'calificado', 'cita', 'negociacion', 'cerrado', 'perdido')),
  -- Score del agente IA (0-100)
  ai_score        integer check (ai_score between 0 and 100),
  score_label     text check (score_label in ('frio', 'tibio', 'caliente')),
  -- Contexto
  property_interest text,              -- descripción libre de lo que busca
  budget_min      numeric,
  budget_max      numeric,
  notes           text,
  -- Tiempos
  last_contact_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index leads_user_id_idx on leads(user_id);
create index leads_phone_idx   on leads(phone);         -- lookup rápido desde Evolution API
create index leads_stage_idx   on leads(user_id, stage);
create index leads_score_idx   on leads(user_id, ai_score desc);

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- ============================================================
-- DOMINIO 6: CONVERSACIONES WHATSAPP
-- ============================================================

create table conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  lead_id     uuid references leads(id) on delete set null,
  phone       text not null,
  is_active   boolean not null default true,
  started_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index conversations_lead_id_idx on conversations(lead_id);
create index conversations_phone_idx   on conversations(phone);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function set_updated_at();

create table messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('lead', 'agent', 'user')), -- lead=humano, agent=IA, user=el inmobiliario
  content         text not null,
  evolution_msg_id text,               -- ID del mensaje en Evolution API
  sent_at         timestamptz not null default now()
);

create index messages_conversation_id_idx on messages(conversation_id);
create index messages_sent_at_idx         on messages(conversation_id, sent_at);

-- ============================================================
-- DOMINIO 7: SEGUIMIENTO AUTOMÁTICO
-- ============================================================

create table followup_sequences (
  id          serial primary key,
  user_id     uuid references profiles(id) on delete cascade, -- null = secuencia global
  name        text not null,
  trigger_stage text not null,          -- etapa del lead que activa la secuencia
  is_active   boolean not null default true
);

create table followup_steps (
  id              serial primary key,
  sequence_id     integer not null references followup_sequences(id) on delete cascade,
  step_number     integer not null,
  delay_hours     integer not null default 24,
  message_template text not null,
  unique (sequence_id, step_number)
);

create table followup_executions (
  id              uuid primary key default uuid_generate_v4(),
  lead_id         uuid not null references leads(id) on delete cascade,
  sequence_id     integer not null references followup_sequences(id),
  current_step    integer not null default 1,
  status          text not null default 'pending' check (status in ('pending', 'running', 'completed', 'paused', 'cancelled')),
  next_step_at    timestamptz not null,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index followup_executions_next_step_idx on followup_executions(next_step_at)
  where status = 'pending'; -- índice parcial, solo pendientes

-- ============================================================
-- DOMINIO 8: PROPIEDADES
-- ============================================================

create table properties (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  title           text not null,
  type            text check (type in ('venta', 'alquiler', 'alquiler_temporal')),
  property_type   text check (property_type in ('casa', 'departamento', 'terreno', 'local', 'oficina', 'otro')),
  price           numeric,
  currency        text default 'USD',
  location        text,
  neighborhood    text,
  city            text,
  bedrooms        integer,
  bathrooms       integer,
  area_m2         numeric,
  description     text,
  features        text[],              -- ['pileta', 'cochera', 'parrilla']
  images          text[],              -- URLs de Supabase Storage
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index properties_user_id_idx on properties(user_id) where is_active = true;

create trigger properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

-- ============================================================
-- DOMINIO 9: CONTENIDO
-- ============================================================

create table content_posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  platform    text check (platform in ('instagram', 'facebook', 'whatsapp_status', 'linkedin')),
  content     text not null,
  hashtags    text[],
  status      text not null default 'draft' check (status in ('draft', 'approved', 'published')),
  generated_at timestamptz not null default now(),
  published_at timestamptz
);

create index content_posts_user_id_idx on content_posts(user_id);

-- ============================================================
-- DOMINIO 10: AI COACH — CHAT
-- ============================================================

create table coach_conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null unique references profiles(id) on delete cascade, -- 1 conversación por usuario
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger coach_conversations_updated_at
  before update on coach_conversations
  for each row execute function set_updated_at();

create table coach_messages (
  id                  uuid primary key default uuid_generate_v4(),
  conversation_id     uuid not null references coach_conversations(id) on delete cascade,
  role                text not null check (role in ('user', 'assistant')),
  content             text not null,
  tokens_used         integer,
  created_at          timestamptz not null default now()
);

create index coach_messages_conversation_idx on coach_messages(conversation_id, created_at);

-- ============================================================
-- DOMINIO 11: NOTIFICACIONES
-- ============================================================

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,           -- 'whatsapp_disconnected', 'hot_lead', 'followup_due'
  title       text not null,
  body        text,
  action_url  text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_id_idx on notifications(user_id, is_read, created_at desc);

-- ============================================================
-- DOMINIO 12: BILLING
-- ============================================================

create table subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  stripe_customer_id  text unique,
  stripe_subscription_id text unique,
  plan                text not null default 'trial' check (plan in ('trial', 'starter', 'growth', 'pro')),
  status              text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  trial_ends_at       timestamptz default (now() + interval '14 days'),
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- Trigger: crear suscripción de trial cuando se crea un perfil
create or replace function handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into subscriptions (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on profiles
  for each row execute function handle_new_profile();

-- ============================================================
-- DOMINIO 13: AUDITORÍA IA
-- ============================================================

create table ai_audit_log (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  agent           text not null,       -- 'coach', 'whatsapp', 'content', 'qualify'
  model           text not null,       -- 'gpt-4o', 'gpt-4o-mini'
  prompt_tokens   integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens    integer not null default 0,
  cost_usd        numeric(10,6),
  created_at      timestamptz not null default now()
);

create index ai_audit_log_user_idx on ai_audit_log(user_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles              enable row level security;
alter table onboarding_responses  enable row level security;
alter table user_modules          enable row level security;
alter table whatsapp_instances    enable row level security;
alter table leads                 enable row level security;
alter table conversations         enable row level security;
alter table messages              enable row level security;
alter table followup_executions   enable row level security;
alter table properties            enable row level security;
alter table content_posts         enable row level security;
alter table coach_conversations   enable row level security;
alter table coach_messages        enable row level security;
alter table notifications         enable row level security;
alter table subscriptions         enable row level security;

-- Política: cada usuario solo ve y modifica sus propios datos
create policy "users_own_data" on profiles
  for all using (auth.uid() = id);

create policy "users_own_data" on onboarding_responses
  for all using (auth.uid() = user_id);

create policy "users_own_data" on user_modules
  for all using (auth.uid() = user_id);

create policy "users_own_data" on whatsapp_instances
  for all using (auth.uid() = user_id);

create policy "users_own_data" on leads
  for all using (auth.uid() = user_id);

create policy "users_own_data" on conversations
  for all using (auth.uid() = user_id);

create policy "users_own_data" on messages
  for all using (
    exists (select 1 from conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );

create policy "users_own_data" on followup_executions
  for all using (
    exists (select 1 from leads l where l.id = lead_id and l.user_id = auth.uid())
  );

create policy "users_own_data" on properties
  for all using (auth.uid() = user_id);

create policy "users_own_data" on content_posts
  for all using (auth.uid() = user_id);

create policy "users_own_data" on coach_conversations
  for all using (auth.uid() = user_id);

create policy "users_own_data" on coach_messages
  for all using (
    exists (select 1 from coach_conversations cc where cc.id = conversation_id and cc.user_id = auth.uid())
  );

create policy "users_own_data" on notifications
  for all using (auth.uid() = user_id);

create policy "users_own_data" on subscriptions
  for all using (auth.uid() = user_id);

-- Módulos y preguntas: lectura pública (sin datos sensibles)
alter table modules               enable row level security;
alter table onboarding_questions  enable row level security;
alter table onboarding_options    enable row level security;

create policy "public_read" on modules              for select using (true);
create policy "public_read" on onboarding_questions for select using (is_active = true);
create policy "public_read" on onboarding_options   for select using (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Módulos base
insert into modules (slug, name, description, icon, min_level, sort_order) values
  ('captacion',   'Captación',           'Agente WhatsApp que califica leads 24/7',             'Magnet',        'arranque',    1),
  ('crm',         'CRM',                 'Pipeline visual de leads con Kanban',                  'Users',         'arranque',    2),
  ('contenido',   'Contenido',           'Generador de posts para redes sociales',               'FileText',      'arranque',    3),
  ('coach',       'AI Coach',            'Estratega personal con IA que te guía a diario',       'BotMessageSquare', 'arranque', 4),
  ('analytics',   'Analytics',           'Métricas de conversión y rendimiento',                 'BarChart3',     'crecimiento', 5),
  ('seguimiento', 'Seguimiento',         'Secuencias automáticas de follow-up',                  'Bell',          'crecimiento', 6),
  ('propiedades', 'Propiedades',         'Catálogo de propiedades para el agente IA',            'Building2',     'arranque',    7);

-- Preguntas de onboarding
insert into onboarding_questions (step, field_id, question) values
  (1, 'volume',  '¿Cuántos leads generás por mes?'),
  (2, 'channel', '¿Desde dónde captás más leads hoy?'),
  (3, 'pain',    '¿Qué te consume más tiempo?'),
  (4, 'team',    '¿Trabajás solo o con equipo?');

-- Opciones con scores
insert into onboarding_options (question_id, value, label, description, score, sort_order) values
  -- Volumen
  (1, '0-10',   'Menos de 10',      'Recién arrancando',  1, 1),
  (1, '10-30',  'Entre 10 y 30',    'Creciendo',          3, 2),
  (1, '30-100', 'Entre 30 y 100',   'Escala media',       5, 3),
  (1, '100+',   'Más de 100',       'Equipo activo',      7, 4),
  -- Canal
  (2, 'whatsapp',  'WhatsApp directo',                      null, 2, 1),
  (2, 'portals',   'Portales (Zonaprop, MercadoLibre)',      null, 3, 2),
  (2, 'social',    'Redes sociales',                         null, 2, 3),
  (2, 'referrals', 'Referidos / boca en boca',               null, 1, 4),
  -- Pain point
  (3, 'followup',     'Hacer seguimiento de leads',          null, 2, 1),
  (3, 'content',      'Generar contenido para redes',        null, 1, 2),
  (3, 'qualify',      'Calificar si un lead es serio',       null, 2, 3),
  (3, 'coordination', 'Coordinar visitas y reuniones',       null, 1, 4),
  -- Equipo
  (4, 'solo',   'Solo/a',              null, 1, 1),
  (4, 'small',  'Con 1 o 2 personas',  null, 2, 2),
  (4, 'medium', 'Equipo de 3 a 10',    null, 4, 3),
  (4, 'large',  'Más de 10 personas',  null, 6, 4);
