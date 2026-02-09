import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User as UserIcon, Star, MapPin, FileText } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CATEGORY_ROUTE_MAP = {
    used: 'ProductDetail',
    job: 'JobDetail',
    tutoring: 'TutoringDetail',
    meetup: 'MeetupDetail',
};

const UserProfileScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const { userId } = route.params || {};
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const [{ data: profileData, error: profileError }, { data: postsData, error: postsError }] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, username, avatar_url')
                        .eq('id', userId)
                        .single(),
                    supabase
                        .from('posts')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(20),
                ]);

                if (profileError) throw profileError;
                if (postsError) throw postsError;

                setProfile(profileData);
                setPosts(postsData || []);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const openPost = (post) => {
        const detailRoute = CATEGORY_ROUTE_MAP[post.category];
        if (!detailRoute) return;

        const parent = navigation.getParent();
        if (parent) {
            parent.navigate('Home', { screen: detailRoute, params: { postId: post.id } });
            return;
        }

        navigation.navigate(detailRoute, { postId: post.id });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.centerWrap}>
                    <ActivityIndicator size="large" color="#FFB7B2" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>프로필</Text>
                <View style={styles.backBtn} />
            </View>

            {!profile ? (
                <View style={styles.centerWrap}>
                    <Text style={styles.emptyText}>사용자 정보를 찾을 수 없습니다.</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.profileCard}>
                            <View style={styles.avatarWrap}>
                                {profile.avatar_url ? (
                                    <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <UserIcon size={34} color="#BFBFBF" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.username}>{profile.username || '익명'}</Text>
                            <View style={styles.rating}>
                                <Star size={14} color="#F4B400" fill="#F4B400" />
                                <Text style={styles.ratingText}>5.0</Text>
                            </View>
                            <Text style={styles.postCount}>게시글 {posts.length}개</Text>
                            {user?.id === userId ? (
                                <TouchableOpacity style={styles.editBtn}>
                                    <Text style={styles.editBtnText}>내 프로필</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.postCard} onPress={() => openPost(item)}>
                            <View style={styles.postImageWrap}>
                                {item.image_urls?.length ? (
                                    <Image source={{ uri: item.image_urls[0] }} style={styles.postImage} />
                                ) : (
                                    <View style={[styles.postImage, styles.postPlaceholder]} />
                                )}
                            </View>
                            <View style={styles.postInfo}>
                                <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
                                <Text style={styles.postPrice} numberOfLines={1}>
                                    {item.price || '가격 협의'}
                                </Text>
                                <View style={styles.postLocation}>
                                    <MapPin size={11} color="#9B9B9B" />
                                    <Text style={styles.postLocationText} numberOfLines={1}>
                                        {item.location || '위치 미정'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <FileText size={42} color="#D0D0D0" />
                            <Text style={styles.emptyText}>등록된 게시글이 없습니다.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEFDF5' },
    header: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    backBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#4A4A4A' },
    centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 30 },
    profileCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarWrap: { marginBottom: 10 },
    avatar: { width: 82, height: 82, borderRadius: 41 },
    avatarPlaceholder: {
        width: 82,
        height: 82,
        borderRadius: 41,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F0F0',
    },
    username: { fontSize: 18, fontWeight: '800', color: '#4A4A4A' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    ratingText: { fontSize: 13, fontWeight: '700', color: '#4A4A4A' },
    postCount: { marginTop: 6, fontSize: 13, color: '#9B9B9B' },
    editBtn: {
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: '#F6F6F6',
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6A6A6A',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    postCard: {
        width: '48.5%',
        backgroundColor: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    postImageWrap: {
        width: '100%',
        aspectRatio: 1,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    postPlaceholder: {
        backgroundColor: '#ECECEC',
    },
    postInfo: {
        padding: 10,
        gap: 4,
    },
    postTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A4A4A',
        lineHeight: 18,
    },
    postPrice: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    postLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postLocationText: {
        flex: 1,
        fontSize: 11,
        color: '#9B9B9B',
    },
    emptyWrap: { paddingTop: 70, alignItems: 'center', gap: 10 },
    emptyText: { fontSize: 14, color: '#9B9B9B' },
});

export default UserProfileScreen;
