
-- Create a table to store pre-auth signup payloads
create table if not exists public.pending_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Identity
  email text not null,
  first_name text,
  last_name text,
  phone text,

  -- Address captured during signup
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  county text,
  place_id text,
  formatted_address text,

  -- Raw form payload for safety/backfill
  form_data jsonb,

  -- Optional correlation id from frontend
  signup_pid text,

  -- Flow status
  status text not null default 'pending'
);

-- Keep updated_at fresh
drop trigger if exists trg_pending_signups_set_updated_at on public.pending_signups;
create trigger trg_pending_signups_set_updated_at
before update on public.pending_signups
for each row execute function public.update_updated_at_column();

-- Indexes for common lookups
create index if not exists idx_pending_signups_email on public.pending_signups (email);
create index if not exists idx_pending_signups_status on public.pending_signups (status);
create index if not exists idx_pending_signups_created_at on public.pending_signups (created_at);

-- Enable RLS
alter table public.pending_signups enable row level security;

-- Admins can manage everything
drop policy if exists "Admins can manage all pending signups" on public.pending_signups;
create policy "Admins can manage all pending signups"
  on public.pending_signups
  for all
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- Allow anonymous (pre-auth) inserts so the hero signup can save data
drop policy if exists "Anyone can insert pending signup" on public.pending_signups;
create policy "Anyone can insert pending signup"
  on public.pending_signups
  for insert
  with check (true);

-- Let a signed-in user read their own pending record (by JWT email)
drop policy if exists "Users can view their own pending signup" on public.pending_signups;
create policy "Users can view their own pending signup"
  on public.pending_signups
  for select
  using (email = (auth.jwt() ->> 'email'));
