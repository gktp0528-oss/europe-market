-- ============================================================
-- Chat unread workflow support
-- ============================================================
-- 1) unread 집계 성능 인덱스
create index if not exists messages_conversation_unread_idx
  on public.messages(conversation_id, is_read, sender_id, created_at);

-- 2) 채팅방 읽음 처리 RPC
create or replace function public.mark_conversation_read(
  p_conversation_id uuid
)
returns integer as $$
declare
  updated_count integer;
begin
  update public.messages m
  set is_read = true
  where m.conversation_id = p_conversation_id
    and m.sender_id <> auth.uid()
    and m.is_read = false
    and exists (
      select 1
      from public.conversations c
      where c.id = m.conversation_id
        and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql security definer
set search_path = public, auth;

grant execute on function public.mark_conversation_read(uuid) to authenticated;
