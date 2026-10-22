-- Run in the Supabase SQL editor. Public profile fields live separately from auth.users.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 80),
  title text not null default '' check (char_length(title) <= 100),
  bio text not null default '' check (char_length(bio) <= 1200),
  location text not null default '' check (char_length(location) <= 120),
  company_name text not null default '' check (char_length(company_name) <= 120),
  contact_email text not null default '' check (char_length(contact_email) <= 254),
  avatar_url text,
  website_url text,
  github_url text,
  linkedin_url text,
  years_experience smallint not null default 0 check (years_experience between 0 and 70),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists company_name text not null default '' check (char_length(company_name) <= 120);
alter table public.profiles add column if not exists contact_email text not null default '' check (char_length(contact_email) <= 254);

create table if not exists public.profile_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  unique (profile_id, name)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 100),
  description text not null check (char_length(description) between 10 and 800),
  image_url text,
  repository_url text,
  demo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  unique (project_id, name)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 100),
  body text not null check (char_length(body) between 10 and 1600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_profile_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 1000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_profile_id <> recipient_profile_id),
  unique (sender_profile_id, recipient_profile_id)
);

create index if not exists profiles_location_idx on public.profiles (location);
create index if not exists profiles_availability_idx on public.profiles (available) where available;
create index if not exists profile_skills_name_idx on public.profile_skills (name);
create index if not exists projects_profile_created_idx on public.projects (profile_id, created_at desc);
create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_profile_created_idx on public.posts (profile_id, created_at desc);
create index if not exists connections_recipient_status_idx on public.connection_requests (recipient_profile_id, status, created_at desc);
create index if not exists connections_sender_status_idx on public.connection_requests (sender_profile_id, status, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
drop trigger if exists requests_updated_at on public.connection_requests;
create trigger requests_updated_at before update on public.connection_requests for each row execute function public.set_updated_at();

create or replace function public.guard_connection_request_update()
returns trigger language plpgsql as $$
begin
  if new.sender_profile_id <> old.sender_profile_id
    or new.recipient_profile_id <> old.recipient_profile_id
    or new.message <> old.message
    or new.created_at <> old.created_at
    or old.status <> 'pending'
    or new.status not in ('accepted', 'declined') then
    raise exception 'Only the recipient may accept or decline a pending request';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_connection_request_update on public.connection_requests;
create trigger guard_connection_request_update before update on public.connection_requests for each row execute function public.guard_connection_request_update();

alter table public.profiles enable row level security;
alter table public.profile_skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_technologies enable row level security;
alter table public.posts enable row level security;
alter table public.connection_requests enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
drop policy if exists "Users create their own profile" on public.profiles;
drop policy if exists "Users update their own profile" on public.profiles;
drop policy if exists "Skills are publicly readable" on public.profile_skills;
drop policy if exists "Users manage their own skills" on public.profile_skills;
drop policy if exists "Projects are publicly readable" on public.projects;
drop policy if exists "Users create their own projects" on public.projects;
drop policy if exists "Users update their own projects" on public.projects;
drop policy if exists "Users delete their own projects" on public.projects;
drop policy if exists "Posts are publicly readable" on public.posts;
drop policy if exists "Users create their own posts" on public.posts;
drop policy if exists "Users update their own posts" on public.posts;
drop policy if exists "Users delete their own posts" on public.posts;
drop policy if exists "Project technologies are publicly readable" on public.project_technologies;
drop policy if exists "Users manage technologies on their projects" on public.project_technologies;
drop policy if exists "Participants read their requests" on public.connection_requests;
drop policy if exists "Users create requests as themselves" on public.connection_requests;
drop policy if exists "Recipients respond to requests" on public.connection_requests;
drop policy if exists "Senders cancel pending requests" on public.connection_requests;

create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users create their own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Users update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Skills are publicly readable" on public.profile_skills for select using (true);
create policy "Users manage their own skills" on public.profile_skills for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Projects are publicly readable" on public.projects for select using (true);
create policy "Users create their own projects" on public.projects for insert to authenticated with check (profile_id = auth.uid());
create policy "Users update their own projects" on public.projects for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Users delete their own projects" on public.projects for delete to authenticated using (profile_id = auth.uid());
create policy "Posts are publicly readable" on public.posts for select using (true);
create policy "Users create their own posts" on public.posts for insert to authenticated with check (profile_id = auth.uid());
create policy "Users update their own posts" on public.posts for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Users delete their own posts" on public.posts for delete to authenticated using (profile_id = auth.uid());
create policy "Project technologies are publicly readable" on public.project_technologies for select using (true);
create policy "Users manage technologies on their projects" on public.project_technologies for all to authenticated using (exists (select 1 from public.projects p where p.id = project_id and p.profile_id = auth.uid())) with check (exists (select 1 from public.projects p where p.id = project_id and p.profile_id = auth.uid()));
create policy "Participants read their requests" on public.connection_requests for select to authenticated using (sender_profile_id = auth.uid() or recipient_profile_id = auth.uid());
create policy "Users create requests as themselves" on public.connection_requests for insert to authenticated with check (sender_profile_id = auth.uid() and recipient_profile_id <> auth.uid() and status = 'pending');
create policy "Recipients respond to requests" on public.connection_requests for update to authenticated using (recipient_profile_id = auth.uid()) with check (recipient_profile_id = auth.uid() and status in ('accepted', 'declined'));
create policy "Senders cancel pending requests" on public.connection_requests for delete to authenticated using (sender_profile_id = auth.uid() and status = 'pending');

-- New auth users receive a blank public profile. Email remains only in auth.users.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
