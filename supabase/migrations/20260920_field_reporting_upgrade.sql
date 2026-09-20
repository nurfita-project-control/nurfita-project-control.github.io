begin;

alter table public.daily_entries
  add column if not exists target_scope_id text;

alter table public.daily_entries
  drop constraint if exists daily_entries_category_check;

alter table public.daily_entries
  add constraint daily_entries_category_check
  check (category in (
    'preparation',
    'progress',
    'soil',
    'plant_delivery',
    'plant_installation',
    'manpower',
    'equipment',
    'constraint',
    'documentation',
    'material',
    'expense'
  ));

create index if not exists daily_entries_target_scope_idx
  on public.daily_entries (target_scope_id, entry_date desc);

commit;
