alter table public.profiles
  add column if not exists last_active_at timestamptz;

create or replace function public.record_profile_activity()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.profiles
  set last_active_at = now()
  where id = auth.uid()
    and (last_active_at is null or last_active_at < now() - interval '15 minutes');
end;
$$;

revoke all on function public.record_profile_activity() from public, anon;
grant execute on function public.record_profile_activity() to authenticated;