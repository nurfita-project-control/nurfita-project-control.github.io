begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'viewer_hk'
    check (role in ('admin', 'editor', 'viewer_hk')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_settings (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  owner_company text not null default 'PT Nurfita Karya Mandiri',
  client_company text,
  contract_number_south text,
  contract_number_north text,
  start_date date,
  finish_date date,
  soil_target_south numeric(14, 3) not null default 0 check (soil_target_south >= 0),
  soil_target_north numeric(14, 3) not null default 0 check (soil_target_north >= 0),
  truck_capacity numeric(14, 3) not null default 0 check (truck_capacity >= 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  wing text not null check (wing in ('Selatan', 'Utara', 'Umum')),
  name text not null,
  start_date date not null,
  finish_date date not null,
  weight numeric(9, 4) not null check (weight >= 0 and weight <= 100),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (finish_date >= start_date)
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  category text not null
    check (category in ('progress', 'soil', 'material', 'manpower', 'constraint', 'expense')),
  wing text not null check (wing in ('Selatan', 'Utara', 'Umum')),
  zone text not null default 'Area kerja umum',
  schedule_item_id uuid references public.schedule_items(id) on delete set null,
  item_name text not null,
  quantity numeric(14, 3) not null default 0 check (quantity >= 0),
  unit text not null default '',
  completion numeric(7, 3) not null default 0 check (completion >= 0 and completion <= 100),
  amount numeric(18, 2) not null default 0 check (amount >= 0),
  workers integer not null default 0 check (workers >= 0),
  status text not null default 'actual' check (status in ('plan', 'actual')),
  vendor text not null default '',
  notes text not null default '',
  photo_path text,
  hk_visible boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cost_plans (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  week_start date not null,
  planned_amount numeric(18, 2) not null default 0 check (planned_amount >= 0),
  actual_amount numeric(18, 2) not null default 0 check (actual_amount >= 0),
  vendor text not null default '',
  notes text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_statuses (
  id uuid primary key default gen_random_uuid(),
  document_name text not null unique,
  status text not null default 'Proses',
  notes text not null default '',
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  if exists (select 1 from public.profiles) then
    assigned_role := 'viewer_hk';
  else
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    assigned_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid() and active = true
  limit 1;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists project_settings_set_updated_at on public.project_settings;
create trigger project_settings_set_updated_at before update on public.project_settings
  for each row execute function public.set_updated_at();

drop trigger if exists schedule_items_set_updated_at on public.schedule_items;
create trigger schedule_items_set_updated_at before update on public.schedule_items
  for each row execute function public.set_updated_at();

drop trigger if exists daily_entries_set_updated_at on public.daily_entries;
create trigger daily_entries_set_updated_at before update on public.daily_entries
  for each row execute function public.set_updated_at();

drop trigger if exists cost_plans_set_updated_at on public.cost_plans;
create trigger cost_plans_set_updated_at before update on public.cost_plans
  for each row execute function public.set_updated_at();

drop trigger if exists document_statuses_set_updated_at on public.document_statuses;
create trigger document_statuses_set_updated_at before update on public.document_statuses
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.project_settings enable row level security;
alter table public.schedule_items enable row level security;
alter table public.daily_entries enable row level security;
alter table public.cost_plans enable row level security;
alter table public.document_statuses enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

drop policy if exists project_settings_select on public.project_settings;
create policy project_settings_select on public.project_settings
  for select to authenticated
  using (true);

drop policy if exists project_settings_write on public.project_settings;
create policy project_settings_write on public.project_settings
  for all to authenticated
  using (public.current_app_role() in ('admin', 'editor'))
  with check (public.current_app_role() in ('admin', 'editor'));

drop policy if exists schedule_items_select on public.schedule_items;
create policy schedule_items_select on public.schedule_items
  for select to authenticated
  using (true);

drop policy if exists schedule_items_write on public.schedule_items;
create policy schedule_items_write on public.schedule_items
  for all to authenticated
  using (public.current_app_role() in ('admin', 'editor'))
  with check (public.current_app_role() in ('admin', 'editor'));

drop policy if exists daily_entries_select on public.daily_entries;
create policy daily_entries_select on public.daily_entries
  for select to authenticated
  using (
    public.current_app_role() in ('admin', 'editor')
    or (
      public.current_app_role() = 'viewer_hk'
      and hk_visible = true
      and category <> 'expense'
    )
  );

drop policy if exists daily_entries_insert on public.daily_entries;
create policy daily_entries_insert on public.daily_entries
  for insert to authenticated
  with check (
    public.current_app_role() in ('admin', 'editor')
    and created_by = auth.uid()
  );

drop policy if exists daily_entries_update on public.daily_entries;
create policy daily_entries_update on public.daily_entries
  for update to authenticated
  using (public.current_app_role() in ('admin', 'editor'))
  with check (public.current_app_role() in ('admin', 'editor'));

drop policy if exists daily_entries_delete on public.daily_entries;
create policy daily_entries_delete on public.daily_entries
  for delete to authenticated
  using (public.current_app_role() = 'admin');

drop policy if exists cost_plans_internal_only on public.cost_plans;
create policy cost_plans_internal_only on public.cost_plans
  for all to authenticated
  using (public.current_app_role() in ('admin', 'editor'))
  with check (public.current_app_role() in ('admin', 'editor'));

drop policy if exists document_statuses_internal_only on public.document_statuses;
create policy document_statuses_internal_only on public.document_statuses
  for all to authenticated
  using (public.current_app_role() in ('admin', 'editor'))
  with check (public.current_app_role() in ('admin', 'editor'));

revoke all on public.profiles from anon;
revoke all on public.project_settings from anon;
revoke all on public.schedule_items from anon;
revoke all on public.daily_entries from anon;
revoke all on public.cost_plans from anon;
revoke all on public.document_statuses from anon;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.project_settings to authenticated;
grant select, insert, update, delete on public.schedule_items to authenticated;
grant select, insert, update, delete on public.daily_entries to authenticated;
grant select, insert, update, delete on public.cost_plans to authenticated;
grant select, insert, update, delete on public.document_statuses to authenticated;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-photos',
  'project-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_photos_select on storage.objects;
create policy project_photos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-photos'
    and (
      public.current_app_role() in ('admin', 'editor')
      or (
        public.current_app_role() = 'viewer_hk'
        and (storage.foldername(name))[1] = 'hk'
      )
    )
  );

drop policy if exists project_photos_insert on storage.objects;
create policy project_photos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-photos'
    and public.current_app_role() in ('admin', 'editor')
    and (storage.foldername(name))[1] in ('hk', 'internal')
  );

drop policy if exists project_photos_update on storage.objects;
create policy project_photos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'project-photos'
    and public.current_app_role() in ('admin', 'editor')
  )
  with check (
    bucket_id = 'project-photos'
    and public.current_app_role() in ('admin', 'editor')
  );

drop policy if exists project_photos_delete on storage.objects;
create policy project_photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-photos'
    and public.current_app_role() = 'admin'
  );

create index if not exists schedule_items_sort_idx
  on public.schedule_items (sort_order, start_date);
create index if not exists daily_entries_date_idx
  on public.daily_entries (entry_date desc);
create index if not exists daily_entries_hk_idx
  on public.daily_entries (hk_visible, entry_date desc);
create index if not exists daily_entries_schedule_idx
  on public.daily_entries (schedule_item_id);
create index if not exists cost_plans_week_idx
  on public.cost_plans (week_start desc);

commit;
