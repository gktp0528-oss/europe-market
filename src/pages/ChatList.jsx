import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, MessageCircle, Trash2 } from 'lucide-react';
import { useChatUnread } from '../contexts/ChatUnreadContext';
import '../styles/WriteForm.css';
import '../styles/Chat.css'; // Reusing layout styles

const SwipeableChatItem = ({ chat, navigate, unreadCount, onDelete }) => {
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [swiped, setSwiped] = useState(false);
    const [isPressing, setIsPressing] = useState(false);
    const pressTimer = useRef(null);

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
        setCurrentX(e.touches[0].clientX);

        // Long press logic
        setIsPressing(true);
        pressTimer.current = setTimeout(() => {
            if (window.confirm('이 대화방을 삭제하시겠습니까?')) {
                onDelete();
            }
            setIsPressing(false);
        }, 800);
    };

    const handleTouchMove = (e) => {
        const diff = e.touches[0].clientX - startX;
        setCurrentX(e.touches[0].clientX);

        // If moving significantly, cancel long press
        if (Math.abs(diff) > 10) {
            if (pressTimer.current) {
                clearTimeout(pressTimer.current);
                pressTimer.current = null;
            }
            setIsPressing(false);
        }
    };

    const handleTouchEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        setIsPressing(false);

        const diff = currentX - startX;
        if (diff < -50) {
            setSwiped(true);
        } else {
            setSwiped(false);
        }
    };

    const handleClick = () => {
        if (swiped) {
            setSwiped(false);
        } else {
            navigate(`/chat/${chat.id}`);
        }
    };

    return (
        <div
            className={`chat-item ${swiped ? 'swiped' : ''} ${isPressing ? 'pressing' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            <div className="chat-item-content">
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
                        <div className="chat-meta">
                            <span className="chat-time">{chat.time}</span>
                            {unreadCount > 0 && (
                                <span className="unread-badge">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="chat-last-message">
                        {chat.lastMessage || '새로운 대화가 시작되었습니다.'}
                    </p>
                </div>
            </div>

            <button
                className="chat-delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('이 대화방을 삭제하시겠습니까?')) {
                        onDelete();
                    }
                }}
            >
                <Trash2 size={20} color="white" />
            </button>
        </div>
    );
};

const ChatList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { unreadByConversation } = useChatUnread();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const conversationsRef = useRef([]);

    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

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
                hour12: false
            });
        }

        if (dayDiff === 1) {
            return '어제';
        }

        if (dayDiff > 1 && dayDiff < 7) {
            return date.toLocaleDateString('ko-KR', { weekday: 'short' });
        }

        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric'
            });
        }

        return date.toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric'
        });
    }, []);

    const handleDeleteChat = async (conversationId) => {
        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', conversationId);

            if (error) throw error;

            // Optimistic update
            setConversations(prev => prev.filter(c => c.id !== conversationId));
        } catch (err) {
            console.error('Error deleting chat:', err);
            alert('채팅방 삭제에 실패했습니다.');
        }
    };

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
                    time: formatChatTime(conv.updated_at)
                };
            }).filter(c => c !== null);

            setConversations(formatted);
        } catch (err) {
            console.error('Error fetching chats:', err);
        } finally {
            setLoading(false);
        }
    }, [formatChatTime, user]);

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

                const existsInList = conversationsRef.current.some(
                    (chat) => chat.id === msg.conversation_id
                );

                if (!existsInList) {
                    fetchConversations();
                    return;
                }

                setConversations((prev) => {
                    const updated = prev.map((chat) => {
                        if (chat.id !== msg.conversation_id) {
                            return chat;
                        }

                        return {
                            ...chat,
                            lastMessage: msg.content,
                            time: formatChatTime(msg.created_at)
                        };
                    });

                    const changed = updated.find((chat) => chat.id === msg.conversation_id);
                    return [
                        changed,
                        ...updated.filter((chat) => chat.id !== msg.conversation_id)
                    ];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(conversationSubscription);
            supabase.removeChannel(messageSubscription);
        };

    }, [fetchConversations, formatChatTime, user]);

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
                            <SwipeableChatItem
                                key={chat.id}
                                chat={chat}
                                navigate={navigate}
                                unreadCount={unreadByConversation[chat.id]}
                                onDelete={() => handleDeleteChat(chat.id)}
                            />
                        ))}
                    </div>
                )
                }
            </div >
        </div >
    );
};

export default ChatList;
