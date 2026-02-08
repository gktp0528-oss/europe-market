import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ChatUnreadContext = createContext();

export const ChatUnreadProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadByConversation, setUnreadByConversation] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);

    // 1. 전체/방별 미읽음 개수 조회
    const refreshUnreadCounts = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('is_read', false)
            .neq('sender_id', user.id);

        if (error) {
            console.error('Error fetching unread counts:', error);
            return;
        }

        const counts = data.reduce((acc, msg) => {
            acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
            return acc;
        }, {});

        setUnreadByConversation(counts);
    }, [user]);

    // 2. 특정 방 읽음 처리
    const markAsRead = useCallback(async (conversationId) => {
        if (!user || !conversationId) return;

        try {
            await supabase.rpc('mark_conversation_read', {
                p_conversation_id: conversationId
            });

            setUnreadByConversation(prev => {
                const newCounts = { ...prev };
                delete newCounts[conversationId];
                return newCounts;
            });
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    }, [user]);

    // 3. 실시간 메시지 구독 (Global)
    useEffect(() => {
        if (!user) {
            setUnreadByConversation({});
            return;
        }

        refreshUnreadCounts();

        const channel = supabase
            .channel('global_unread_notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const newMsg = payload.new;

                // 내 메시지면 무시
                if (newMsg.sender_id === user.id) return;

                // 현재 내가 보고 있는 방이면 즉시 읽음 처리 및 카운트 제외
                if (newMsg.conversation_id === activeConversationId) {
                    markAsRead(newMsg.conversation_id);
                    return;
                }

                // 그 외의 경우 카운트 증가
                setUnreadByConversation(prev => ({
                    ...prev,
                    [newMsg.conversation_id]: (prev[newMsg.conversation_id] || 0) + 1
                }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, activeConversationId, refreshUnreadCounts, markAsRead]);

    const totalUnread = useMemo(() => {
        return Object.values(unreadByConversation).reduce((sum, count) => sum + count, 0);
    }, [unreadByConversation]);

    const value = {
        unreadByConversation,
        totalUnread,
        activeConversationId,
        setActiveConversationId,
        markAsRead,
        refreshUnreadCounts
    };

    return (
        <ChatUnreadContext.Provider value={value}>
            {children}
        </ChatUnreadContext.Provider>
    );
};

export const useChatUnread = () => {
    const context = useContext(ChatUnreadContext);
    if (!context) {
        throw new Error('useChatUnread must be used within a ChatUnreadProvider');
    }
    return context;
};
