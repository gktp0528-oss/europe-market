import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { requestForToken } from '../lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const saveFCMToken = useCallback(async (userId) => {
        try {
            if (typeof window === 'undefined' || typeof Notification === 'undefined') {
                return;
            }

            // 알림 권한 명시적 요청
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }
            }

            const token = await requestForToken();
            if (token) {
                const { error } = await supabase
                    .from('user_fcm_tokens')
                    .upsert({
                        user_id: userId,
                        fcm_token: token,
                        device_type: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' :
                            /Android/i.test(navigator.userAgent) ? 'android' : 'web',
                        last_updated: new Date().toISOString()
                    }, { onConflict: 'user_id, fcm_token' });

                if (error) console.error('Error saving FCM token:', error);
            }
        } catch (err) {
            console.error('FCM Token error:', err);
        }
    }, []);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) saveFCMToken(currentUser.id);
            })
            .catch((err) => {
                console.error('Error getting initial session:', err);
            })
            .finally(() => {
                setLoading(false);
            });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (event === 'SIGNED_IN' && currentUser) {
                saveFCMToken(currentUser.id);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [saveFCMToken]);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        session,
        user,
        signOut,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="flex-center full-screen">앱 로딩 중...</div> : children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};
