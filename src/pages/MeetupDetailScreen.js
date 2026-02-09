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
    Users,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Monitor,
    UserPlus,
    CheckCircle,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { sharePost } from '../utils/shareUtils';

const MeetupDetailScreen = ({ navigation, route }) => {
    const { postId } = route.params;
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

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
            console.error('Error fetching meetup detail:', error);
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

    const hasImages = Array.isArray(post?.image_urls) && post.image_urls.length > 0;

    const nextImage = () => {
        if (!hasImages) return;
        setCurrentImageIndex((prev) => (prev + 1) % post.image_urls.length);
    };

    const prevImage = () => {
        if (!hasImages) return;
        setCurrentImageIndex((prev) => (prev - 1 + post.image_urls.length) % post.image_urls.length);
    };

    const {
        metadata,
        tags,
        onOffline,
        approvalType,
        displayDate,
        displayTime,
        displayFee,
        maxMembers,
        descriptionBody,
    } = useMemo(() => {
        if (!post) {
            return {
                metadata: {},
                tags: [],
                onOffline: 'offline',
                approvalType: 'first-come',
                displayDate: '날짜 미정',
                displayTime: '시간 미정',
                displayFee: '회비 문의',
                maxMembers: '0',
                descriptionBody: '',
            };
        }

        const nextMetadata = post.metadata || {};
        const nextTags = nextMetadata.tags || [];
        const nextOnOffline = nextMetadata.onOffline || 'offline';
        const nextApprovalType = nextMetadata.approvalType || 'first-come';
        const startTime = nextMetadata.startTime || '';
        const endTime = nextMetadata.endTime || '';
        const meetupType = nextMetadata.meetupType || 'one-time';
        const repeatDays = nextMetadata.repeatDays || [];
        const repeatCycle = nextMetadata.repeatCycle || '매주';

        let nextMaxMembers = nextMetadata.members || '0';
        let nextDescriptionBody = post.description || '';

        if (!nextMetadata.members && post.description?.includes('모집 인원:')) {
            const parts = post.description.split('\n\n');
            if (parts.length > 0) {
                nextMaxMembers = parts[0].replace('모집 인원:', '').replace('명', '').trim();
                nextDescriptionBody = parts.slice(1).join('\n\n');
            }
        }

        const isNewFormat = post.trade_time != null;
        const isRecurring = meetupType === 'recurring';

        const nextDisplayDate = isRecurring
            ? `${repeatCycle} (${repeatDays.join(', ')})`
            : (post.trade_time
                ? String(post.trade_time).split(' ')[0]
                : (post.price && String(post.price).includes('-') ? post.price : '날짜 미정'));

        const nextDisplayTime = startTime && endTime
            ? `${startTime} ~ ${endTime}`
            : (post.trade_time && String(post.trade_time).includes(':')
                ? String(post.trade_time).split(' ')[1]
                : '시간 미정');

        return {
            metadata: nextMetadata,
            tags: nextTags,
            onOffline: nextOnOffline,
            approvalType: nextApprovalType,
            displayDate: nextDisplayDate,
            displayTime: nextDisplayTime,
            displayFee: isNewFormat ? (post.price || '회비 문의') : '회비 문의',
            maxMembers: nextMaxMembers || '0',
            descriptionBody: nextDescriptionBody || '',
        };
    }, [post]);

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

    const sellerName = post?.profiles?.username || post?.profiles?.full_name || '호스트';

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00BCD4" />
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

    const headerIconColor = hasImages ? '#fff' : '#000';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.flexOne}>
                <View style={[styles.header, { top: 8 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBtn, !hasImages && styles.headerBtnLight]}>
                        <ArrowLeft size={24} color={headerIconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sharePost(post.title, post.description)} style={[styles.headerBtn, !hasImages && styles.headerBtnLight]}>
                        <Share2 size={20} color={headerIconColor} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.flexOne}
                    contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}
                    showsVerticalScrollIndicator={false}
                >
                    {hasImages ? (
                        <View style={styles.heroContainer}>
                            <Image source={{ uri: post.image_urls[currentImageIndex] }} style={styles.heroImage} />

                            {post.image_urls.length > 1 ? (
                                <>
                                    <TouchableOpacity style={[styles.sliderBtn, styles.sliderBtnPrev]} onPress={prevImage}>
                                        <ChevronLeft size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.sliderBtn, styles.sliderBtnNext]} onPress={nextImage}>
                                        <ChevronRight size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <View style={styles.sliderDots}>
                                        {post.image_urls.map((_, idx) => (
                                            <View key={idx} style={[styles.dot, idx === currentImageIndex && styles.dotActive]} />
                                        ))}
                                    </View>
                                </>
                            ) : null}
                        </View>
                    ) : (
                        <View style={[styles.meetupHero, { backgroundColor: post.color || '#E0F7FA' }]}>
                            <Users size={48} color="#666" style={{ opacity: 0.3 }} />
                        </View>
                    )}

                    <View style={styles.content}>
                        {tags.length > 0 ? (
                            <View style={styles.tagsWrap}>
                                {tags.map((tag) => (
                                    <View key={tag} style={styles.tagItem}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}

                        <View style={styles.titleSection}>
                            <Text style={styles.title}>{post.title}</Text>
                            <View style={styles.dateRow}>
                                <View style={styles.dateItem}>
                                    <Calendar size={16} color="#00BCD4" />
                                    <Text style={styles.dateText}>{displayDate}</Text>
                                </View>
                                <View style={styles.dateDivider} />
                                <View style={styles.statsRow}>
                                    <View style={styles.metaItem}>
                                        <Eye size={14} color="#666" />
                                        <Text style={styles.metaText}>{post.views || 0}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Heart size={14} color="#666" />
                                        <Text style={styles.metaText}>{likeCount}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.unifiedInfoCard}>
                            <TouchableOpacity
                                style={styles.infoRow}
                                disabled={onOffline !== 'offline'}
                                onPress={onOffline === 'offline' ? handleOpenMap : undefined}
                            >
                                <View style={[styles.iconBox, styles.iconCyan]}>
                                    {onOffline === 'offline' ? <MapPin size={20} color="#0097A7" /> : <Monitor size={20} color="#0097A7" />}
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>{onOffline === 'offline' ? '장소 (지도보기)' : '진행 방식'}</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>{onOffline === 'offline' ? (post.location || '위치 미정') : '온라인 모임'}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.infoRow}>
                                <View style={[styles.iconBox, styles.iconPurple]}>
                                    <Clock size={20} color="#7B1FA2" />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>시간</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>{displayTime}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={[styles.iconBox, styles.iconGreen]}>
                                    <Users size={20} color="#2E7D32" />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>모집 인원 & 승인 방식</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>{maxMembers}명 · {approvalType === 'first-come' ? '선착순' : '승인제'}</Text>
                                </View>
                            </View>

                            <View style={[styles.infoRow, styles.infoRowLast]}>
                                <View style={[styles.iconBox, styles.iconOrange]}>
                                    <Star size={20} color="#E65100" />
                                </View>
                                <View style={styles.infoTextWrap}>
                                    <Text style={styles.infoLabel}>참가비</Text>
                                    <Text style={styles.infoValue} numberOfLines={1}>{displayFee}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.participationStatus}>
                            <View style={styles.participationHeader}>
                                <Text style={styles.participationLabel}>신청 인원 1명</Text>
                                <Text style={styles.participationMax}>최대 {maxMembers}명</Text>
                            </View>
                            <View style={styles.participantBar}>
                                <View style={styles.participantFill} />
                            </View>
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
                            <Text style={styles.descriptionTitle}>모임 소개</Text>
                            <Text style={styles.descriptionBody}>{descriptionBody || '-'}</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.bottomBar, { paddingBottom: Math.max(12, insets.bottom) }]}>
                    <TouchableOpacity style={[styles.likeBtnBottom, liked && styles.likeBtnBottomActive]} onPress={handleLike}>
                        <Heart size={24} color={liked ? '#ff4d4f' : '#666'} fill={liked ? '#ff4d4f' : 'none'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatIconBtn} onPress={handleChat}>
                        <MessageCircle size={24} color="#00BCD4" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.joinBtn} onPress={handleChat}>
                        {approvalType === 'first-come' ? <UserPlus size={20} color="#fff" /> : <CheckCircle size={20} color="#fff" />}
                        <Text style={styles.joinBtnText}>{approvalType === 'first-come' ? '참가 신청' : '승인 요청하기'}</Text>
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
        paddingHorizontal: 20,
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
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBtnLight: {
        borderColor: '#EFEFEF',
        backgroundColor: '#fff',
    },
    heroContainer: { position: 'relative', height: 380, backgroundColor: '#f9f9f9' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    sliderBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -22,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.36)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderBtnPrev: { left: 16 },
    sliderBtnNext: { right: 16 },
    sliderDots: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
    dotActive: { backgroundColor: '#fff' },
    meetupHero: {
        height: 380,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 },
    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    tagItem: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        backgroundColor: '#F0F9FF',
    },
    tagText: { fontSize: 12, fontWeight: '600', color: '#0097A7' },
    titleSection: { marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '800', color: '#333', lineHeight: 30, marginBottom: 12 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateText: { fontSize: 14, color: '#666' },
    dateDivider: { width: 1, height: 12, backgroundColor: '#eee' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: '#666' },
    unifiedInfoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        marginBottom: 20,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCyan: { backgroundColor: '#E0F7FA' },
    iconPurple: { backgroundColor: '#F3E5F5' },
    iconGreen: { backgroundColor: '#E8F5E9' },
    iconOrange: { backgroundColor: '#FFF3E0' },
    infoTextWrap: { flex: 1, minWidth: 0 },
    infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
    participationStatus: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
    },
    participationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    participationLabel: { fontSize: 13, color: '#666' },
    participationMax: { fontSize: 13, fontWeight: '700', color: '#00BCD4' },
    participantBar: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
    participantFill: { width: '10%', height: '100%', backgroundColor: '#00BCD4' },
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
        marginTop: 24,
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
    descriptionTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 12 },
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    likeBtnBottomActive: { borderColor: '#ff4d4f' },
    chatIconBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    joinBtn: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#00A8C0',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    joinBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default MeetupDetailScreen;
