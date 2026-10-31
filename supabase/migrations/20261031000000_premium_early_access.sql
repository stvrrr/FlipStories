alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz;

alter table public.stories
  drop column if exists premium_until;

drop index if exists public.stories_premium_until_idx;

create table if not exists public.feature_releases (
  slug text primary key,
  name text not null,
  premium_available_at timestamptz,
  public_available_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.feature_releases enable row level security;
revoke all on public.feature_releases from public, anon, authenticated;
grant select, insert, update, delete on public.feature_releases to service_role;

create or replace function public.has_feature_access(p_feature_slug text, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.feature_releases f
    where f.slug = p_feature_slug
      and (
        (f.public_available_at is not null and f.public_available_at <= now())
        or (
          f.premium_available_at is not null
          and f.premium_available_at <= now()
          and exists (
            select 1
            from public.profiles p
            where p.id = p_user_id
              and p.is_premium
              and (p.premium_until is null or p.premium_until > now())
          )
        )
      )
  );
$$;

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

revoke all on function public.has_feature_access(text, uuid) from public, anon;
grant execute on function public.has_feature_access(text, uuid) to anon, authenticated, service_role;
revoke all on function public.has_active_premium(uuid) from public, anon;
grant execute on function public.has_active_premium(uuid) to authenticated, service_role;
