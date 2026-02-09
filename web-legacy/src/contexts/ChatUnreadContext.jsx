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
            const { error } = await supabase.rpc('mark_conversation_read', {
                p_conversation_id: conversationId
            });

            if (error) {
                console.error('Error marking as read via RPC:', error);
                const { error: fallbackError } = await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .eq('conversation_id', conversationId)
                    .neq('sender_id', user.id)
                    .eq('is_read', false);

                if (fallbackError) {
                    console.error('Fallback mark-as-read failed:', fallbackError);
                    return;
                }
            }

            await refreshUnreadCounts();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    }, [refreshUnreadCounts, user]);

    // 3. 실시간 메시지 구독 (Global)
    useEffect(() => {
        if (!user) return;

        const refresh = () => {
            refreshUnreadCounts();
        };

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

                // 빠른 UI 반영 후 서버값으로 동기화
                setUnreadByConversation(prev => ({
                    ...prev,
                    [newMsg.conversation_id]: (prev[newMsg.conversation_id] || 0) + 1
                }));
                refresh();
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const updatedMsg = payload.new;
                if (updatedMsg.is_read) {
                    refresh();
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversations'
            }, () => {
                refresh();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    refresh();
                }
            });

        const intervalId = window.setInterval(() => {
            refresh();
        }, 8000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', refresh);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', refresh);
            supabase.removeChannel(channel);
        };
    }, [user, activeConversationId, refreshUnreadCounts, markAsRead]);

    const visibleUnreadByConversation = useMemo(() => {
        return user ? unreadByConversation : {};
    }, [user, unreadByConversation]);

    const totalUnread = useMemo(() => {
        return Object.values(visibleUnreadByConversation).reduce((sum, count) => sum + count, 0);
    }, [visibleUnreadByConversation]);

    const value = {
        unreadByConversation: visibleUnreadByConversation,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useChatUnread = () => {
    const context = useContext(ChatUnreadContext);
    if (!context) {
        throw new Error('useChatUnread must be used within a ChatUnreadProvider');
    }
    return context;
};
