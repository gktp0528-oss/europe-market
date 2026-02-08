-- Add user_id column to posts table
alter table public.posts 
add column if not exists user_id uuid references public.profiles(id);

-- Optional: Index on user_id for performance
create index if not exists posts_user_id_idx on public.posts(user_id);
