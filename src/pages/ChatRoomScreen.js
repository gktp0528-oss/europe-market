import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, User } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useChatUnread } from '../contexts/ChatUnreadContext';

const ChatRoomScreen = ({ navigation, route }) => {
    const { postId, sellerId, conversationId: existingConvId } = route.params || {};
    const { user } = useAuth();
    const { markAsRead, setActiveConversationId } = useChatUnread();

    const [conversationId, setConversationId] = useState(existingConvId || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef(null);

    const reconcileMessages = useCallback((prev, fetched) => {
        const fetchedIds = new Set((fetched || []).map(m => m.id));
        const sending = prev.filter(m => m.status === 'sending' && !fetchedIds.has(m.id));
        return [...(fetched || []), ...sending].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
    }, []);

    const fetchMessages = useCallback(async (convId) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setMessages(prev => reconcileMessages(prev, data));
        } catch (e) {
            console.error('Fetch messages error:', e);
        } finally {
            setLoading(false);
        }
    }, [reconcileMessages]);

    // Initialize conversation
    useEffect(() => {
        if (!user) return;

        const init = async () => {
            if (existingConvId) {
                // Existing conversation
                const { data } = await supabase
                    .from('conversations')
                    .select(`
                        id, post_id,
                        post:posts(title, price, image_urls, category),
                        participant1:profiles!participant1_id(id, username, avatar_url),
                        participant2:profiles!participant2_id(id, username, avatar_url)
                    `)
                    .eq('id', existingConvId)
                    .single();

                if (data) {
                    const other = data.participant1?.id === user.id ? data.participant2 : data.participant1;
                    setOtherUser(other);
                    setPost(data.post);
                }
                setConversationId(existingConvId);
                fetchMessages(existingConvId);
            } else if (postId && sellerId) {
                // New conversation - fetch metadata
                const [{ data: postData }, { data: sellerData }] = await Promise.all([
                    supabase.from('posts').select('title, price, image_urls, category').eq('id', postId).single(),
                    supabase.from('profiles').select('id, username, avatar_url').eq('id', sellerId).single(),
                ]);
                if (postData) setPost(postData);
                if (sellerData) setOtherUser(sellerData);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        init();
    }, [user, existingConvId, postId, sellerId, fetchMessages]);

    // Real-time subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`room:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            }, (payload) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new].sort(
                        (a, b) => new Date(a.created_at) - new Date(b.created_at)
                    );
                });
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [conversationId]);

    // Mark as read
    useEffect(() => {
        if (!user || !conversationId) return;
        setActiveConversationId(conversationId);
        markAsRead(conversationId);
        return () => setActiveConversationId(null);
    }, [conversationId, user, setActiveConversationId, markAsRead]);

    // Re-mark as read on new messages
    useEffect(() => {
        if (!user || !conversationId || messages.length === 0) return;
        const last = messages[messages.length - 1];
        if (last.sender_id !== user.id && !last.is_read) {
            markAsRead(conversationId);
        }
    }, [messages, conversationId, user, markAsRead]);

    const handleSend = async () => {
        const content = newMessage.trim();
        if (!content || !user) return;

        try {
            let convId = conversationId;

            // Lazy create conversation
            if (!convId && postId && sellerId) {
                const { data: newConvId, error: convError } = await supabase
                    .rpc('get_or_create_conversation', {
                        p_participant1_id: user.id,
                        p_participant2_id: sellerId,
                        p_post_id: Number(postId),
                    });

                if (convError) throw convError;
                convId = newConvId;
                setConversationId(convId);
                fetchMessages(convId);
            }

            // Optimistic update
            const tempId = Date.now();
            const tempMsg = {
                id: tempId,
                conversation_id: convId,
                sender_id: user.id,
                content,
                created_at: new Date().toISOString(),
                status: 'sending',
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');

            // DB save
            const { data: savedMsg, error: msgError } = await supabase
                .from('messages')
                .insert({ conversation_id: convId, sender_id: user.id, content })
                .select()
                .single();

            if (msgError) throw msgError;

            setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));

            // Update conversation
            await supabase
                .from('conversations')
                .update({ last_message: content, updated_at: new Date().toISOString() })
                .eq('id', convId);
        } catch (error) {
            console.error('Send error:', error);
        }
    };

    const renderMessage = ({ item: msg }) => {
        const isMine = msg.sender_id === user?.id;
        const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
                {!isMine && (
                    <View style={styles.avatarSmall}>
                        <User size={14} color="#bbb" />
                    </View>
                )}
                <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{msg.content}</Text>
                    </View>
                    <Text style={styles.timeText}>{timeStr}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName} numberOfLines={1}>
                        {otherUser?.username || '채팅'}
                    </Text>
                    {post && (
                        <Text style={styles.headerPost} numberOfLines={1}>
                            {post.title}{post.price ? ` · ${post.price}` : ''}
                        </Text>
                    )}
                </View>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#FFB7B2" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
                                <Text style={styles.emptySubtitle}>첫 메시지를 보내 대화를 시작해보세요.</Text>
                            </View>
                        }
                    />
                )}

                {/* Input */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지 보내기..."
                        placeholderTextColor="#9B9B9B"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        maxLength={1000}
                    />
                    {newMessage.trim() ? (
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Send size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEFDF5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff',
    },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 4 },
    headerName: { fontSize: 16, fontWeight: '700', color: '#4A4A4A' },
    headerPost: { fontSize: 13, color: '#FFB7B2', fontWeight: '600', marginTop: 2 },
    messagesList: { padding: 16, paddingBottom: 8 },
    messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
    messageRowMine: { flexDirection: 'row-reverse' },
    avatarSmall: {
        width: 32, height: 32, borderRadius: 12, backgroundColor: '#ECECEC',
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '100%' },
    bubbleMine: { backgroundColor: '#FFB7B2', borderBottomRightRadius: 4 },
    bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 15, lineHeight: 22, color: '#4A4A4A' },
    bubbleTextMine: { color: '#fff' },
    timeText: { fontSize: 11, color: '#9B9B9B', marginTop: 4, marginHorizontal: 4 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4A4A4A', marginBottom: 4 },
    emptySubtitle: { fontSize: 14, color: '#9B9B9B' },
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12,
        paddingVertical: 8, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F0F0F0',
        backgroundColor: '#fff', gap: 8,
    },
    input: {
        flex: 1, backgroundColor: '#F8F8F8', borderRadius: 20, paddingHorizontal: 16,
        paddingVertical: 10, fontSize: 15, color: '#4A4A4A', maxHeight: 100,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFB7B2',
        justifyContent: 'center', alignItems: 'center',
    },
});

export default ChatRoomScreen;
