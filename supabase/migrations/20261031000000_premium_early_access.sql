alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz;

alter table public.stories
  add column if not exists premium_until timestamptz;

create index if not exists stories_premium_until_idx
  on public.stories (premium_until);

create or replace function public.has_active_premium(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and is_premium
      and (premium_until is null or premium_until > now())
  );
$$;

revoke all on function public.has_active_premium(uuid) from public, anon;
grant execute on function public.has_active_premium(uuid) to authenticated, service_role;
