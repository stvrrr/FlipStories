create table if not exists public.story_coauthors (
  story_id uuid not null references public.stories(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, profile_id)
);

create index if not exists story_coauthors_profile_story_idx
on public.story_coauthors (profile_id, story_id);

alter table public.story_coauthors enable row level security;
revoke all on public.story_coauthors from anon, authenticated;
grant select on public.story_coauthors to anon, authenticated;

drop policy if exists "Coauthors are readable with their story" on public.story_coauthors;
create policy "Coauthors are readable with their story"
on public.story_coauthors
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.stories s
    where s.id = story_id
      and (
        s.author_id = (select auth.uid())
        or (
          s.status = 'published'
          and (
            s.visibility = 'public'
            or (
              s.visibility = 'followers'
              and exists (
                select 1
                from public.follows f
                where f.follower_id = (select auth.uid())
                  and f.following_id = s.author_id
              )
            )
          )
        )
      )
  )
);

create or replace function public.set_story_coauthors(
  p_story_id uuid,
  p_profile_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_ids uuid[] := coalesce(p_profile_ids, array[]::uuid[]);
begin
  if auth.uid() is null or not exists (
    select 1
    from public.stories s
    where s.id = p_story_id
      and s.author_id = auth.uid()
  ) then
    raise exception 'Only the story author can update co-writers.' using errcode = '42501';
  end if;

  if cardinality(v_profile_ids) > 3 then
    raise exception 'A story can have at most three co-writers.' using errcode = '22023';
  end if;

  if cardinality(v_profile_ids) <> (
    select count(distinct requested.profile_id)
    from unnest(v_profile_ids) as requested(profile_id)
  ) then
    raise exception 'Co-writers must be unique.' using errcode = '22023';
  end if;

  if auth.uid() = any(v_profile_ids) then
    raise exception 'The story author cannot also be a co-writer.' using errcode = '22023';
  end if;

  delete from public.story_coauthors
  where story_id = p_story_id;

  insert into public.story_coauthors (story_id, profile_id)
  select p_story_id, requested.profile_id
  from unnest(v_profile_ids) as requested(profile_id);
end;
$$;

revoke all on function public.set_story_coauthors(uuid, uuid[]) from public, anon;
grant execute on function public.set_story_coauthors(uuid, uuid[]) to authenticated;

create table if not exists public.profile_badges (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null check (badge_key in ('early_member', 'event_participant')),
  awarded_at timestamptz not null default now(),
  awarded_by uuid references public.profiles(id) on delete set null,
  primary key (profile_id, badge_key)
);

alter table public.profile_badges enable row level security;
revoke all on public.profile_badges from public, anon, authenticated;
grant all on public.profile_badges to service_role;

create or replace function public.get_profile_badges(p_profile_id uuid)
returns table (badge_key text)
language sql
stable
security definer
set search_path = public
as $$
  with credited_stories as (
    select s.id,
      exists (
        select 1
        from public.story_coauthors sc
        where sc.story_id = s.id
      ) as is_co_written
    from public.stories s
    where s.status = 'published'
      and s.visibility = 'public'
      and (
        s.author_id = p_profile_id
        or exists (
          select 1
          from public.story_coauthors sc
          where sc.story_id = s.id
            and sc.profile_id = p_profile_id
        )
      )
  ),
  story_likes as (
    select cs.id, cs.is_co_written, coalesce(l.like_count, 0) as like_count
    from credited_stories cs
    left join lateral public.get_public_story_like_counts(array[cs.id]) l on true
  )
  select pb.badge_key
  from public.profile_badges pb
  where pb.profile_id = p_profile_id

  union
  select 'story_seeker'
  where (
    select count(distinct sv.story_id)
    from public.story_views sv
    join public.stories s on s.id = sv.story_id
    where sv.user_id = p_profile_id
      and s.status = 'published'
      and s.visibility = 'public'
  ) >= 50

  union
  select 'century_story'
  where exists (select 1 from story_likes sl where sl.like_count >= 100)

  union
  select 'community_favorite'
  where (
    select count(*)
    from public.follows f
    where f.following_id = p_profile_id
  ) >= 25

  union
  select 'premium_member'
  where exists (
    select 1
    from public.profiles p
    where p.id = p_profile_id
      and p.is_premium
      and (p.premium_until is null or p.premium_until > now())
  )

  union
  select 'hitmaker'
  where (select count(*) from story_likes sl where sl.like_count > 100) >= 5

  union
  select 'collaborative_spark'
  where (
    select count(*)
    from story_likes sl
    where sl.is_co_written
      and sl.like_count >= 20
  ) >= 3;
$$;

revoke all on function public.get_profile_badges(uuid) from public;
grant execute on function public.get_profile_badges(uuid) to anon, authenticated, service_role;