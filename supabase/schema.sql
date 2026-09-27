-- Osteofides Performance Monitor prototype schema
-- This public demo policy is suitable ONLY for synthetic assignment data.
-- Do not store patient information or deploy these policies for clinical use.

create table if not exists public.safety_events (
  id uuid primary key default gen_random_uuid(),
  case_id text not null check (char_length(case_id) between 1 and 40),
  procedure_name text not null check (char_length(procedure_name) <= 100),
  occurred_at timestamptz not null default now(),
  event_type text not null check (char_length(event_type) between 1 and 120),
  severity text not null check (severity in ('High', 'Medium', 'Low')),
  system_action text not null check (char_length(system_action) between 1 and 120),
  response_time_ms integer check (response_time_ms is null or response_time_ms between 0 and 60000),
  outcome text not null check (outcome in (
    'Successful intervention',
    'Warning issued',
    'Manual review required',
    'Unsuccessful response'
  )),
  status text not null default 'Active' check (status in ('Active', 'Resolved')),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists safety_events_occurred_at_idx
  on public.safety_events (occurred_at desc);
create index if not exists safety_events_case_id_idx
  on public.safety_events (case_id);

alter table public.safety_events enable row level security;

-- Idempotent setup for the assignment prototype. Open CRUD access is intentional
-- only because every record is synthetic and no authentication is in scope.
drop policy if exists "prototype can read synthetic events" on public.safety_events;
drop policy if exists "prototype can add synthetic events" on public.safety_events;
drop policy if exists "prototype can update synthetic events" on public.safety_events;
drop policy if exists "prototype can delete synthetic events" on public.safety_events;

create policy "prototype can read synthetic events"
  on public.safety_events for select to anon using (true);
create policy "prototype can add synthetic events"
  on public.safety_events for insert to anon with check (true);
create policy "prototype can update synthetic events"
  on public.safety_events for update to anon using (true) with check (true);
create policy "prototype can delete synthetic events"
  on public.safety_events for delete to anon using (true);

grant select, insert, update, delete on public.safety_events to anon;
grant usage on schema public to anon;

-- Optional synthetic seed data for a first connected dashboard view.
insert into public.safety_events
  (id, case_id, procedure_name, occurred_at, event_type, severity, system_action, response_time_ms, outcome, status, notes)
values
  ('f1a580d1-756d-40dc-8eac-000000000001', 'CASE-2026-018', 'Total Knee Arthroplasty', now() - interval '3 hours', 'Restricted-zone proximity', 'High', 'Motion paused', 84, 'Successful intervention', 'Resolved', 'Synthetic demo record.'),
  ('f1a580d1-756d-40dc-8eac-000000000002', 'CASE-2026-018', 'Total Knee Arthroplasty', now() - interval '2 hours 57 minutes', 'Instrument tracking loss', 'Medium', 'Hold position; tracking reacquired', 126, 'Successful intervention', 'Resolved', 'Synthetic demo record.'),
  ('f1a580d1-756d-40dc-8eac-000000000003', 'CASE-2026-017', 'Total Hip Arthroplasty', now() - interval '1 day', 'Trajectory deviation', 'High', 'Trajectory rejected', 71, 'Manual review required', 'Active', 'Synthetic demo record.')
on conflict (id) do nothing;
