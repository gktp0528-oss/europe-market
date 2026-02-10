import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Expo에서는 EXPO_PUBLIC_ 접두사가 붙은 환경 변수를 자동으로 불러와요!
// 하지만 기존 .env.local의 변수들도 process.env로 접근 가능할 수 있으니 체크할게요.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const getStorageKey = (url) => {
    try {
        const host = new URL(url).host || '';
        const projectRef = host.split('.')[0] || 'default';
        return `sb-${projectRef}-auth-token`;
    } catch {
        return 'sb-europe-market-auth-token';
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        storageKey: getStorageKey(supabaseUrl),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
