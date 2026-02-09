-- 1. profiles 테이블에 집계 컬럼 추가
alter table public.profiles 
add column if not exists rating_avg numeric(3,2) default 0,
add column if not exists rating_count integer default 0,
add column if not exists rating_sum integer default 0;

-- 2. transactions 테이블 (거래/이용 내역 관리)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  post_id bigint references public.posts(id) on delete set null,
  category text not null,
  owner_id uuid references public.profiles(id) not null,
  participant_id uuid references public.profiles(id) not null,
  conversation_id uuid references public.conversations(id) on delete set null,
  status text default 'open' check (status in ('open', 'completion_requested', 'completed', 'disputed', 'canceled')),
  completion_requested_by uuid references public.profiles(id),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

-- 참여자만 조회 가능
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = owner_id or auth.uid() = participant_id);

-- 3. profile_ratings 테이블 (별점 및 후기)
create table if not exists public.profile_ratings (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  rater_id uuid references public.profiles(id) not null,
  ratee_id uuid references public.profiles(id) not null,
  score integer not null check (score >= 1 and score <= 5),
  comment varchar(100),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_transaction_rater unique(transaction_id, rater_id),
  constraint cannot_rate_self check (rater_id <> ratee_id)
);

alter table public.profile_ratings enable row level security;

create policy "Public ratings are viewable by everyone"
  on public.profile_ratings for select
  using (true);

create policy "Users can insert their own ratings"
  on public.profile_ratings for insert
  with check (auth.uid() = rater_id);

-- 4. 별점 반영 트리거 함수
create or replace function public.update_profile_rating_stats()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.profiles
    set 
      rating_sum = rating_sum + new.score,
      rating_count = rating_count + 1,
      rating_avg = (rating_sum + new.score)::numeric / (rating_count + 1)
    where id = new.ratee_id;
  elsif (tg_op = 'DELETE') then
    update public.profiles
    set 
      rating_sum = rating_sum - old.score,
      rating_count = rating_count - 1,
      rating_avg = case when (rating_count - 1) = 0 then 0 else (rating_sum - old.score)::numeric / (rating_count - 1) end
    where id = old.ratee_id;
  elsif (tg_op = 'UPDATE') then
    update public.profiles
    set 
      rating_sum = rating_sum - old.score + new.score,
      rating_avg = (rating_sum - old.score + new.score)::numeric / rating_count
    where id = new.ratee_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_rating_changed
  after insert or update or delete on public.profile_ratings
  for each row execute procedure public.update_profile_rating_stats();

-- 5. RPC 함수들

-- 완료 요청
create or replace function public.request_transaction_completion(p_transaction_id uuid)
returns void as $$
begin
  update public.transactions
  set 
    status = 'completion_requested',
    completion_requested_by = auth.uid(),
    updated_at = now()
  where id = p_transaction_id
    and (owner_id = auth.uid() or participant_id = auth.uid())
    and status = 'open';
end;
$$ language plpgsql security definer;

-- 완료 확정
create or replace function public.confirm_transaction_completion(p_transaction_id uuid)
returns void as $$
begin
  update public.transactions
  set 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where id = p_transaction_id
    and (owner_id = auth.uid() or participant_id = auth.uid())
    and completion_requested_by <> auth.uid()
    and status = 'completion_requested';
end;
$$ language plpgsql security definer;

-- 별점 제출
create or replace function public.submit_profile_rating(
  p_transaction_id uuid,
  p_ratee_id uuid,
  p_score integer,
  p_comment text
)
returns void as $$
begin
  -- 거래가 완료된 상태인지 확인
  if not exists (
    select 1 from public.transactions 
    where id = p_transaction_id and status = 'completed'
  ) then
    raise exception '거래가 완료된 상태에서만 평가할 수 있어요!';
  end if;

  insert into public.profile_ratings (transaction_id, rater_id, ratee_id, score, comment)
  values (p_transaction_id, auth.uid(), p_ratee_id, p_score, left(p_comment, 100));
end;
$$ language plpgsql security definer;
