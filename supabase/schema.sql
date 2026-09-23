-- Run this in the Supabase SQL Editor before deploying.
-- No browser gets direct access to this table. The Vercel API uses a server-only secret key.
create extension if not exists pgcrypto;

create table if not exists public.lighting_survey_responses (
  id uuid primary key default gen_random_uuid(),
  sensitivity_branch text not null check (sensitivity_branch in ('yes', 'no')),
  bother_frequency text check (bother_frequency in ('Never', 'Rarely', 'Monthly', 'Weekly', 'Daily')),
  last_incident text,
  actions_taken text[] not null default '{}',
  spending_details text,
  adjustment_details text,
  work_environment text not null check (work_environment in ('Work from home', 'Office', 'Both')),
  email text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

alter table public.lighting_survey_responses enable row level security;
revoke all on table public.lighting_survey_responses from anon, authenticated;

grant insert on table public.lighting_survey_responses to anon;
create policy "anonymous survey submissions only"
on public.lighting_survey_responses
for insert
to anon
with check (
  sensitivity_branch in ('yes', 'no')
  and work_environment in ('Work from home', 'Office', 'Both')
);
