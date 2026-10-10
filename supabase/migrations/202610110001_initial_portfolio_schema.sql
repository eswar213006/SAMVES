create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_allowlist (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_allowlist a
    where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.portfolio_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  label text not null default '',
  icon text not null default '',
  artwork_path text,
  accent_color text not null default '#bd85ff' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  settings jsonb not null default '{}'::jsonb,
  section_visibility jsonb not null default '{"summary":true,"projects":true,"codingJourney":true,"resume":true,"certifications":true,"badges":true}'::jsonb,
  display_order integer not null default 0 check (display_order >= 0),
  is_all_access boolean not null default false,
  is_published boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_all_access_profile
  on public.portfolio_profiles(is_all_access)
  where is_all_access;

create table if not exists public.portfolio_summaries (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  heading text not null default '',
  external_links jsonb not null default '[]'::jsonb,
  is_shared boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  is_shared boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.project_categories(id) on delete set null,
  title text not null,
  description text not null default '',
  technologies text[] not null default '{}',
  image_path text,
  github_url text not null default '',
  demo_url text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  is_shared boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coding_platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile_url text not null default '',
  questions_count integer check (questions_count is null or questions_count >= 0),
  notes text not null default '',
  additional_stats jsonb not null default '{}'::jsonb,
  is_shared boolean not null default false,
  stats_source text not null default 'manual' check (stats_source in ('manual','provider','api')),
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_role text not null default '',
  description text not null default '',
  file_path text,
  file_name text not null default '',
  file_size bigint,
  is_shared boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null default '',
  issue_date date,
  expiration_date date,
  credential_url text not null default '',
  attachment_path text,
  attachment_name text not null default '',
  is_shared boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null default '',
  description text not null default '',
  image_path text,
  verification_url text not null default '',
  is_shared boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_settings (
  key text primary key check (key in ('theme','sections','navigation','footer','hero','cards','motion')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_revisions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.portfolio_revisions enable row level security;
create policy admins_read_revisions on public.portfolio_revisions
  for select to authenticated using (public.is_portfolio_admin());

create table if not exists public.profile_summaries (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  summary_id uuid not null references public.portfolio_summaries(id) on delete cascade,
  primary key (profile_id, summary_id)
);

create table if not exists public.profile_categories (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  category_id uuid not null references public.project_categories(id) on delete cascade,
  primary key (profile_id, category_id)
);

create table if not exists public.profile_projects (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  primary key (profile_id, project_id)
);

create table if not exists public.profile_coding_platforms (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  coding_platform_id uuid not null references public.coding_platforms(id) on delete cascade,
  primary key (profile_id, coding_platform_id)
);

create table if not exists public.profile_resumes (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  primary key (profile_id, resume_id)
);

create table if not exists public.profile_certifications (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  certification_id uuid not null references public.certifications(id) on delete cascade,
  primary key (profile_id, certification_id)
);

create table if not exists public.profile_badges (
  profile_id uuid not null references public.portfolio_profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  primary key (profile_id, badge_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.record_portfolio_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.portfolio_revisions(table_name, record_id, snapshot, changed_by)
  values (tg_table_name, old.id, to_jsonb(old), auth.uid());
  return old;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'portfolio_profiles','portfolio_summaries','project_categories','projects',
    'coding_platforms','resumes','certifications','badges','design_settings'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
    execute format('drop trigger if exists save_revision_before_update on public.%I', table_name);
    execute format('create trigger save_revision_before_update after update or delete on public.%I for each row execute function public.record_portfolio_revision()', table_name);
  end loop;
end $$;

-- Seed the existing chooser modes. Content remains empty until an administrator adds it.
insert into public.portfolio_profiles(slug, name, label, icon, accent_color, display_order, is_all_access)
values
  ('software', 'Software Development', 'Software', '🧑‍💻', '#bd85ff', 0, false),
  ('security', 'Cybersecurity', 'Security', '🛡️', '#f08bd5', 1, false),
  ('projects', 'Projects', 'Projects', '🧑‍🚀', '#d9ae72', 2, false),
  ('all', 'All Access', 'All access', '🤖', '#bfa7ff', 3, true)
on conflict (slug) do nothing;

update public.portfolio_profiles
set is_published = true
where slug in ('software','security','projects','all');

insert into public.project_categories(slug, name, description, is_shared, display_order, status)
values
  ('software-development', 'Software Development', '', false, 0, 'published'),
  ('cybersecurity', 'Cybersecurity', '', false, 1, 'published')
on conflict (slug) do nothing;

insert into public.profile_categories(profile_id, category_id)
select p.id, c.id
from public.portfolio_profiles p
cross join public.project_categories c
where (p.slug in ('software','projects') and c.slug = 'software-development')
   or (p.slug in ('security','projects') and c.slug = 'cybersecurity')
on conflict do nothing;

insert into public.coding_platforms(name, profile_url, questions_count, notes, additional_stats, is_shared, stats_source, display_order, status)
select platform.name, '', null, '', '{}'::jsonb, true, 'manual', platform.display_order, 'published'
from (values
  ('LeetCode', 0),
  ('GeeksforGeeks', 1),
  ('CodeChef', 2),
  ('HackerRank', 3)
) as platform(name, display_order)
where not exists (
  select 1 from public.coding_platforms existing where existing.name = platform.name
);

-- Public profiles can read only published, non-archived content. All writes require allowlisted admin.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'portfolio_profiles','portfolio_summaries','project_categories','projects',
    'coding_platforms','resumes','certifications','badges'
    'profile_summaries','profile_categories','profile_projects','profile_coding_platforms',
    'profile_resumes','profile_certifications','profile_badges'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists public_read_published on public.%I', table_name);
    execute format('drop policy if exists admin_manage on public.%I', table_name);
    execute format('create policy admin_manage on public.%I for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin())', table_name);
  end loop;
end $$;

create policy public_read_published on public.portfolio_profiles
  for select to anon, authenticated using (is_published and not is_archived or public.is_portfolio_admin());
create policy public_read_published on public.portfolio_summaries
  for select to anon, authenticated using (status = 'published' or public.is_portfolio_admin());
create policy public_read_published on public.project_categories
  for select to anon, authenticated using (status = 'published' and not is_archived or public.is_portfolio_admin());
create policy public_read_published on public.projects
  for select to anon, authenticated using (status = 'published' or public.is_portfolio_admin());
create policy public_read_published on public.coding_platforms
  for select to anon, authenticated using (status = 'published' or public.is_portfolio_admin());
create policy public_read_published on public.resumes
  for select to anon, authenticated using (status = 'published' or public.is_portfolio_admin());
create policy public_read_published on public.certifications
  for select to anon, authenticated using (status = 'published' or public.is_portfolio_admin());
create policy public_read_published on public.badges
  for select to anon, authenticated using (status = 'published' or public.is_portfolio_admin());
create policy public_read_published on public.design_settings
  for select to anon, authenticated using (true);

-- Assignment rows are readable only for published profiles and published target records.
create policy public_read_published on public.profile_summaries
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.portfolio_summaries s on s.id = summary_id where p.id = profile_id and p.is_published and not p.is_archived and s.status = 'published')
  );
create policy public_read_published on public.profile_categories
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.project_categories c on c.id = category_id where p.id = profile_id and p.is_published and not p.is_archived and c.status = 'published' and not c.is_archived)
  );
create policy public_read_published on public.profile_projects
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.projects x on x.id = project_id where p.id = profile_id and p.is_published and not p.is_archived and x.status = 'published')
  );
