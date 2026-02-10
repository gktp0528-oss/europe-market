import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ChatUnreadContext = createContext();

export const ChatUnreadProvider = ({ children }) => {
    const { user } = useAuth();
    const [realtimeState, setRealtimeState] = useState({
        unreadByConversation: {},
        latestMessageEvent: null,
        latestMessageByConversation: {},
    });
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isChatListActive, setIsChatListActive] = useState(false);

    const shouldApplyAsLatest = useCallback((prev, incomingMsg) => {
        const current = prev.latestMessageByConversation[incomingMsg.conversation_id];
        if (!current) return true;

        const nextAt = new Date(incomingMsg.created_at).getTime();
        const currentAt = new Date(current.created_at).getTime();

        if (nextAt > currentAt) return true;
        if (nextAt < currentAt) return false;
        return String(incomingMsg.id) > String(current.id);
    }, []);

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

        const counts = (data || []).reduce((acc, msg) => {
            acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
            return acc;
        }, {});

        setRealtimeState((prev) => ({
            ...prev,
            unreadByConversation: counts,
        }));
    }, [user]);

    const markAsRead = useCallback(async (conversationId) => {
        if (!user || !conversationId) return;

        try {
            const { error } = await supabase.rpc('mark_conversation_read', {
                p_conversation_id: conversationId,
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
                table: 'messages',
            }, (payload) => {
                const newMsg = payload.new;
                const liveMessage = {
                    id: newMsg.id,
                    conversation_id: newMsg.conversation_id,
                    content: newMsg.content,
                    created_at: newMsg.created_at,
                    sender_id: newMsg.sender_id,
                };

                setRealtimeState((prev) => {
                    const isLatest = shouldApplyAsLatest(prev, liveMessage);
                    const next = {
                        ...prev,
                        latestMessageEvent: isLatest ? liveMessage : prev.latestMessageEvent,
                        latestMessageByConversation: {
                            ...prev.latestMessageByConversation,
                            [newMsg.conversation_id]: isLatest
                                ? liveMessage
                                : prev.latestMessageByConversation[newMsg.conversation_id],
                        },
                    };

                    if (newMsg.sender_id === user.id || newMsg.conversation_id === activeConversationId) {
                        return next;
                    }

                    return {
                        ...next,
                        unreadByConversation: {
                            ...prev.unreadByConversation,
                            [newMsg.conversation_id]: (prev.unreadByConversation[newMsg.conversation_id] || 0) + 1,
                        },
                    };
                });

                if (newMsg.sender_id === user.id) return;

                if (newMsg.conversation_id === activeConversationId) {
                    markAsRead(newMsg.conversation_id);
                    return;
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const updatedMsg = payload.new;
                const oldMsg = payload.old;

                if (updatedMsg.is_read && oldMsg?.is_read === false && updatedMsg.sender_id !== user.id) {
                    setRealtimeState((prev) => {
                        const current = prev.unreadByConversation[updatedMsg.conversation_id] || 0;
                        if (current <= 0) return prev;

                        if (current <= 1) {
                            const nextUnread = { ...prev.unreadByConversation };
                            delete nextUnread[updatedMsg.conversation_id];
                            return {
                                ...prev,
                                unreadByConversation: nextUnread,
                            };
                        }

                        return {
                            ...prev,
                            unreadByConversation: {
                                ...prev.unreadByConversation,
                                [updatedMsg.conversation_id]: current - 1,
                            },
                        };
                    });
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversations',
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
        }, 15000);

        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                refresh();
            }
        });

        return () => {
            clearInterval(intervalId);
            appStateSubscription.remove();
            supabase.removeChannel(channel);
        };
    }, [user, activeConversationId, refreshUnreadCounts, markAsRead, shouldApplyAsLatest]);

    const visibleUnreadByConversation = useMemo(() => {
        return user ? realtimeState.unreadByConversation : {};
    }, [user, realtimeState.unreadByConversation]);

    const totalUnread = useMemo(() => {
        if (isChatListActive) return 0;
        return Object.values(visibleUnreadByConversation).reduce((sum, count) => sum + count, 0);
    }, [isChatListActive, visibleUnreadByConversation]);

    const value = {
        unreadByConversation: visibleUnreadByConversation,
        totalUnread,
        latestMessageEvent: realtimeState.latestMessageEvent,
        latestMessageByConversation: realtimeState.latestMessageByConversation,
        activeConversationId,
        setActiveConversationId,
        isChatListActive,
        setIsChatListActive,
        markAsRead,
        refreshUnreadCounts,
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
