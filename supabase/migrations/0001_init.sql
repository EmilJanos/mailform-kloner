-- Mailform-kloner. Kør i et EGET Supabase-projekt (ikke Lamigo).

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,40}$'),
  title text not null default '',
  legend text not null default '',          -- overskrift over formularen
  sections jsonb not null default '[]',      -- [{id, kind:'html'|'placeholder', html}]
  owner_id uuid references auth.users(id) on delete set null,
  is_template boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Modtager-mail ligger adskilt, så den aldrig bliver offentlig.
create table public.page_settings (
  page_id uuid primary key references public.pages(id) on delete cascade,
  form_to_email text
);

create table public.submissions (
  id bigint generated always as identity primary key,
  page_id uuid not null references public.pages(id) on delete cascade,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger pages_touch before update on public.pages
  for each row execute function public.touch_updated_at();

alter table public.pages enable row level security;
alter table public.page_settings enable row level security;
alter table public.submissions enable row level security;

-- Alle må se udgivne sider. Ejeren ser sine egne. Loggede brugere ser skabeloner.
create policy pages_read on public.pages for select
  using (published or owner_id = auth.uid() or (is_template and auth.uid() is not null));
create policy pages_insert on public.pages for insert to authenticated
  with check (owner_id = auth.uid() and is_template = false);
create policy pages_update on public.pages for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and is_template = false);
create policy pages_delete on public.pages for delete to authenticated
  using (owner_id = auth.uid());

create policy settings_owner on public.page_settings for all to authenticated
  using (exists (select 1 from public.pages p where p.id = page_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pages p where p.id = page_id and p.owner_id = auth.uid()));

-- Beskeder: kun ejeren kan læse. Indsættelse sker kun via edge function (service role).
create policy submissions_owner_read on public.submissions for select to authenticated
  using (exists (select 1 from public.pages p where p.id = page_id and p.owner_id = auth.uid()));
