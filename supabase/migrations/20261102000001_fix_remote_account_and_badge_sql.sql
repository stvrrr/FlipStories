create table if not exists public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

alter table public.story_views
  add column if not exists viewed_at timestamptz not null default now();

create index if not exists story_views_story_user_viewed_idx
  on public.story_views (story_id, user_id, viewed_at desc);

alter table public.story_views enable row level security;
grant insert on public.story_views to anon, authenticated;
grant select on public.story_views to authenticated;

drop policy if exists "Users can insert story views" on public.story_views;
create policy "Users can insert story views"
  on public.story_views for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Users can read story views" on public.story_views;
create policy "Users can read story views"
  on public.story_views for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.capture_activity_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_data jsonb := to_jsonb(new);
  v_action_type text;
  v_source_id uuid;
  v_actor_id uuid;
  v_recipient_id uuid;
  v_story_id uuid;
  v_detail text;
  v_occurred_at timestamptz;
begin
  v_source_id := nullif(v_row_data ->> 'id', '')::uuid;
  v_occurred_at := coalesce((v_row_data ->> 'created_at')::timestamptz, now());

  if tg_table_name = 'follows' then
    v_action_type := 'follow';
    v_actor_id := (v_row_data ->> 'follower_id')::uuid;
    v_recipient_id := (v_row_data ->> 'following_id')::uuid;
  else
    v_action_type := case tg_table_name
      when 'likes' then 'like'
      when 'favorites' then 'favorite'
      when 'story_comments' then 'comment'
    end;
    v_actor_id := (v_row_data ->> 'user_id')::uuid;
    v_story_id := (v_row_data ->> 'story_id')::uuid;
    v_detail := case when v_action_type = 'comment' then v_row_data ->> 'content' else null end;

    select s.author_id
    into v_recipient_id
    from public.stories as s
    where s.id = v_story_id;
  end if;

  if v_action_type is null or v_actor_id is null or v_recipient_id is null or v_actor_id = v_recipient_id then
    return new;
  end if;

  v_source_id := coalesce(
    v_source_id,
    md5(jsonb_build_array(v_action_type, v_actor_id, v_recipient_id, v_story_id, v_detail, v_occurred_at)::text)::uuid
  );

  insert into public.activity_events (
    event_type, source_id, actor_id, recipient_id, story_id, detail, created_at
  ) values (
    v_action_type, v_source_id, v_actor_id, v_recipient_id, v_story_id, v_detail, v_occurred_at
  )
  on conflict (event_type, source_id) do nothing;

  return new;
end;
$$;

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

  union select 'story_seeker' where (
    select count(distinct sv.story_id)
    from public.story_views sv
    join public.stories s on s.id = sv.story_id
    where sv.user_id = p_profile_id
      and s.status = 'published'
      and s.visibility = 'public'
  ) >= 50

  union select 'century_story'
    where exists (select 1 from story_likes sl where sl.like_count >= 100)

  union select 'community_favorite'
    where (
      select count(*)
      from public.follows f
      where f.following_id = p_profile_id
    ) >= 25

  union select 'premium_member'
    where exists (
      select 1
      from public.profiles p
      where p.id = p_profile_id
        and p.is_premium
        and (p.premium_until is null or p.premium_until > now())
    )

  union select 'hitmaker'
    where (select count(*) from story_likes sl where sl.like_count >= 100) >= 5

  union select 'collaborative_spark'
    where (select count(*) from story_likes sl where sl.is_co_written and sl.like_count >= 20) >= 3;
$$;

revoke all on function public.get_profile_badges(uuid) from public;
grant execute on function public.get_profile_badges(uuid) to anon, authenticated, service_role;
