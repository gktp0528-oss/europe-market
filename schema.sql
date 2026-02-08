-- Create a table for conversations
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  participant1_id uuid references public.profiles(id) not null,
  participant2_id uuid references public.profiles(id) not null,
  last_message text,
  constraint participants_distinct check (participant1_id != participant2_id)
);

-- Enable RLS
alter table public.conversations enable row level security;

-- Policy: Users can view their own conversations
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);

-- Policy: Users can insert conversations (usually initiated by one user)
create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant1_id or auth.uid() = participant2_id);


-- Create a table for messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  is_read boolean default false,
  image_url text
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policy: Users can view messages in their conversations
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );

-- Policy: Users can insert messages in their conversations
create policy "Users can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );

-- Enable RLS on posts
alter table public.posts enable row level security;

-- Policy: Anyone can read posts
create policy "Anyone can view posts"
  on public.posts for select
  using (true);

-- Policy: Authenticated users can create posts (must own the row)
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own posts
create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own posts
create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Policy: Users can update their own conversations (for last_message)
create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);

-- Function to handle new user profile creation (Idempotent)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
