-- LumaShift landing page capture. Apply only to Supabase project tuybiqvthzoguctujzmh.
create table if not exists public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(email) <= 254),
  visitor_id uuid not null,
  signup_token uuid not null unique,
  headline_variant text not null check (headline_variant in ('A','B','C')),
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  referrer text not null default '',
  device_type text not null default '',
  cta_location text not null check (cta_location in ('top','bottom')),
  created_at timestamptz not null default now()
);
create table if not exists public.landing_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  event_name text not null check (event_name in ('visit','cta_click','scene_reach','survey_question')),
  headline_variant text not null check (headline_variant in ('A','B','C')),
  utm_source text not null default '',
  cta_location text check (cta_location in ('top','sticky','bottom')),
  scene text,
  question_id text,
  survey_action text check (survey_action in ('answered','skipped')),
  created_at timestamptz not null default now()
);
create table if not exists public.post_signup_surveys (
  id uuid primary key default gen_random_uuid(),
  signup_token uuid not null unique,
  visitor_id uuid not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists landing_events_visitor_idx on public.landing_events(visitor_id);
create index if not exists landing_events_created_idx on public.landing_events(created_at);
alter table public.early_access_signups enable row level security;
alter table public.landing_events enable row level security;
alter table public.post_signup_surveys enable row level security;
revoke all on public.early_access_signups, public.landing_events, public.post_signup_surveys from anon, authenticated;
grant insert on public.early_access_signups, public.landing_events, public.post_signup_surveys to anon;
grant usage, select on sequence public.landing_events_id_seq to anon;
create policy "public signup insert" on public.early_access_signups for insert to anon with check (true);
create policy "public analytics insert" on public.landing_events for insert to anon with check (true);
create policy "public survey insert" on public.post_signup_surveys for insert to anon with check (true);