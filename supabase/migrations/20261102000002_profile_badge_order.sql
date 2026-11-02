alter table public.profiles
  add column if not exists badge_order text[] not null default '{}';

create index if not exists profiles_badge_order_idx
  on public.profiles using gin (badge_order);
