
-- 1) Helper to identify admins based on profiles.permissions = 'admin'
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = _user_id
      and p.permissions = 'admin'
  );
$$;

-- 2) PROFILES
alter table public.profiles enable row level security;

drop policy if exists "Public access to all data" on public.profiles;

-- Admins: full access
create policy "Admins can manage all profiles"
on public.profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Users: read their own profile
create policy "Users can select their profile"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

-- Users: insert their profile (supports pre-session via existing helper)
create policy "Users can insert their profile"
on public.profiles
for insert
to public
with check (public.can_create_profile(user_id, email));

-- Users: update their own profile
create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- 3) PROPERTIES
alter table public.properties enable row level security;

drop policy if exists "Public access to all data" on public.properties;
drop policy if exists "Allow public read access to properties (temp)" on public.properties;

create policy "Admins can manage all properties"
on public.properties
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their properties"
on public.properties
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their properties"
on public.properties
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their properties"
on public.properties
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their properties"
on public.properties
for delete
to authenticated
using (user_id = auth.uid());

-- 4) PROTESTS (scope via property ownership)
alter table public.protests enable row level security;

drop policy if exists "Public access to all data" on public.protests;

create policy "Admins can manage all protests"
on public.protests
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their protests"
on public.protests
for select
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = public.protests.property_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can insert protests for their properties"
on public.protests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can update their protests"
on public.protests
for update
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = public.protests.property_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = public.protests.property_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can delete their protests"
on public.protests
for delete
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = public.protests.property_id
      and p.user_id = auth.uid()
  )
);

-- 5) APPLICATIONS
alter table public.applications enable row level security;

drop policy if exists "Public access to all data" on public.applications;

create policy "Admins can manage all applications"
on public.applications
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their applications"
on public.applications
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their applications"
on public.applications
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their applications"
on public.applications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their applications"
on public.applications
for delete
to authenticated
using (user_id = auth.uid());

-- 6) EVIDENCE UPLOADS (scope via property ownership)
alter table public.evidence_uploads enable row level security;

drop policy if exists "Public access to all evidence data" on public.evidence_uploads;

create policy "Admins can manage all evidence"
on public.evidence_uploads
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their evidence"
on public.evidence_uploads
for select
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = public.evidence_uploads.property_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can insert evidence for their properties"
on public.evidence_uploads
for insert
to authenticated
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can update their evidence"
on public.evidence_uploads
for update
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = public.evidence_uploads.property_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = public.evidence_uploads.property_id
      and p.user_id = auth.uid()
  )
);

create policy "Users can delete their evidence"
on public.evidence_uploads
for delete
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = public.evidence_uploads.property_id
      and p.user_id = auth.uid()
  )
);

-- 7) CUSTOMER DOCUMENTS
alter table public.customer_documents enable row level security;

drop policy if exists "Public access to all data" on public.customer_documents;

create policy "Admins can manage all customer documents"
on public.customer_documents
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their documents"
on public.customer_documents
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their documents"
on public.customer_documents
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their documents"
on public.customer_documents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their documents"
on public.customer_documents
for delete
to authenticated
using (user_id = auth.uid());

-- 8) OWNERS
alter table public.owners enable row level security;

drop policy if exists "Public access to all data" on public.owners;

create policy "Admins can manage all owners"
on public.owners
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their owners"
on public.owners
for select
to authenticated
using (created_by_user_id = auth.uid());

create policy "Users can insert their owners"
on public.owners
for insert
to authenticated
with check (created_by_user_id = auth.uid());

create policy "Users can update their owners"
on public.owners
for update
to authenticated
using (created_by_user_id = auth.uid())
with check (created_by_user_id = auth.uid());

create policy "Users can delete their owners"
on public.owners
for delete
to authenticated
using (created_by_user_id = auth.uid());

-- 9) BILLS
alter table public.bills enable row level security;

drop policy if exists "Public access to all data" on public.bills;

create policy "Admins can manage all bills"
on public.bills
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can select their bills"
on public.bills
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their bills"
on public.bills
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their bills"
on public.bills
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their bills"
on public.bills
for delete
to authenticated
using (user_id = auth.uid());
