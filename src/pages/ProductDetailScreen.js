import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, Clock, Eye, User } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeAgo } from '../utils/dateUtils';
import { sharePost } from '../utils/shareUtils';
import ImageCarousel from '../components/ImageCarousel';

const ProductDetailScreen = ({ navigation, route }) => {
    const { postId } = route.params;
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        fetchDetail();
    }, [postId]);

    const fetchDetail = async () => {
        try {
            const normalizedPostId = Number(postId);
            if (!Number.isFinite(normalizedPostId)) {
                throw new Error(`Invalid postId: ${postId}`);
            }

            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', normalizedPostId)
                .single();

            if (error) throw error;
            setPost(data);
            setProfile(null);
            setLikeCount(data.likes || 0);

            if (data?.user_id) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url')
                    .eq('id', data.user_id)
                    .single();

                if (profileError) {
                    console.warn('Profile fetch warning:', profileError.message);
                } else {
                    setProfile(profileData);
                }
            }

            // Increment views
            try {
                await supabase.rpc('increment_views', { post_id: normalizedPostId });
            } catch (e) {
                console.warn('View increment failed:', e);
            }

            // Check like status
            if (user) {
                const { data: likeData, error: likeError } = await supabase
                    .rpc('check_user_like', { p_post_id: normalizedPostId });
                if (likeError) {
                    console.warn('check_user_like warning:', likeError.message);
                }
                setLiked(!!likeData);
            }
        } catch (error) {
            console.error('Error fetching detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }
        const normalizedPostId = Number(postId);
        if (!Number.isFinite(normalizedPostId)) {
            Alert.alert('오류', '게시물 정보를 불러올 수 없습니다.');
            return;
        }
        try {
            setLiked(!liked);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
            await supabase.rpc('toggle_like', { p_post_id: normalizedPostId });
        } catch (error) {
            setLiked(!liked);
            setLikeCount(prev => liked ? prev + 1 : prev - 1);
            console.error('Like error:', error);
        }
    };

    const handleChat = () => {
        if (!user) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }
        if (profile?.id === user.id) {
            Alert.alert('알림', '본인의 게시물입니다.');
            return;
        }
        if (!profile?.id) {
            Alert.alert('알림', '판매자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        navigation.navigate('ChatRoom', { postId: Number(postId), sellerId: profile.id });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFB7B2" />
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
            <ScrollView style={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <ArrowLeft size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sharePost(post.title, post.description)} style={styles.headerBtn}>
                        <Share2 size={22} color="#4A4A4A" />
                    </TouchableOpacity>
                </View>

                {/* Images */}
                <ImageCarousel images={post.image_urls} height={380} />

                {/* Content */}
                <View style={styles.content}>
                    {/* Seller Info */}
                    <TouchableOpacity
                        style={styles.sellerRow}
                        onPress={() => profile && navigation.navigate('UserProfile', { userId: profile.id })}
                    >
                        <View style={styles.avatar}>
                            <User size={20} color="#ccc" />
                        </View>
                        <Text style={styles.sellerName}>{profile?.username || '익명'}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Title & Price */}
                    <Text style={styles.title}>{post.title}</Text>
                    <Text style={styles.price}>{post.price ? String(post.price) : '가격 협의'}</Text>

                    {/* Meta */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MapPin size={14} color="#9B9B9B" />
                            <Text style={styles.metaText}>{post.location || '위치 미정'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={14} color="#9B9B9B" />
                            <Text style={styles.metaText}>{formatTimeAgo(post.created_at)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Eye size={14} color="#9B9B9B" />
                            <Text style={styles.metaText}>{post.views || 0}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <Text style={styles.description}>{post.description}</Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
                    <Heart
                        size={24}
                        color={liked ? '#FFB7B2' : '#ccc'}
                        fill={liked ? '#FFB7B2' : 'transparent'}
                    />
                    <Text style={[styles.likeCount, liked && { color: '#FFB7B2' }]}>{likeCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
                    <MessageCircle size={20} color="#fff" />
                    <Text style={styles.chatBtnText}>채팅하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEFDF5' },
    errorText: { fontSize: 16, color: '#9B9B9B' },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', justifyContent: 'space-between', padding: 16,
    },
    headerBtn: {
        width: 44, height: 44, borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center', alignItems: 'center',
    },
    content: { padding: 20 },
    sellerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    sellerName: { fontSize: 15, fontWeight: '700', color: '#4A4A4A' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
    title: { fontSize: 20, fontWeight: '800', color: '#4A4A4A', marginBottom: 8 },
    price: { fontSize: 22, fontWeight: '800', color: '#FFB7B2', marginBottom: 16 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: '#9B9B9B' },
    description: { fontSize: 15, lineHeight: 24, color: '#4A4A4A' },
    bottomBar: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff',
    },
    likeBtn: { alignItems: 'center', marginRight: 16, paddingHorizontal: 8 },
    likeCount: { fontSize: 11, color: '#9B9B9B', marginTop: 2 },
    chatBtn: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#FFB7B2', height: 50, borderRadius: 16, gap: 8,
    },
    chatBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default ProductDetailScreen;
