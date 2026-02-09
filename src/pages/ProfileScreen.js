import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    User,
    ChevronRight,
    Bell,
    Settings,
    LogOut,
    FileText,
} from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const [{ data, error }, { count, error: countError }] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single(),
                    supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id),
                ]);

                if (error) throw error;
                if (countError) throw countError;

                setProfile(data);
                setPostCount(count || 0);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = () => {
        Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '로그아웃', style: 'destructive', onPress: async () => await signOut() },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator color="#FFB7B2" size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>마이페이지</Text>

            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={styles.defaultAvatar}>
                            <User size={30} color="#ccc" />
                        </View>
                    )}
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.nickname}>
                        {profile?.username || user?.email?.split('@')[0] || '사용자님'}
                    </Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
            </View>

            <View style={styles.metaCard}>
                <Text style={styles.metaText}>작성한 게시글 {postCount}개</Text>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>나의 활동</Text>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyPosts')}>
                    <View style={[styles.menuIcon, { backgroundColor: '#FFB7B222' }]}>
                        <FileText size={20} color="#FFB7B2" />
                    </View>
                    <Text style={styles.menuLabel}>내가 쓴 글</Text>
                    <ChevronRight size={18} color="#ccc" />
                </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>설정</Text>
                <View style={[styles.menuItem, styles.disabledItem]}>
                    <View style={[styles.menuIcon, { backgroundColor: '#F0F0F0' }]}>
                        <Bell size={20} color="#9B9B9B" />
                    </View>
                    <Text style={styles.menuLabel}>알림 설정</Text>
                    <Text style={styles.soon}>준비중</Text>
                    <ChevronRight size={18} color="#ccc" />
                </View>
                <View style={[styles.menuItem, styles.disabledItem]}>
                    <View style={[styles.menuIcon, { backgroundColor: '#F0F0F0' }]}>
                        <Settings size={20} color="#9B9B9B" />
                    </View>
                    <Text style={styles.menuLabel}>앱 설정</Text>
                    <Text style={styles.soon}>준비중</Text>
                    <ChevronRight size={18} color="#ccc" />
                </View>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>고객센터</Text>
                <View style={styles.menuItem}>
                    <Text style={styles.menuLabel}>공지사항</Text>
                    <ChevronRight size={18} color="#ccc" />
                </View>
                <View style={styles.menuItem}>
                    <Text style={styles.menuLabel}>자주 묻는 질문</Text>
                    <ChevronRight size={18} color="#ccc" />
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={18} color="#9B9B9B" />
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>버전 1.0.0 (Expo)</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEFDF5',
    },
    profileCard: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#F0F0F0',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    defaultAvatar: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        marginTop: 12,
        alignItems: 'center',
    },
    nickname: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4A4A4A',
        marginBottom: 4,
    },
    email: {
        fontSize: 13,
        color: '#9B9B9B',
    },
    metaCard: {
        backgroundColor: '#fff',
        borderRadius: 0,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 10,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    menuSection: {
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#9B9B9B',
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: '#4A4A4A',
        marginLeft: 12,
    },
    disabledItem: {
        opacity: 0.7,
    },
    soon: {
        marginRight: 8,
        fontSize: 12,
        color: '#9B9B9B',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 8,
        marginBottom: 24,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#9B9B9B',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#C0C0C0',
    },
});

export default ProfileScreen;
