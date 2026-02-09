import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. 초기 세션 가져오기
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
            })
            .catch((err) => {
                console.error('Error getting initial session:', err);
            })
            .finally(() => {
                setLoading(false);
            });

        // 2. 인증 상태 변화 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        session,
        user,
        signOut,
        loading
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>하은마켓 로딩 중... 🎨✨</Text>
            </View>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEFDF5',
    },
    loadingText: {
        fontSize: 16,
        color: '#FFB7B2',
        fontWeight: '700',
    },
});
