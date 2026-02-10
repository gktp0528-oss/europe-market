-- ==========================================
-- Notifications workflow + like notification hook
-- ==========================================

-- 1) Notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like', 'transaction', 'message', 'system')),
  title text not null,
  content text not null,
  link_id text,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id or auth.uid() = actor_id);

create index if not exists notifications_user_id_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, is_read, created_at desc);

grant select, insert, update, delete on table public.notifications to authenticated;

-- 2) Extend like toggle: on like -> notify post owner
create or replace function public.toggle_like(p_post_id bigint)
returns jsonb as $$
declare
  v_user_id uuid;
  v_liked boolean;
  v_like_count integer;
  v_post_owner_id uuid;
  v_post_title text;
  v_actor_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select p.user_id, p.title
  into v_post_owner_id, v_post_title
  from public.posts p
  where p.id = p_post_id;

  if v_post_owner_id is null then
    raise exception 'Post not found';
  end if;

  select exists(
    select 1 from public.user_likes
    where user_id = v_user_id and post_id = p_post_id
  ) into v_liked;

  if v_liked then
    delete from public.user_likes
    where user_id = v_user_id and post_id = p_post_id;

    update public.posts
    set likes = greatest(0, likes - 1)
    where id = p_post_id;
  else
    insert into public.user_likes (user_id, post_id)
    values (v_user_id, p_post_id)
    on conflict (user_id, post_id) do nothing;

    update public.posts
    set likes = likes + 1
    where id = p_post_id;

    select coalesce(nullif(trim(username), ''), nullif(trim(full_name), ''), '누군가')
    into v_actor_name
    from public.profiles
    where id = v_user_id;

    if v_post_owner_id <> v_user_id then
      insert into public.notifications (user_id, actor_id, type, title, content, link_id, is_read)
      values (
        v_post_owner_id,
        v_user_id,
        'like',
        '새 좋아요',
        format('%s님이 "%s" 게시글을 좋아했어요.', v_actor_name, coalesce(v_post_title, '게시글')),
        p_post_id::text,
        false
      );
    end if;
  end if;

  select likes into v_like_count
  from public.posts
  where id = p_post_id;

  return jsonb_build_object(
    'liked', not v_liked,
    'like_count', coalesce(v_like_count, 0)
  );
end;
$$ language plpgsql security definer
set search_path = public, auth;

grant execute on function public.toggle_like(bigint) to authenticated;
