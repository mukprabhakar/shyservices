create type public.app_role as enum ('admin','employer','candidate');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  headline text,
  location text,
  resume_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare r app_role;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email);
  r := case when new.raw_user_meta_data->>'account_type' = 'employer' then 'employer'::app_role else 'candidate'::app_role end;
  insert into public.user_roles (user_id, role) values (new.id, r);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text not null,
  job_type text not null default 'Full-time',
  work_mode text not null default 'On-site',
  experience_level text not null default 'Entry Level',
  salary_min integer,
  salary_max integer,
  description text not null default '',
  requirements text not null default '',
  is_active boolean not null default true,
  posted_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.jobs to anon;
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "active jobs public" on public.jobs for select to anon, authenticated using (is_active or posted_by = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "employers/admins insert" on public.jobs for insert to authenticated with check ((public.has_role(auth.uid(),'employer') and posted_by = auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "owner/admin update" on public.jobs for update to authenticated using (posted_by = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "owner/admin delete" on public.jobs for delete to authenticated using (posted_by = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null,
  full_name text not null,
  email text not null,
  phone text not null,
  cover_letter text,
  resume_path text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, user_id)
);
grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "apply as self" on public.applications for insert to authenticated with check (user_id = auth.uid());
create policy "read own or job owner or admin" on public.applications for select to authenticated using (
  user_id = auth.uid() or public.has_role(auth.uid(),'admin')
  or exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid()));
create policy "job owner/admin update status" on public.applications for update to authenticated using (
  public.has_role(auth.uid(),'admin') or exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid()));

create policy "upload own resume" on storage.objects for insert to authenticated with check (bucket_id='resumes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own resume or admin" on storage.objects for select to authenticated using (bucket_id='resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
create policy "update own resume" on storage.objects for update to authenticated using (bucket_id='resumes' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.jobs (title, company, location, job_type, work_mode, experience_level, description, requirements, created_at) values
('Production Helper','Krishna Maruti Limited','IMT Manesar Haryana','Full-time','On-site','Entry Level',
 'Krishna Maruti Limited is hiring Production Helpers for its IMT Manesar plant. You will support line operations, material handling and basic quality checks on the shop floor.',
 'Minimum 10th pass. Willingness to work in shifts. Prior factory experience is a plus.', now() - interval '86 days');