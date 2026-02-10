import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Heart,
    Share2,
    MessageCircle,
    MapPin,
    Clock,
    Eye,
    User,
    Star,
    DollarSign,
    Briefcase,
    MoreVertical,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { sharePost } from '../utils/shareUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';

const JobDetailScreen = ({ navigation, route }) => {
    const { postId } = route.params;
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const nowTick = useMinuteTicker();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const normalizedPostId = Number(postId);

    const fetchDetail = useCallback(async () => {
        if (!Number.isFinite(normalizedPostId)) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        username,
                        full_name,
                        avatar_url,
                        rating_avg
                    )
                `)
                .eq('id', normalizedPostId)
                .single();

            if (error) throw error;

            setPost(data);
            setLikeCount(data.likes || 0);

            try {
                await supabase.rpc('increment_views', { post_id: normalizedPostId });
            } catch (viewError) {
                console.warn('View increment failed:', viewError);
            }

            if (user) {
                const { data: likeData, error: likeError } = await supabase.rpc('check_user_like', {
                    p_post_id: normalizedPostId,
                });
                if (likeError) {
                    console.warn('check_user_like warning:', likeError.message);
                }
                setLiked(!!likeData);
            }
        } catch (error) {
            console.error('Error fetching job detail:', error);
        } finally {
            setLoading(false);
        }
    }, [normalizedPostId, user]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleLike = async () => {
        if (!user) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        if (!Number.isFinite(normalizedPostId)) {
            Alert.alert('오류', '게시물 정보를 불러올 수 없습니다.');
            return;
        }

        const nextLiked = !liked;
        setLiked(nextLiked);
        setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

        try {
            await supabase.rpc('toggle_like', { p_post_id: normalizedPostId });
        } catch (error) {
            setLiked(!nextLiked);
            setLikeCount((prev) => (nextLiked ? prev - 1 : prev + 1));
            console.error('Like error:', error);
        }
    };

    const handleChat = () => {
        if (!user) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        if (post?.user_id === user.id) {
            Alert.alert('알림', '본인의 게시물입니다.');
            return;
        }

        if (!post?.user_id) {
            Alert.alert('알림', '작성자 정보를 찾을 수 없습니다.');
            return;
        }

        navigation.navigate('ChatRoom', { postId: normalizedPostId, sellerId: post.user_id });
    };

    const handleOpenMap = async () => {
        if (!post?.location) return;

        const encoded = encodeURIComponent(post.location);
        const url = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Failed to open map:', error);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            '게시물 삭제',
            '정말 이 게시물을 삭제하시겠어요? 삭제하면 되돌릴 수 없어요! 🗑️',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('posts').delete().eq('id', normalizedPostId);
                            if (error) throw error;
                            Alert.alert('성공', '게시물이 삭제되었습니다! ✨');
                            navigation.goBack();
                        } catch (err) {
                            console.error('Delete error:', err);
                            Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        navigation.navigate('WriteJob', { editPost: post });
    };

    const showMenu = () => {
        Alert.alert(
            '게시물 관리',
            '실행할 작업을 선택해주세요! ✨',
            [
                { text: '게시물 수정', onPress: handleEdit },
                { text: '게시물 삭제', onPress: handleDelete, style: 'destructive' },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    const openUserProfile = () => {
        if (!post?.user_id) {
            Alert.alert('알림', '작성자 정보를 찾을 수 없습니다.');
            return;
        }

        const params = { userId: post.user_id };
        const currentState = navigation.getState?.();

        if (currentState?.routeNames?.includes('UserProfile')) {
            navigation.navigate('UserProfile', params);
            return;
        }

        const parent = navigation.getParent?.();
        const parentState = parent?.getState?.();
        if (parentState?.routeNames?.includes('Home')) {
            parent.navigate('Home', { screen: 'UserProfile', params });
            return;
        }

        const root = parent?.getParent?.();
        const rootState = root?.getState?.();
        if (rootState?.routeNames?.includes('Main')) {
            root.navigate('Main', { screen: 'Home', params: { screen: 'UserProfile', params } });
            return;
        }

        navigation.navigate('UserProfile', params);
    };

    const hasImages = Array.isArray(post?.image_urls) && post.image_urls.length > 0;

    const nextImage = () => {
        if (!hasImages) return;
        setCurrentImageIndex((prev) => (prev + 1) % post.image_urls.length);
    };

    const prevImage = () => {
        if (!hasImages) return;
        setCurrentImageIndex((prev) => (prev - 1 + post.image_urls.length) % post.image_urls.length);
    };

    const { requirements, descriptionBody } = useMemo(() => {
        if (!post?.description) return { requirements: '상세 내용 확인', descriptionBody: '' };

        if (!post.description.includes('[자격요건]')) {
            return { requirements: '상세 내용 확인', descriptionBody: post.description };
        }

        const parts = post.description.split('[상세내용]');
        if (parts.length > 1) {
            return {
                requirements: parts[0].replace('[자격요건]', '').trim() || '상세 내용 확인',
                descriptionBody: parts[1].trim(),
            };
        }

        return { requirements: '상세 내용 확인', descriptionBody: post.description };
    }, [post]);

    const jobKeywords = useMemo(() => {
        if (!post) return ['구인'];

        const metadataTags = Array.isArray(post.metadata?.tags) ? post.metadata.tags.filter(Boolean) : [];
        if (metadataTags.length > 0) return metadataTags.slice(0, 3);

        const hashTags = `${post.title || ''} ${post.description || ''}`
            .match(/#[^\s#]+/g)
            ?.map((tag) => tag.replace('#', ''))
            .filter(Boolean);

        if (hashTags?.length) return hashTags.slice(0, 3);

        return ['구인'];
    }, [post]);

    const sellerName = post?.profiles?.username || post?.profiles?.full_name || '작성자';

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>게시물을 찾을 수 없습니다.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.flexOne}>
                <View style={[styles.header, { paddingTop: 8 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <ArrowLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => sharePost(post.title, post.description)} style={styles.headerBtn}>
                            <Share2 size={20} color="#000" />
                        </TouchableOpacity>

                        {user?.id === post?.user_id && (
                            <TouchableOpacity onPress={showMenu} style={styles.headerBtn}>
                                <MoreVertical size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView
                    style={styles.flexOne}
                    contentContainerStyle={{ paddingTop: 88, paddingBottom: 90 + insets.bottom }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <View style={styles.keywordRow}>
                            {jobKeywords.map((keyword) => (
                                <View key={keyword} style={styles.keywordBadge}>
                                    <Text style={styles.keywordText}>#{keyword}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.title}>{post.title}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Clock size={14} color="#888" />
                                <Text style={styles.metaText}>{getPostTimeLabel(post, nowTick)}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Eye size={14} color="#888" />
                                <Text style={styles.metaText}>{post.views || 0}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Heart size={14} color="#888" />
                                <Text style={styles.metaText}>{likeCount}</Text>
                            </View>
                        </View>

                        <View style={styles.unifiedInfoCard}>
                            <View style={styles.infoRow}>
                                <View style={styles.iconBox}>
                                    <DollarSign size={20} color="#555" />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>급여</Text>
                                    <Text style={[styles.infoValue, styles.boldValue]} numberOfLines={1}>{post.price || '급여 협의'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.iconBox}>
                                    <Calendar size={20} color="#555" />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>근무일시</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>{post.trade_time || '일정 협의'}</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.infoRow, styles.infoRowLast]} onPress={handleOpenMap}>
                                <View style={styles.iconBox}>
                                    <MapPin size={20} color="#555" />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>위치 (지도보기)</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>{post.location || '위치 미정'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {hasImages ? (
                            <View style={styles.compactMediaCard}>
                                <View style={styles.compactMediaFrame}>
                                    <Image source={{ uri: post.image_urls[currentImageIndex] }} style={styles.compactMediaImage} />

                                    {post.image_urls.length > 1 ? (
                                        <>
                                            <TouchableOpacity style={[styles.compactSliderBtn, styles.compactSliderPrev]} onPress={prevImage}>
                                                <ChevronLeft size={20} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.compactSliderBtn, styles.compactSliderNext]} onPress={nextImage}>
                                                <ChevronRight size={20} color="#fff" />
                                            </TouchableOpacity>
                                            <View style={styles.compactDots}>
                                                {post.image_urls.map((_, idx) => (
                                                    <View key={idx} style={[styles.compactDot, idx === currentImageIndex && styles.compactDotActive]} />
                                                ))}
                                            </View>
                                        </>
                                    ) : null}
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.requirementsSection}>
                            <Text style={styles.requirementsTitle}>자격요건</Text>
                            <Text style={styles.requirementsBody}>{requirements}</Text>
                        </View>

                        <View style={styles.sellerCard}>
                            <View style={styles.sellerLeft}>
                                <View style={styles.avatarCircle}>
                                    {post.profiles?.avatar_url ? (
                                        <Image source={{ uri: post.profiles.avatar_url }} style={styles.avatarImage} />
                                    ) : (
                                        <User size={28} color="#4A4A4A" />
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.sellerName}>{sellerName}</Text>
                                    <View style={styles.ratingBadge}>
                                        <Star size={14} color="#FFB7B2" fill="#FFB7B2" />
                                        <Text style={styles.ratingText}>
                                            {post.profiles?.rating_avg?.toFixed(1) || '0.0'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.profileBtn}
                                onPress={openUserProfile}
                            >
                                <Text style={styles.profileBtnText}>프로필</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionTitle}>상세 내용</Text>
                            <Text style={styles.descriptionBody}>{descriptionBody || '-'}</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.bottomBar, { paddingBottom: Math.max(12, insets.bottom) }]}>
                    <TouchableOpacity style={[styles.likeBtnBottom, liked && styles.likeBtnBottomActive]} onPress={handleLike}>
                        <Heart size={24} color={liked ? '#ff4d4f' : '#666'} fill={liked ? '#ff4d4f' : 'none'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.applyBtn} onPress={handleChat}>
                        <MessageCircle size={20} color="#fff" />
                        <Text style={styles.applyBtnText}>지원하기 (채팅)</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    flexOne: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    errorText: { fontSize: 16, color: '#9B9B9B' },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerActions: { flexDirection: 'row', gap: 10 },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { paddingHorizontal: 24, paddingBottom: 8 },
    keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    keywordBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
    },
    keywordText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
    title: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 28,
        color: '#333',
        marginBottom: 8,
    },
    metaRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: '#888' },
    unifiedInfoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    infoRowLast: { borderBottomWidth: 0 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextWrap: { flex: 1, minWidth: 0 },
    infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
    boldValue: { fontWeight: '700' },
    compactMediaCard: {
        marginBottom: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
    },
    compactMediaFrame: { position: 'relative', width: '100%', height: 220, backgroundColor: '#f1f3f5' },
    compactMediaImage: { width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: '#f8f9fa' },
    compactSliderBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -17,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(0,0,0,0.32)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactSliderPrev: { left: 10 },
    compactSliderNext: { right: 10 },
    compactDots: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    compactDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
    compactDotActive: { backgroundColor: '#fff' },
    requirementsSection: {
        padding: 20,
        backgroundColor: '#F1F8E9',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(76,175,80,0.1)',
        marginBottom: 20,
    },
    requirementsTitle: { fontSize: 14, fontWeight: '700', color: '#2E7D32', marginBottom: 8 },
    requirementsBody: { fontSize: 14, color: '#333', lineHeight: 21 },
    sellerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sellerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, marginRight: 12 },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3E5F5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    sellerName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF9C4',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    ratingText: { fontSize: 13, fontWeight: '600', color: '#333' },
    profileBtn: { backgroundColor: '#E8EAF6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexShrink: 0 },
    profileBtnText: { fontSize: 13, fontWeight: '700', color: '#3F51B5' },
    descriptionSection: { marginTop: 4 },
    descriptionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
    descriptionBody: { fontSize: 15, lineHeight: 24, color: '#333' },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    likeBtnBottom: {
        width: 48,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    likeBtnBottomActive: { borderColor: '#ff4d4f' },
    applyBtn: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#43A047',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    applyBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default JobDetailScreen;
