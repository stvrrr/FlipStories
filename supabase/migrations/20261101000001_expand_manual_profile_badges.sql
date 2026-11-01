alter table public.profile_badges
  drop constraint if exists profile_badges_badge_key_check;

alter table public.profile_badges
  add constraint profile_badges_badge_key_check
  check (badge_key in (
    'early_member',
    'story_seeker',
    'century_story',
    'community_favorite',
    'premium_member',
    'event_participant',
    'hitmaker',
    'collaborative_spark'
  ));
