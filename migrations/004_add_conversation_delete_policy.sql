-- Add delete policy for conversations table
-- This allows users to delete conversations they are a participant in.
-- Due to 'on delete cascade' on messages.conversation_id, this will also delete all associated messages.

create policy "Users can delete their own conversations"
  on public.conversations for delete
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);
