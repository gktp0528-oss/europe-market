import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    User,
    ChevronRight,
    ShoppingBag,
    Bell,
    Settings,
    LogOut,
    Heart,
    FileText
} from 'lucide-react-native';

const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까? 😍',
            [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive', onPress: async () => await signOut() }
            ]
        );
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
            <Text style={styles.headerTitle}>내 프로필 👤</Text>

            {/* Profile Header Card */}
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
                <TouchableOpacity style={styles.editBtn}>
                    <Text style={styles.editBtnText}>편집</Text>
                </TouchableOpacity>
            </View>

            {/* Activity Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>판매중</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>45</Text>
                    <Text style={styles.statLabel}>관심목록</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>5</Text>
                    <Text style={styles.statLabel}>받은후기</Text>
                </View>
            </View>

            {/* Menu Sections */}
            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>나의 활동</Text>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#FFB7B222' }]}>
                        <FileText size={20} color="#FFB7B2" />
                    </View>
                    <Text style={styles.menuLabel}>내가 쓴 게시글</Text>
                    <ChevronRight size={18} color="#ccc" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#C7CEEA22' }]}>
                        <Heart size={20} color="#C7CEEA" />
                    </View>
                    <Text style={styles.menuLabel}>관심 목록</Text>
                    <ChevronRight size={18} color="#ccc" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#B5EAD722' }]}>
                        <ShoppingBag size={20} color="#B5EAD7" />
                    </Value>
                    <Text style={styles.menuLabel}>구매 내역</Text>
                    <ChevronRight size={18} color="#ccc" />
                </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>설정 및 지원</Text>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#F0F0F0' }]}>
                        <Bell size={20} color="#9B9B9B" />
                    </View>
                    <Text style={styles.menuLabel}>알림 설정</Text>
                    <ChevronRight size={18} color="#ccc" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: '#F0F0F0' }]}>
                        <Settings size={20} color="#9B9B9B" />
                    </View>
                    <Text style={styles.menuLabel}>앱 설정</Text>
                    <ChevronRight size={18} color="#ccc" />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
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
        backgroundColor: '#FEFDF5',
    },
    content: {
        padding: 24,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 24,
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
        flex: 1,
        marginLeft: 16,
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
    editBtn: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9B9B9B',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 20,
        borderRadius: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#9B9B9B',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#F0F0F0',
    },
    menuSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 16,
        marginLeft: 4,
        opacity: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 8,
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
        color: '#ccc',
        marginTop: 24,
    },
});

export default ProfileScreen;
