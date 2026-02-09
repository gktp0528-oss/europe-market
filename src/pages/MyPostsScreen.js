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
import { ArrowLeft, FileText, MapPin, Clock, Eye, Heart, Briefcase } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';

const CATEGORY_ROUTE_MAP = {
    used: 'ProductDetail',
    job: 'JobDetail',
    tutoring: 'TutoringDetail',
    meetup: 'MeetupDetail',
};

const MyPostsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const nowTick = useMinuteTicker();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchMyPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setPosts(data || []);
            } catch (error) {
                console.error('Error fetching my posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, [user]);

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

    const renderPost = ({ item }) => (
        <TouchableOpacity style={styles.itemCard} onPress={() => openPost(item)}>
            <View style={styles.thumbWrap}>
                {item.image_urls?.length ? (
                    <Image source={{ uri: item.image_urls[0] }} style={styles.thumb} />
                ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                        <Briefcase size={26} color="#c9c9c9" />
                    </View>
                )}
            </View>

            <View style={styles.contentWrap}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <MapPin size={11} color="#9B9B9B" />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location || '위치 미정'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={11} color="#9B9B9B" />
                        <Text style={styles.metaText}>{getPostTimeLabel(item, nowTick)}</Text>
                    </View>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.price}>{item.price || '가격 협의'}</Text>
                    <View style={styles.interactions}>
                        <View style={styles.metaItem}>
                            <Eye size={11} color="#9B9B9B" />
                            <Text style={styles.metaText}>{item.views || 0}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Heart size={11} color="#FF8F87" />
                            <Text style={[styles.metaText, styles.heartText]}>{item.likes || 0}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.title}>내가 쓴 글</Text>
                <View style={styles.backBtn} />
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={renderPost}
                extraData={nowTick}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <FileText size={44} color="#D0D0D0" />
                        <Text style={styles.emptyText}>아직 작성한 글이 없어요.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEFDF5' },
    centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 17, fontWeight: '800', color: '#4A4A4A' },
    listContent: { padding: 16, paddingBottom: 30 },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        gap: 10,
    },
    thumbWrap: {
        width: 86,
        height: 86,
        borderRadius: 12,
        overflow: 'hidden',
    },
    thumb: {
        width: '100%',
        height: '100%',
    },
    thumbPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F3F3',
    },
    contentWrap: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A4A4A',
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: '#9B9B9B',
    },
    bottomRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    interactions: {
        flexDirection: 'row',
        gap: 10,
    },
    heartText: {
        color: '#FF8F87',
    },
    emptyWrap: { paddingTop: 100, alignItems: 'center', gap: 10 },
    emptyText: { fontSize: 14, color: '#9B9B9B' },
});

export default MyPostsScreen;
