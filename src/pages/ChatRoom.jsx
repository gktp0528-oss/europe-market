import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import '../styles/WriteForm.css';
import '../styles/Chat.css';

const ChatRoom = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [post, setPost] = useState(null);
    const messagesEndRef = useRef(null);

    const reconcileMessages = useCallback((prev, fetched) => {
        const fetchedIds = new Set((fetched || []).map((m) => m.id));
        const sendingMessages = prev.filter(
            (m) => m.status === 'sending' && !fetchedIds.has(m.id)
        );

        return [...(fetched || []), ...sendingMessages].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
    }, []);

    const fetchMessages = useCallback(async (conversationId) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages((prev) => reconcileMessages(prev, data));
        }
    }, [reconcileMessages]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Use an effect to handle URL parameters for new chats
    useEffect(() => {
        if (!user) return;

        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post_id');
        const sellerId = params.get('seller_id');

        if (id === 'new') {
            if (!postId || !sellerId) {
                navigate('/chat');
                return;
            }

            // Fetch metadata for the new chat header
            const fetchMetadata = async () => {
                try {
                    // Fetch post info
                    const { data: postData } = await supabase
                        .from('posts')
                        .select('title, price, image_urls, category')
                        .eq('id', postId)
                        .single();

                    if (postData) setPost(postData);

                    // Fetch seller info
                    const { data: sellerData } = await supabase
                        .from('profiles')
                        .select('id, username, avatar_url')
                        .eq('id', sellerId)
                        .single();

                    if (sellerData) setOtherUser(sellerData);
                } catch (err) {
                    console.error('Error fetching chat metadata:', err);
                }
            };
            fetchMetadata();
            setMessages([]);
        } else {
            // Normal existing chat flow
            const fetchConversation = async () => {
                const { data } = await supabase
                    .from('conversations')
                    .select(`
                        id,
                        post_id,
                        post:posts(title, price, image_urls, category),
                        participant1:profiles!participant1_id(id, username, avatar_url),
                        participant2:profiles!participant2_id(id, username, avatar_url)
                    `)
                    .eq('id', id)
                    .single();

                if (data) {
                    const p1 = data.participant1;
                    const p2 = data.participant2;
                    if (p1 && p2) {
                        const other = p1.id === user.id ? p2 : p1;
                        setOtherUser(other);
                        setPost(data.post);
                    }
                }
            };

            fetchConversation();
            fetchMessages(id);

            // Subscribe to new messages
            const channel = supabase
                .channel(`room:${id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${id}`
                }, (payload) => {
                    // Handle subscription updates
                    setMessages((prev) => {
                        // 1. Check if real ID already exists (from optimistic update DB save)
                        if (prev.find(m => m.id === payload.new.id)) return prev;

                        // 2. Optimization: If we have an optimistic message (status: sending) 
                        // with same content and sender, we could potentially replace it.
                        // But since we already have the map logic in handleSendMessage,
                        // this check is just a safeguard to prevent double appending.
                        return [...prev, payload.new].sort(
                            (a, b) => new Date(a.created_at) - new Date(b.created_at)
                        );
                    });
                })
                .subscribe();

            // Realtime 장애/지연 대비 폴백 동기화
            const pollingInterval = setInterval(() => {
                fetchMessages(id);
            }, 2000);

            return () => {
                clearInterval(pollingInterval);
                supabase.removeChannel(channel);
            };
        }
    }, [id, user, navigate, fetchMessages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !user) return;

        try {
            let conversationId = id;

            // 1. Lazy creation if new
            if (id === 'new') {
                const params = new URLSearchParams(window.location.search);
                const postId = params.get('post_id');
                const sellerId = params.get('seller_id');

                // Use atomic get_or_create_conversation RPC to prevent duplicates
                const { data: convId, error: convError } = await supabase
                    .rpc('get_or_create_conversation', {
                        p_participant1_id: user.id,
                        p_participant2_id: sellerId,
                        p_post_id: Number(postId)
                    });

                if (convError) throw convError;
                conversationId = convId;

                // Silent URL update
                window.history.replaceState(null, '', `/chat/${conversationId}`);
                // Note: We don't navigate() to avoid remounting, but we need to update 'id' if possible
                // Actually, replaceState doesn't update 'id' from useParams(). 
                // A better way might be to just force navigate or manage state carefully.
                // For now, let's use navigate(..., { replace: true }) which is cleaner for React Router.
                navigate(`/chat/${conversationId}`, { replace: true });
            }

            // 2. Optimistic Update
            const tempId = Date.now();
            const tempMsg = {
                id: tempId,
                conversation_id: conversationId,
                sender_id: user.id,
                content: content,
                created_at: new Date().toISOString(),
                status: 'sending'
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');

            // 3. DB Save
            const { data: savedMsg, error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: content
                })
                .select()
                .single();

            if (msgError) throw msgError;

            // Update optimistic message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));

            // 4. Update conversation last message
            await supabase
                .from('conversations')
                .update({
                    last_message: content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversationId);

        } catch (error) {
            console.error('Error in send flow:', error);
            alert('메시지 전송 실패');
        }
    };

    if (!user) return <div>로그인이 필요합니다.</div>;

    return (
        <div className="chat-room-container">
            <header className="write-header" style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <button onClick={() => navigate(-1)} style={{ marginRight: 10 }}><ArrowLeft size={24} /></button>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        {post && post.image_urls && post.image_urls.length > 0 && (
                            <img
                                src={post.image_urls[0]}
                                alt="post"
                                style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', marginRight: 10, border: '1px solid #f0f0f0' }}
                            />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }}>
                                {otherUser ? otherUser.username : '채팅'}
                            </span>
                            {post && (
                                <span style={{ fontSize: 13, color: '#eb2f96', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {post.title} {post.price ? `· ${post.price}` : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="chat-messages">
                {messages.map((msg) => {
                    const isMyMessage = msg.sender_id === user.id;
                    const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={msg.id} className={`message-bubble-wrapper ${isMyMessage ? 'mine' : 'others'}`}>
                            {!isMyMessage && (
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '12px',
                                    backgroundColor: '#eee',
                                    marginRight: 8,
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {otherUser?.avatar_url ? (
                                        <img src={otherUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ArrowLeft size={16} color="#ccc" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
                                <div className="message-bubble">
                                    {msg.content}
                                </div>
                                <span className="message-time">{timeStr}</span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <button style={{ background: 'none', border: 'none', color: '#bbb', padding: 0 }}>
                    <ImageIcon size={24} />
                </button>
                <form onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="메시지 보내기..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    {newMessage.trim() && (
                        <button type="submit" className="chat-send-btn">
                            <Send size={24} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;