create policy public_read_published on public.profile_coding_platforms
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.coding_platforms c on c.id = coding_platform_id where p.id = profile_id and p.is_published and not p.is_archived and c.status = 'published')
  );
create policy public_read_published on public.profile_resumes
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.resumes r on r.id = resume_id where p.id = profile_id and p.is_published and not p.is_archived and r.status = 'published')
  );
create policy public_read_published on public.profile_certifications
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.certifications c on c.id = certification_id where p.id = profile_id and p.is_published and not p.is_archived and c.status = 'published')
  );
create policy public_read_published on public.profile_badges
  for select to anon, authenticated using (
    public.is_portfolio_admin() or exists(select 1 from public.portfolio_profiles p join public.badges b on b.id = badge_id where p.id = profile_id and p.is_published and not p.is_archived and b.status = 'published')
  );

alter table public.admin_allowlist enable row level security;
create policy admins_read_allowlist on public.admin_allowlist for select to authenticated using (public.is_portfolio_admin());

-- Private bucket: public files must be delivered through an authenticated server/signed URL flow.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-private', 'portfolio-private', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy portfolio_admin_upload on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio-private' and public.is_portfolio_admin());
create policy portfolio_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'portfolio-private' and public.is_portfolio_admin())
  with check (bucket_id = 'portfolio-private' and public.is_portfolio_admin());
create policy portfolio_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio-private' and public.is_portfolio_admin());
create policy portfolio_admin_read on storage.objects
  for select to authenticated using (bucket_id = 'portfolio-private' and public.is_portfolio_admin());
