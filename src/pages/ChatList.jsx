import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, MessageCircle } from 'lucide-react';
import '../styles/WriteForm.css';
import '../styles/Chat.css'; // Reusing layout styles

const ChatList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            try {
                // Fetch conversations where I am participant 1 or 2
                // We also want to join profile data
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

                // Process data to identify "the other person"
                const formatted = data.map(conv => {
                    const otherUser = conv.participant1?.id === user.id ? conv.participant2 : conv.participant1;

                    // Safety check: if for some reason otherUser is null, skip or show fallback
                    if (!otherUser) return null;

                    return {
                        id: conv.id,
                        otherUser,
                        post: conv.post,
                        lastMessage: conv.last_message,
                        time: new Date(conv.updated_at).toLocaleDateString()
                    };
                }).filter(c => c !== null);

                setConversations(formatted);
            } catch (err) {
                console.error('Error fetching chats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();

        // Ideally subscribe to changes in 'conversations' table as well
        // Subscribe to changes in 'conversations' table
        const subscription = supabase
            .channel('public:conversations')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversations'
            }, (payload) => {
                // Fetch again whenever any conversation changes
                // RLS will ensure we only see relevant ones
                // We could optimize this by manually updating the state
                // but fetchConversations is safer for complex joins.
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };

    }, [user]);

    if (!user) {
        return (
            <div className="flex-center full-screen" style={{ flexDirection: 'column', gap: 20 }}>
                <p>로그인이 필요한 서비스입니다.</p>
                <button
                    className="submit-btn-bottom"
                    style={{ width: 'auto', padding: '10px 20px' }}
                    onClick={() => navigate('/login')}
                >
                    로그인하러 가기
                </button>
            </div>
        );
    }

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>채팅 목록</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content" style={{ marginTop: '20px', padding: '0 16px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>로딩 중...</p>
                ) : conversations.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 60, color: '#888' }}>
                        <p>대화방이 없습니다.</p>
                        <p>상품이나 알바에 문의를 남겨보세요! 💬</p>
                    </div>
                ) : (
                    <div className="chat-list" style={{ paddingBottom: '80px' }}>
                        {conversations.map(chat => (
                            <div
                                key={chat.id}
                                className="chat-item"
                                onClick={() => navigate(`/chat/${chat.id}`)}
                            >
                                <div className="chat-avatar-container">
                                    {chat.post && chat.post.image_urls && chat.post.image_urls.length > 0 ? (
                                        <img src={chat.post.image_urls[0]} alt="product" />
                                    ) : chat.otherUser?.avatar_url ? (
                                        <img src={chat.otherUser.avatar_url} alt="avatar" />
                                    ) : (
                                        <User size={26} color="#ccc" />
                                    )}
                                </div>

                                <div className="chat-info">
                                    <div className="chat-info-header">
                                        <div className="chat-user-group">
                                            <span className="chat-username">
                                                {chat.otherUser?.username || '알 수 없음'}
                                            </span>
                                            {chat.post && (
                                                <span className="chat-post-title">
                                                    {chat.post.category === 'tutoring' ? (chat.post.subject || chat.post.title) : chat.post.title}
                                                </span>
                                            )}
                                        </div>
                                        <span className="chat-time">{chat.time}</span>
                                    </div>
                                    <p className="chat-last-message">
                                        {chat.lastMessage || '새로운 대화가 시작되었습니다.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }
            </div >
        </div >
    );
};

export default ChatList;
