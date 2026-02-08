import { supabase } from './supabase';

export const startChat = async (currentUserId, otherUserId, postId = null) => {
    if (!currentUserId || !otherUserId) throw new Error('Invalid users');
    if (currentUserId === otherUserId) throw new Error('Cannot chat with yourself');

    try {
        // 1. Check existing conversation
        // We look for a conversation where (p1=me AND p2=other) OR (p1=other AND p2=me)
        // AND post_id matches
        let query = supabase
            .from('conversations')
            .select('id, participant1_id, participant2_id, post_id')
            .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`);

        if (postId) {
            query = query.eq('post_id', postId);
        } else {
            // If no postId provided, look for general chat (post_id is null)
            query = query.is('post_id', null);
        }

        const { data: existingList, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const existing = existingList.find(c =>
            (c.participant1_id === currentUserId && c.participant2_id === otherUserId) ||
            (c.participant1_id === otherUserId && c.participant2_id === currentUserId)
        );

        if (existing) return existing.id;

        // 2. Create new conversation
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
                participant1_id: currentUserId,
                participant2_id: otherUserId,
                post_id: postId,
                updated_at: new Date().toISOString(),
                last_message: '대화가 시작되었습니다.'
            })
            .select()
            .single();

        if (createError) throw createError;
        return newConv.id;

    } catch (error) {
        console.error('Error in startChat:', error);
        throw error;
    }
};
