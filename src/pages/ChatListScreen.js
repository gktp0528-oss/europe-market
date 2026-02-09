import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, MessageCircle } from 'lucide-react-native';
import { useChatUnread } from '../contexts/ChatUnreadContext';

const CATEGORY_META = {
    used: { label: '중고거래', backgroundColor: '#FFF1EF', textColor: '#E8756D' },
    job: { label: '알바', backgroundColor: '#EEF4FF', textColor: '#4F78D3' },
    tutoring: { label: '과외/레슨', backgroundColor: '#F3EEFF', textColor: '#6F58C9' },
    meetup: { label: '모임', backgroundColor: '#EAF8F2', textColor: '#2F9D6A' },
};

const getCategoryMeta = (category) => CATEGORY_META[category] || {
    label: '기타',
    backgroundColor: '#F4F4F4',
    textColor: '#808080',
};

const ChatListScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { unreadByConversation } = useChatUnread();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const conversationsRef = useRef([]);

    const formatChatTime = useCallback((isoString) => {
        if (!isoString) return '';

        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '';

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayDiff = Math.floor((todayStart - targetStart) / (1000 * 60 * 60 * 24));

        if (dayDiff === 0) {
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }
        if (dayDiff === 1) return '어제';
        if (dayDiff > 1 && dayDiff < 7) {
            return date.toLocaleDateString('ko-KR', { weekday: 'short' });
        }
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
        }
        return date.toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric',
        });
    }, []);

    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    const handleDeleteConversation = useCallback(async (conversationId) => {
        const snapshot = conversationsRef.current;

        setConversations(prev => prev.filter(chat => chat.id !== conversationId));

        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', conversationId);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting conversation:', err);
            setConversations(snapshot);
            Alert.alert('오류', '대화방 삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id,
                    last_message,
                    updated_at,
                    post_id,
                    post:post_id (title, image_urls, category),
                    participant1:participant1_id (id, username, avatar_url),
                    participant2:participant2_id (id, username, avatar_url)
                `)
                .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            const formatted = data.map(conv => {
                const otherUser = conv.participant1?.id === user.id ? conv.participant2 : conv.participant1;
                if (!otherUser) return null;

                return {
                    id: conv.id,
                    otherUser,
                    post: conv.post,
                    lastMessage: conv.last_message,
                    updated_at: conv.updated_at
                };
            }).filter(c => c !== null);

            setConversations(formatted);
        } catch (err) {
            console.error('Error fetching chats:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchConversations();

        const conversationSubscription = supabase
            .channel('public:conversations')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversations'
            }, () => {
                fetchConversations();
            })
            .subscribe();

        const messageSubscription = supabase
            .channel('public:chat_list_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const msg = payload.new;
                const existsInList = conversationsRef.current.some(chat => chat.id === msg.conversation_id);

                if (!existsInList) {
                    fetchConversations();
                    return;
                }

                setConversations(prev => {
                    const updated = prev.map(chat => {
                        if (chat.id !== msg.conversation_id) return chat;
                        return {
                            ...chat,
                            lastMessage: msg.content,
                            updated_at: msg.created_at
                        };
                    });
                    const changed = updated.find(chat => chat.id === msg.conversation_id);
                    return [changed, ...updated.filter(chat => chat.id !== msg.conversation_id)];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(conversationSubscription);
            supabase.removeChannel(messageSubscription);
        };
    }, [fetchConversations, user]);

    const renderChatItem = ({ item }) => {
        const categoryMeta = getCategoryMeta(item.post?.category);

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => navigation.navigate('ChatRoom', { conversationId: item.id })}
                onLongPress={() => {
                    Alert.alert('채팅방 삭제', '이 대화방을 삭제하시겠습니까?', [
                        { text: '취소', style: 'cancel' },
                        {
                            text: '삭제',
                            style: 'destructive',
                            onPress: () => handleDeleteConversation(item.id)
                        }
                    ]);
                }}
            >
                <View style={styles.avatarContainer}>
                    {item.post && item.post.image_urls && item.post.image_urls.length > 0 ? (
                        <Image source={{ uri: item.post.image_urls[0] }} style={styles.avatar} />
                    ) : item.otherUser?.avatar_url ? (
                        <Image source={{ uri: item.otherUser.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={styles.defaultAvatar}>
                            <User size={24} color="#ccc" />
                        </View>
                    )}
                </View>

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <View style={styles.chatUserGroup}>
                            <View style={styles.userRow}>
                                <Text style={styles.username} numberOfLines={1}>
                                    {item.otherUser?.username || '알 수 없음'}
                                </Text>
                                {item.post?.category ? (
                                    <View style={[styles.categoryBadge, { backgroundColor: categoryMeta.backgroundColor }]}>
                                        <Text style={[styles.categoryBadgeText, { color: categoryMeta.textColor }]}>
                                            {categoryMeta.label}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                            {item.post?.title ? (
                                <Text style={styles.postTitleInline} numberOfLines={1}>
                                    {item.post.title}
                                </Text>
                            ) : null}
                        </View>
                        <View style={styles.chatMeta}>
                            <Text style={styles.time}>{formatChatTime(item.updated_at)}</Text>
                            {(unreadByConversation[item.id] || 0) > 0 ? (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadBadgeText}>
                                        {unreadByConversation[item.id]}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || '새로운 대화가 시작되었습니다.'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer} edges={['top']}>
                <ActivityIndicator color="#FFB7B2" size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>채팅 💬</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderChatItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => null}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MessageCircle size={48} color="#FFB7B2" style={{ opacity: 0.3 }} />
                        <Text style={styles.emptyText}>대화방이 없어요 🥲</Text>
                        <Text style={styles.emptySubText}>관심 있는 상품에 문의를 남겨보세요!</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4A4A4A',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        backgroundColor: '#fff',
    },
    chatItem: {
        flexDirection: 'row',
        paddingVertical: 18,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 18,
        overflow: 'hidden',
        marginRight: 14,
        backgroundColor: '#F0F0F0',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    defaultAvatar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
        gap: 10,
    },
    chatUserGroup: {
        flex: 1,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    categoryBadge: {
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    postTitleInline: {
        marginTop: 2,
        fontSize: 13,
        color: '#EB2F96',
        fontWeight: '600',
    },
    chatMeta: {
        alignItems: 'flex-end',
    },
    time: {
        fontSize: 12,
        color: '#8A8A8A',
    },
    unreadBadge: {
        marginTop: 4,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 6,
        borderRadius: 9,
        backgroundColor: '#FF8F87',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadBadgeText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '700',
    },
    lastMessage: {
        fontSize: 14,
        color: '#5F5F5F',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4A4A4A',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9B9B9B',
        marginTop: 8,
    },
});

export default ChatListScreen;
