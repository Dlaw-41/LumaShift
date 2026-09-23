-- Run this in the Supabase SQL Editor for a fresh LumaShift project.
-- Public visitors may insert responses but cannot read them.
create extension if not exists pgcrypto;

create table public.light_sensitivity_yes_responses (
  id uuid primary key default gen_random_uuid(),
  bother_frequency text not null check (bother_frequency in ('Never', 'Rarely', 'Monthly', 'Weekly', 'Daily')),
  last_incident text,
  actions_taken text[] not null default '{}',
  spending_details text,
  work_environment text not null check (work_environment in ('Work from home', 'Office', 'Both')),
  email text,
  created_at timestamptz not null default now()
);

create table public.light_sensitivity_no_responses (
  id uuid primary key default gen_random_uuid(),
  adjustment_details text,
  work_environment text not null check (work_environment in ('Work from home', 'Office', 'Both')),
  email text,
  created_at timestamptz not null default now()
);

alter table public.light_sensitivity_yes_responses enable row level security;
alter table public.light_sensitivity_no_responses enable row level security;

revoke all on table public.light_sensitivity_yes_responses from anon, authenticated;
revoke all on table public.light_sensitivity_no_responses from anon, authenticated;

grant insert on table public.light_sensitivity_yes_responses to anon;
grant insert on table public.light_sensitivity_no_responses to anon;

create policy "anonymous yes-path survey inserts"
on public.light_sensitivity_yes_responses
for insert to anon
with check (work_environment in ('Work from home', 'Office', 'Both'));

create policy "anonymous no-path survey inserts"
on public.light_sensitivity_no_responses
for insert to anon
with check (work_environment in ('Work from home', 'Office', 'Both'));
