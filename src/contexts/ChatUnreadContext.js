import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ChatUnreadContext = createContext();

export const ChatUnreadProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadByConversation, setUnreadByConversation] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const refreshTimerRef = useRef(null);

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

    const scheduleRefresh = useCallback((delayMs = 250) => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = setTimeout(() => {
            refreshUnreadCounts();
            refreshTimerRef.current = null;
        }, delayMs);
    }, [refreshUnreadCounts]);

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

                if (newMsg.sender_id === user.id) return;

                if (newMsg.conversation_id === activeConversationId) {
                    markAsRead(newMsg.conversation_id);
                    return;
                }

                setUnreadByConversation(prev => ({
                    ...prev,
                    [newMsg.conversation_id]: (prev[newMsg.conversation_id] || 0) + 1
                }));
                // 즉시 UI 반영 후 짧은 지연 동기화로 정확도 보정
                scheduleRefresh(300);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const updatedMsg = payload.new;
                const oldMsg = payload.old;
                if (updatedMsg.is_read && oldMsg?.is_read === false && updatedMsg.sender_id !== user.id) {
                    setUnreadByConversation(prev => {
                        const current = prev[updatedMsg.conversation_id] || 0;
                        if (current <= 1) {
                            const next = { ...prev };
                            delete next[updatedMsg.conversation_id];
                            return next;
                        }
                        return {
                            ...prev,
                            [updatedMsg.conversation_id]: current - 1,
                        };
                    });
                    scheduleRefresh(300);
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

        const intervalId = setInterval(() => {
            refresh();
        }, 8000);

        // AppState로 앱이 foreground로 돌아올 때 새로고침
        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                refresh();
            }
        });

        return () => {
            clearInterval(intervalId);
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
            appStateSubscription.remove();
            supabase.removeChannel(channel);
        };
    }, [user, activeConversationId, refreshUnreadCounts, markAsRead, scheduleRefresh]);

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

export const useChatUnread = () => {
    const context = useContext(ChatUnreadContext);
    if (!context) {
        throw new Error('useChatUnread must be used within a ChatUnreadProvider');
    }
    return context;
};
