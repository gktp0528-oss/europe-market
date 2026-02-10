import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

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

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
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

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshNotifications: fetchUnreadCount }}>
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
