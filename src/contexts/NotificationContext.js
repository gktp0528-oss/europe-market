import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAlarmActive, setIsAlarmActive] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (!error) {
                setUnreadCount(count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    }, [user]);

    const markAllAsRead = useCallback(async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            setIsAlarmActive(false);
            return;
        }

        fetchUnreadCount();

        const channel = supabase
            .channel(`notification_badge_${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchUnreadCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchUnreadCount]);

    useEffect(() => {
        if (!user) return;

        // 10초마다 강제 동기화 (구독 누락 대비)
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 10000);

        return () => clearInterval(interval);
    }, [user, fetchUnreadCount]);

    const visibleUnreadCount = useMemo(() => {
        return isAlarmActive ? 0 : unreadCount;
    }, [isAlarmActive, unreadCount]);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount: visibleUnreadCount,
                rawUnreadCount: unreadCount,
                isAlarmActive,
                setIsAlarmActive,
                markAllAsRead,
                refreshNotifications: fetchUnreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
