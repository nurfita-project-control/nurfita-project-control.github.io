begin;

alter table public.profiles
  add column if not exists email text not null default '',
  add column if not exists role_level smallint;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_level_check;

update public.profiles p
set email = coalesce(u.email, p.email),
    role_level = case p.role
      when 'admin' then 5
      when 'editor' then 2
      when 'viewer_hk' then 1
      else coalesce(p.role_level, 1)
    end
from auth.users u
where u.id = p.id;

update public.profiles
set role_level = coalesce(role_level, 1),
    role = case coalesce(role_level, 1)
      when 5 then 'super_admin'
      when 4 then 'admin'
      when 3 then 'reviewer'
      when 2 then 'user'
      else 'viewer_hk'
    end;

alter table public.profiles
  alter column role_level set default 1,
  alter column role_level set not null,
  add constraint profiles_role_level_check check (role_level between 1 and 5),
  add constraint profiles_role_check check (role in ('super_admin', 'admin', 'reviewer', 'user', 'viewer_hk'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_level smallint;
  requested_level integer;
  assigned_role text;
begin
  requested_level := nullif(new.raw_user_meta_data ->> 'role_level', '')::integer;

  if not exists (select 1 from public.profiles) then
    assigned_level := 5;
  else
    assigned_level := greatest(1, least(5, coalesce(requested_level, 1)))::smallint;
  end if;

  assigned_role := case assigned_level
    when 5 then 'super_admin'
    when 4 then 'admin'
    when 3 then 'reviewer'
    when 2 then 'user'
    else 'viewer_hk'
  end;

  insert into public.profiles (id, email, full_name, role, role_level, active)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    assigned_role,
    assigned_level,
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    role_level = excluded.role_level,
    active = true;

  return new;
end;
$$;

create or replace function public.current_role_level()
returns smallint
language sql
stable
security definer
set search_path = public
as $$
  select role_level
  from public.profiles
  where id = auth.uid() and active = true
  limit 1;
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

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_role_level() >= 4);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.current_role_level() >= 4)
  with check (role_level <= public.current_role_level());

drop policy if exists project_settings_select on public.project_settings;
create policy project_settings_select on public.project_settings
  for select to authenticated using (public.current_role_level() >= 1);
drop policy if exists project_settings_write on public.project_settings;
create policy project_settings_write on public.project_settings
  for all to authenticated
  using (public.current_role_level() >= 4)
  with check (public.current_role_level() >= 4);

drop policy if exists schedule_items_select on public.schedule_items;
create policy schedule_items_select on public.schedule_items
  for select to authenticated using (public.current_role_level() >= 1);
drop policy if exists schedule_items_write on public.schedule_items;
create policy schedule_items_write on public.schedule_items
  for all to authenticated
  using (public.current_role_level() >= 4)
  with check (public.current_role_level() >= 4);

drop policy if exists daily_entries_select on public.daily_entries;
create policy daily_entries_select on public.daily_entries
  for select to authenticated
  using (
    public.current_role_level() >= 2
    or (public.current_role_level() = 1 and hk_visible = true and category <> 'expense')
  );
drop policy if exists daily_entries_insert on public.daily_entries;
create policy daily_entries_insert on public.daily_entries
  for insert to authenticated
  with check (public.current_role_level() >= 2 and created_by = auth.uid());
drop policy if exists daily_entries_update on public.daily_entries;
create policy daily_entries_update on public.daily_entries
  for update to authenticated
  using (public.current_role_level() >= 4 or (public.current_role_level() = 2 and created_by = auth.uid()))
  with check (public.current_role_level() >= 4 or (public.current_role_level() = 2 and created_by = auth.uid()));
drop policy if exists daily_entries_delete on public.daily_entries;
create policy daily_entries_delete on public.daily_entries
  for delete to authenticated using (public.current_role_level() >= 4);

drop policy if exists cost_plans_internal_only on public.cost_plans;
drop policy if exists cost_plans_select on public.cost_plans;
drop policy if exists cost_plans_write on public.cost_plans;
create policy cost_plans_select on public.cost_plans
  for select to authenticated using (public.current_role_level() >= 3);
create policy cost_plans_write on public.cost_plans
  for all to authenticated
  using (public.current_role_level() >= 4)
  with check (public.current_role_level() >= 4);

drop policy if exists document_statuses_internal_only on public.document_statuses;
drop policy if exists document_statuses_select on public.document_statuses;
drop policy if exists document_statuses_write on public.document_statuses;
create policy document_statuses_select on public.document_statuses
  for select to authenticated using (public.current_role_level() >= 2);
create policy document_statuses_write on public.document_statuses
  for all to authenticated
  using (public.current_role_level() >= 4)
  with check (public.current_role_level() >= 4);

drop policy if exists project_photos_select on storage.objects;
create policy project_photos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-photos'
    and (public.current_role_level() >= 2 or (public.current_role_level() = 1 and (storage.foldername(name))[1] = 'hk'))
  );
drop policy if exists project_photos_insert on storage.objects;
create policy project_photos_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-photos' and public.current_role_level() >= 2 and (storage.foldername(name))[1] in ('hk', 'internal'));
drop policy if exists project_photos_update on storage.objects;
create policy project_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'project-photos' and public.current_role_level() >= 4)
  with check (bucket_id = 'project-photos' and public.current_role_level() >= 4);
drop policy if exists project_photos_delete on storage.objects;
create policy project_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-photos' and public.current_role_level() >= 4);

revoke all on function public.current_role_level() from public;
grant execute on function public.current_role_level() to authenticated;

commit;
