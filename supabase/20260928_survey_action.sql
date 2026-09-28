-- Follow-up for the already-applied landing_capture migration.
alter table public.landing_events
add column if not exists survey_action text check (survey_action in ('answered','skipped'));