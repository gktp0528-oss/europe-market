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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    User,
    ChevronRight,
    Bell,
    Settings,
    LogOut,
    FileText,
    Star,
} from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const results = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single(),
                    supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id),
                    supabase
                        .from('profile_ratings')
                        .select(`
                            id, score, comment, created_at,
                            rater:profiles!rater_id(username, avatar_url)
                        `)
                        .eq('ratee_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(3),
                ]);

                const profileResult = results[0];
                const postsResult = results[1];
                const reviewsResult = results[2];

                if (profileResult.error) throw profileResult.error;

                setProfile(profileResult.data);
                setPostCount(postsResult.count || 0);
                setReviews(reviewsResult.data || []);
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
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
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

                        <View style={styles.ratingRow}>
                            <Star size={14} color="#FFB7B2" fill="#FFB7B2" />
                            <Text style={styles.ratingText}>
                                {profile?.rating_avg?.toFixed(1) || '0.0'} ({profile?.rating_count || 0})
                            </Text>
                        </View>
                    </View>
                </View>

                {reviews.length > 0 && (
                    <View style={styles.reviewSection}>
                        <Text style={styles.sectionTitle}>최근 받은 후기</Text>
                        {reviews.map((review) => (
                            <View key={review.id} style={styles.reviewItem}>
                                <View style={styles.reviewTop}>
                                    <Text style={styles.raterName}>{review.rater?.username}</Text>
                                    <View style={styles.raterRating}>
                                        <Star size={10} color="#FFB7B2" fill="#FFB7B2" />
                                        <Text style={styles.raterScore}>{review.score}</Text>
                                    </View>
                                </View>
                                {review.comment && (
                                    <Text style={styles.reviewText}>{review.comment}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>나의 활동</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyPosts')}>
                        <View style={[styles.menuIcon, { backgroundColor: '#FFB7B222' }]}>
                            <FileText size={20} color="#FFB7B2" />
                        </View>
                        <Text style={styles.menuLabel}>내가 쓴 글</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{postCount}</Text>
                        </View>
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

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={18} color="#9B9B9B" />
                    <Text style={styles.logoutText}>로그아웃</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>버전 1.0.0 (Expo)</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#FFFFFF',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 20,
        marginBottom: 10,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
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
        marginLeft: 16,
        flex: 1,
    },
    nickname: {
        fontSize: 18,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 2,
    },
    email: {
        fontSize: 13,
        color: '#9B9B9B',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    reviewSection: {
        marginBottom: 24,
        marginTop: 10,
    },
    reviewItem: {
        backgroundColor: '#F9F9F9',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    reviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    raterName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6A6A6A',
    },
    raterRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    raterScore: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFB7B2',
    },
    reviewText: {
        fontSize: 14,
        color: '#4A4A4A',
        lineHeight: 20,
    },
    menuSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 14,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FBFBFB',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 8,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#4A4A4A',
        marginLeft: 12,
    },
    badge: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9B9B9B',
    },
    disabledItem: {
        opacity: 0.6,
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
        paddingVertical: 16,
        marginTop: 10,
        marginBottom: 20,
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
        color: '#D0D0D0',
        marginBottom: 20,
    },
});

export default ProfileScreen;
