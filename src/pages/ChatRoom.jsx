import React, { useEffect, useState, useRef } from 'react';
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

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!user || !id) return;

        // 1. Fetch conversation details to get other user info
        const fetchConversation = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id,
                    post_id,
                    post:post_id (title, price, image_urls, category),
                    participant1:participant1_id (id, username, avatar_url),
                    participant2:participant2_id (id, username, avatar_url)
                `)
                .eq('id', id)
                .single();

            if (data) {
                const other = data.participant1.id === user.id ? data.participant2 : data.participant1;
                setOtherUser(other);
                setPost(data.post);
            }
        };

        // 2. Fetch existing messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', id)
                .order('created_at', { ascending: true }); // Oldest first for chat log

            if (data) {
                setMessages(data);
            }
        };

        fetchConversation();
        fetchMessages();

        // 3. Subscribe to new messages
        const channel = supabase
            .channel(`room:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${id}`
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [id, user]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: id,
                    sender_id: user.id,
                    content: newMessage
                });

            if (error) throw error;

            setNewMessage('');

            // Optionally update last_message in conversation
            await supabase
                .from('conversations')
                .update({
                    last_message: newMessage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

        } catch (error) {
            console.error('Error sending message:', error);
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
