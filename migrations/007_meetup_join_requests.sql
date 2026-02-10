-- ==========================================
-- Meetup join request workflow
-- ==========================================

create table if not exists public.meetup_join_requests (
  id uuid default gen_random_uuid() primary key,
  post_id bigint references public.posts(id) on delete cascade not null,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  host_id uuid references public.profiles(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, requester_id)
);

alter table public.meetup_join_requests enable row level security;

drop policy if exists "Meetup request select policy" on public.meetup_join_requests;
create policy "Meetup request select policy"
  on public.meetup_join_requests for select
  using (
    status = 'approved'
    or auth.uid() = requester_id
    or auth.uid() = host_id
  );

drop policy if exists "Meetup request insert policy" on public.meetup_join_requests;
create policy "Meetup request insert policy"
  on public.meetup_join_requests for insert
  with check (auth.uid() = requester_id);

drop policy if exists "Meetup request update policy" on public.meetup_join_requests;
create policy "Meetup request update policy"
  on public.meetup_join_requests for update
  using (auth.uid() = host_id or auth.uid() = requester_id)
  with check (auth.uid() = host_id or auth.uid() = requester_id);

create index if not exists meetup_join_requests_post_status_idx
  on public.meetup_join_requests(post_id, status, created_at desc);

create index if not exists meetup_join_requests_host_status_idx
  on public.meetup_join_requests(host_id, status, created_at desc);

create or replace function public.request_meetup_approval(
  p_post_id bigint,
  p_conversation_id uuid default null
)
returns uuid as $$
declare
  v_user_id uuid;
  v_host_id uuid;
  v_post_title text;
  v_request_id uuid;
  v_current_status text;
  v_actor_name text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select p.user_id, p.title
    into v_host_id, v_post_title
  from public.posts p
  where p.id = p_post_id
    and p.category = 'meetup';

  if v_host_id is null then
    raise exception 'Meetup post not found';
  end if;

  if v_host_id = v_user_id then
    raise exception 'Host cannot request approval';
  end if;

  select id, status
    into v_request_id, v_current_status
  from public.meetup_join_requests
  where post_id = p_post_id
    and requester_id = v_user_id;

  if v_request_id is null then
    insert into public.meetup_join_requests (
      post_id, requester_id, host_id, conversation_id, status, approved_at, updated_at
    )
    values (
      p_post_id, v_user_id, v_host_id, p_conversation_id, 'pending', null, now()
    )
    returning id into v_request_id;
  elsif v_current_status = 'approved' then
    return v_request_id;
  elsif v_current_status = 'pending' then
    return v_request_id;
  else
    update public.meetup_join_requests
       set status = 'pending',
           approved_at = null,
           conversation_id = coalesce(p_conversation_id, conversation_id),
           updated_at = now()
     where id = v_request_id;
  end if;

  select coalesce(nullif(trim(username), ''), nullif(trim(full_name), ''), '누군가')
    into v_actor_name
  from public.profiles
  where id = v_user_id;

  insert into public.notifications (user_id, actor_id, type, title, content, link_id, is_read)
  values (
    v_host_id,
    v_user_id,
    'transaction',
    '모임 승인 요청',
    format('%s님이 "%s" 모임 참가 승인을 요청했어요.', v_actor_name, coalesce(v_post_title, '모임')),
    v_request_id::text,
    false
  );

  return v_request_id;
end;
$$ language plpgsql security definer
set search_path = public, auth;

grant execute on function public.request_meetup_approval(bigint, uuid) to authenticated;

create or replace function public.approve_meetup_approval(
  p_request_id uuid
)
returns void as $$
declare
  v_host_id uuid;
  v_requester_id uuid;
  v_status text;
  v_post_id bigint;
  v_post_title text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select r.host_id, r.requester_id, r.status, r.post_id, p.title
    into v_host_id, v_requester_id, v_status, v_post_id, v_post_title
  from public.meetup_join_requests r
  join public.posts p on p.id = r.post_id
  where r.id = p_request_id;

  if v_host_id is null then
    raise exception 'Approval request not found';
  end if;

  if auth.uid() <> v_host_id then
    raise exception 'Only host can approve';
  end if;

  if v_status = 'approved' then
    return;
  end if;

  update public.meetup_join_requests
     set status = 'approved',
         approved_at = now(),
         updated_at = now()
   where id = p_request_id;

  insert into public.notifications (user_id, actor_id, type, title, content, link_id, is_read)
  values (
    v_requester_id,
    v_host_id,
    'transaction',
    '모임 승인 완료',
    format('"%s" 모임 참가 요청이 승인되었어요.', coalesce(v_post_title, '모임')),
    v_post_id::text,
    false
  );
end;
$$ language plpgsql security definer
set search_path = public, auth;

grant execute on function public.approve_meetup_approval(uuid) to authenticated;
