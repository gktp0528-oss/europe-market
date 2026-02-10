import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, User, CheckCircle2, AlertCircle, Star } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
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

const ChatRoomScreen = ({ navigation, route }) => {
    const { postId, sellerId, conversationId: existingConvId } = route.params || {};
    const { user } = useAuth();
    const { markAsRead, setActiveConversationId } = useChatUnread();

    const [conversationId, setConversationId] = useState(existingConvId || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [post, setPost] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [meetupRequestId, setMeetupRequestId] = useState(null);
    const [meetupRequestStatus, setMeetupRequestStatus] = useState(null);
    const [meetupRequestLoading, setMeetupRequestLoading] = useState(false);
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
            try {
                if (existingConvId) {
                    const { data } = await supabase
                        .from('conversations')
                        .select(`
                            id, post_id,
                            post:posts(id, title, price, image_urls, category, user_id),
                            participant1:profiles!participant1_id(id, username, avatar_url),
                            participant2:profiles!participant2_id(id, username, avatar_url)
                        `)
                        .eq('id', existingConvId)
                        .single();

                    if (data) {
                        const other = data.participant1?.id === user.id ? data.participant2 : data.participant1;
                        setOtherUser(other);
                        setPost(data.post);

                        // Fetch transaction
                        const { data: tx } = await supabase
                            .from('transactions')
                            .select('*')
                            .eq('conversation_id', existingConvId)
                            .single();

                        if (tx) setTransaction(tx);
                        else {
                            const ownerId = data.post?.user_id;
                            const participantId = user.id === ownerId ? other.id : user.id;

                            if (ownerId && data.post) {
                                const { data: newTx } = await supabase
                                    .from('transactions')
                                    .insert({
                                        post_id: data.post.id,
                                        category: data.post.category || 'used',
                                        owner_id: ownerId,
                                        participant_id: participantId,
                                        conversation_id: existingConvId
                                    })
                                    .select()
                                    .single();
                                if (newTx) setTransaction(newTx);
                            }
                        }
                    }
                    setConversationId(existingConvId);
                    fetchMessages(existingConvId);
                } else if (postId && sellerId) {
                    const [{ data: postData }, { data: sellerData }] = await Promise.all([
                        supabase.from('posts').select('id, title, price, image_urls, category, user_id').eq('id', postId).single(),
                        supabase.from('profiles').select('id, username, avatar_url').eq('id', sellerId).single(),
                    ]);
                    if (postData) setPost(postData);
                    if (sellerData) setOtherUser(sellerData);
                }
            } catch (err) {
                console.error('Init error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [user, existingConvId, postId, sellerId, fetchMessages]);

    // Real-time subscription for messages
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

    // Transaction Real-time subscription
    useEffect(() => {
        if (!transaction?.id) return;

        const channel = supabase
            .channel(`tx:${transaction.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'transactions',
                filter: `id=eq.${transaction.id}`,
            }, (payload) => {
                setTransaction(payload.new);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [transaction?.id]);

    // Check if rated
    useEffect(() => {
        if (!transaction?.id || transaction.status !== 'completed' || !user) return;

        const checkRated = async () => {
            const { data } = await supabase
                .from('profile_ratings')
                .select('id')
                .eq('transaction_id', transaction.id)
                .eq('rater_id', user.id)
                .single();
            if (data) setHasRated(true);
        };
        checkRated();
    }, [transaction?.id, transaction?.status, user]);

    const isMeetupChat = post?.category === 'meetup';
    const isHost = Boolean(post?.user_id && user?.id && post.user_id === user.id);
    const isRequester = Boolean(isMeetupChat && !isHost);

    useEffect(() => {
        if (isMeetupChat) return;
        setMeetupRequestId(null);
        setMeetupRequestStatus(null);
    }, [isMeetupChat]);

    useEffect(() => {
        if (!isMeetupChat || !user || !post?.id) return;

        const targetRequesterId = isHost ? otherUser?.id : user.id;
        if (!targetRequesterId) return;

        const fetchMeetupRequest = async () => {
            const { data, error } = await supabase
                .from('meetup_join_requests')
                .select('id, status')
                .eq('post_id', post.id)
                .eq('requester_id', targetRequesterId)
                .maybeSingle();

            if (error) {
                console.error('Fetch meetup request error:', error);
                return;
            }

            setMeetupRequestId(data?.id || null);
            setMeetupRequestStatus(data?.status || null);
        };

        fetchMeetupRequest();
        const channel = supabase
            .channel(`meetup-req:${post.id}:${targetRequesterId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'meetup_join_requests',
                filter: `post_id=eq.${post.id}`,
            }, (payload) => {
                const row = payload.new || payload.old;
                if (!row || row.requester_id !== targetRequesterId) return;

                setMeetupRequestId(row.id || null);
                setMeetupRequestStatus(row.status || null);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [isMeetupChat, isHost, otherUser?.id, post?.id, user]);

    const handleRequestMeetupApproval = async () => {
        if (!post?.id || !isRequester) return;
        setMeetupRequestLoading(true);
        try {
            const { data, error } = await supabase.rpc('request_meetup_approval', {
                p_post_id: Number(post.id),
                p_conversation_id: conversationId || null,
            });
            if (error) throw error;

            setMeetupRequestId(data || meetupRequestId);
            setMeetupRequestStatus('pending');
        } catch (err) {
            console.error('Request meetup approval error:', err);
        } finally {
            setMeetupRequestLoading(false);
        }
    };

    const moveToAlarmTab = () => {
        const parent = navigation.getParent?.();
        if (parent?.navigate) {
            parent.navigate('Alarm');
            return;
        }
        navigation.navigate('Alarm');
    };

    const handleRequestCompletion = async () => {
        if (!transaction) return;
        setActionLoading(true);
        try {
            const { error } = await supabase.rpc('request_transaction_completion', {
                p_transaction_id: transaction.id
            });
            if (error) throw error;
        } catch (err) {
            console.error('Request completion error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmCompletion = async () => {
        if (!transaction) return;
        setActionLoading(true);
        try {
            const { error } = await supabase.rpc('confirm_transaction_completion', {
                p_transaction_id: transaction.id
            });
            if (error) throw error;
        } catch (err) {
            console.error('Confirm completion error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectCompletion = async () => {
        if (!transaction) return;
        setActionLoading(true);
        try {
            const { error } = await supabase.rpc('reject_transaction_completion', {
                p_transaction_id: transaction.id
            });
            if (error) throw error;
        } catch (err) {
            console.error('Reject completion error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleGoToRating = () => {
        navigation.navigate('Rating', {
            transactionId: transaction.id,
            rateeId: otherUser.id,
            username: otherUser.username
        });
    };

    const handleSend = async () => {
        const content = newMessage.trim();
        if (!content || !user) return;

        try {
            let convId = conversationId;

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

            const { data: savedMsg, error: msgError } = await supabase
                .from('messages')
                .insert({ conversation_id: convId, sender_id: user.id, content })
                .select()
                .single();

            if (msgError) throw msgError;

            setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));

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

    const categoryMeta = getCategoryMeta(post?.category || transaction?.category);
    const showCategory = Boolean(post?.category || transaction?.category);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName} numberOfLines={1}>
                        {otherUser?.username || '채팅'}
                    </Text>
                    <View style={styles.headerSubRow}>
                        {post && (
                            <Text style={styles.headerPost} numberOfLines={1}>
                                {post.title}{post.price ? ` · ${post.price}` : ''}
                            </Text>
                        )}
                        {showCategory && (
                            <View style={[styles.categoryBadge, { backgroundColor: categoryMeta.backgroundColor }]}>
                                <Text style={[styles.categoryBadgeText, { color: categoryMeta.textColor }]}>
                                    {categoryMeta.label}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {transaction && (
                <View style={styles.txBanner}>
                    <View style={styles.txStatusRow}>
                        {transaction.status === 'open' && (
                            <>
                                <AlertCircle size={16} color="#9B9B9B" />
                                <Text style={styles.txStatusText}>이용이 진행 중이에요</Text>
                                <TouchableOpacity
                                    style={styles.txActionBtn}
                                    onPress={handleRequestCompletion}
                                    disabled={actionLoading}
                                >
                                    <Text style={styles.txActionBtnText}>완료 요청하기</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {transaction.status === 'completion_requested' && (
                            <>
                                <CheckCircle2 size={16} color="#FFB7B2" />
                                <Text style={styles.txStatusText}>
                                    {transaction.completion_requested_by === user.id ? '완료 확인을 기다리고 있어요' : '상대방이 완료를 요청했어요'}
                                </Text>
                                {transaction.completion_requested_by !== user.id && (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            style={styles.txActionBtn}
                                            onPress={handleRejectCompletion}
                                            disabled={actionLoading}
                                        >
                                            <Text style={styles.txActionBtnText}>거절</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.txActionBtnPrimary}
                                            onPress={handleConfirmCompletion}
                                            disabled={actionLoading}
                                        >
                                            <Text style={styles.txActionBtnTextPrimary}>완료 확정하기</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                        {transaction.status === 'disputed' && (
                            <>
                                <AlertCircle size={16} color="#ff4d4f" />
                                <Text style={styles.txStatusText}>완료 요청이 거절된 상태예요</Text>
                                <TouchableOpacity
                                    style={styles.txActionBtn}
                                    onPress={handleRequestCompletion}
                                    disabled={actionLoading}
                                >
                                    <Text style={styles.txActionBtnText}>재요청하기</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {transaction.status === 'completed' && (
                            <>
                                <Star size={16} color="#FFB7B2" />
                                <Text style={styles.txStatusText}>이용이 완료되었습니다!</Text>
                                {!hasRated && (
                                    <TouchableOpacity
                                        style={styles.txActionBtnPrimary}
                                        onPress={handleGoToRating}
                                    >
                                        <Text style={styles.txActionBtnTextPrimary}>별점 남기기</Text>
                                    </TouchableOpacity>
                                )}
                                {hasRated && (
                                    <View style={styles.txRatedBadge}>
                                        <Text style={styles.txRatedText}>평가 완료</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            )}

            {isMeetupChat && (
                <View style={styles.meetupApprovalBanner}>
                    {isRequester && meetupRequestStatus !== 'approved' && meetupRequestStatus !== 'pending' ? (
                        <>
                            <Text style={styles.meetupApprovalText}>이 모임은 승인제입니다. 참여 승인을 요청하세요.</Text>
                            <TouchableOpacity
                                style={styles.meetupApprovalBtn}
                                onPress={handleRequestMeetupApproval}
                                disabled={meetupRequestLoading}
                            >
                                <Text style={styles.meetupApprovalBtnText}>승인 요청하기</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}

                    {isRequester && meetupRequestStatus === 'pending' ? (
                        <Text style={styles.meetupApprovalPending}>호스트 승인 대기 중입니다.</Text>
                    ) : null}

                    {isRequester && meetupRequestStatus === 'approved' ? (
                        <Text style={styles.meetupApprovalApproved}>승인 완료: 모임 신청 인원에 반영되었습니다.</Text>
                    ) : null}

                    {isHost && meetupRequestStatus === 'pending' ? (
                        <View style={styles.meetupHostRow}>
                            <Text style={styles.meetupApprovalText}>참가 승인 요청이 도착했습니다.</Text>
                            <TouchableOpacity style={styles.meetupApprovalBtn} onPress={moveToAlarmTab}>
                                <Text style={styles.meetupApprovalBtnText}>알림에서 승인</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            )}

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
                        ListHeaderComponent={
                            showCategory ? (
                                <View style={styles.contextNotice}>
                                    <Text style={styles.contextNoticeText}>
                                        이 채팅은 [{categoryMeta.label}] 게시글에서 시작됐어요.
                                    </Text>
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
                                <Text style={styles.emptySubtitle}>첫 메시지를 보내 대화를 시작해보세요.</Text>
                            </View>
                        }
                    />
                )}

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
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#fff',
    },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 4 },
    headerName: { fontSize: 16, fontWeight: '700', color: '#4A4A4A' },
    headerSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        gap: 8,
    },
    headerPost: {
        fontSize: 13,
        color: '#FFB7B2',
        fontWeight: '600',
        maxWidth: '72%',
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
    txBanner: {
        backgroundColor: '#FDFDFD',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    txStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    txStatusText: {
        fontSize: 13,
        color: '#4A4A4A',
        marginLeft: 6,
        flex: 1,
    },
    txActionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    txActionBtnText: {
        fontSize: 12,
        color: '#777',
        fontWeight: '600',
    },
    txActionBtnPrimary: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#FFB7B2',
    },
    txActionBtnTextPrimary: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '700',
    },
    txRatedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
    },
    txRatedText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '600',
    },
    meetupApprovalBanner: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FCFCFC',
    },
    meetupApprovalText: {
        fontSize: 13,
        color: '#4A4A4A',
        marginBottom: 8,
    },
    meetupHostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    meetupApprovalBtn: {
        alignSelf: 'flex-start',
        backgroundColor: '#EAF8F2',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    meetupApprovalBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2F9D6A',
    },
    meetupApprovalPending: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2F9D6A',
    },
    meetupApprovalApproved: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4F78D3',
    },
    contextNotice: {
        alignSelf: 'center',
        marginBottom: 12,
        backgroundColor: '#F7F7F7',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    contextNoticeText: {
        fontSize: 12,
        color: '#777',
        fontWeight: '600',
    },
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
