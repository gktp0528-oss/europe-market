import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Eye, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import './DetailPage.css';

// 중고거래 상세 페이지 (Style 1 - Classic Card)
const ProductDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const { user } = useAuth();
    const nowTick = useMinuteTicker();

    const handleChatClick = async () => {
        if (!user) {
            if (window.confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                navigate('/login');
            }
            return;
        }

        if (user.id === item.user_id) {
            alert('본인이 작성한 게시글입니다.');
            return;
        }

        if (!item.user_id) {
            alert('작성자 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            navigate(`/chat/new?post_id=${item.id}&seller_id=${item.user_id}`);
        } catch (error) {
            console.error('Chat navigation error:', error);
            alert('채팅방 이동 중 오류가 발생했습니다.');
        }
    };

    const handleLikeClick = async () => {
        if (!user) {
            if (window.confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                navigate('/login');
            }
            return;
        }

        try {
            const { data, error } = await supabase.rpc('toggle_like', { p_post_id: id });

            if (error) throw error;

            setIsLiked(data.liked);
            setLikeCount(data.like_count);
        } catch (error) {
            console.error('Like toggle error:', error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    const fetchLikeStatus = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase.rpc('check_user_like', { p_post_id: id });

            if (error) throw error;
            setIsLiked(data);
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    }, [id, user]);

    const handleShareClick = async () => {
        const url = window.location.href;
        const shareData = {
            title: item?.title || '중고거래',
            text: `${item?.title} - ${item?.price}`,
            url: url
        };

        try {
            // Web Share API 지원 확인 (iOS Safari, Android Chrome 등)
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }
        } catch (error) {
            // 사용자가 공유 취소한 경우
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Share error:', error);
        }

        // Web Share 실패 또는 미지원 - Clipboard 시도
        try {
            await navigator.clipboard.writeText(url);
            alert('링크가 클립보드에 복사되었습니다! 📋\n\n' + url);
        } catch (clipError) {
            console.error('Clipboard error:', clipError);
            // 최종 Fallback - 텍스트 영역 생성하여 복사
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                alert('링크가 복사되었습니다! 📋\n\n' + url);
            } catch {
                // 완전 실패 - URL 표시
                alert('링크를 복사하세요:\n\n' + url);
            } finally {
                document.body.removeChild(textarea);
            }
        }
    };

    const fetchPost = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setItem(data);
            setLikeCount(data.likes || 0);

        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const incrementViewCount = useCallback(async () => {
        try {
            await supabase.rpc('increment_views', { post_id: id });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
        incrementViewCount();
        fetchLikeStatus();
    }, [fetchPost, incrementViewCount, fetchLikeStatus]);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const width = e.target.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setCurrentImage(index);
    };

    const modalSliderRef = useRef(null);

    useEffect(() => {
        if (isModalOpen && modalSliderRef.current) {
            modalSliderRef.current.scrollLeft = currentImage * modalSliderRef.current.offsetWidth;
        }
    }, [isModalOpen, currentImage]);

    if (loading) return <div className="flex-center full-screen">로딩 중... 🔄</div>;
    if (!item) return <div className="flex-center full-screen">게시글을 찾을 수 없습니다 🥲</div>;

    const images = item.image_urls && item.image_urls.length > 0
        ? item.image_urls
        : ['/images/placeholder.png']; // Fallback image

    return (
        <div className="detail-page style-1">
            {/* Header */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn" onClick={handleShareClick}>
                        <Share2 size={20} />
                    </button>
                    <button
                        className="action-btn"
                        onClick={handleLikeClick}
                        style={{ color: isLiked ? '#ff4d4f' : 'inherit' }}
                    >
                        <Heart size={20} fill={isLiked ? '#ff4d4f' : 'none'} />
                    </button>
                </div>
            </header>

            {/* Image Slider */}
            <div className="image-wrapper">
                <div className="slider-container" onScroll={handleScroll}>
                    {images.map((src, index) => (
                        <div key={index} className="slider-item" onClick={() => setIsModalOpen(true)}>
                            <img src={src} alt={`Product ${index + 1}`} />
                        </div>
                    ))}
                </div>
                <div className="slider-dots">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${currentImage === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {isModalOpen && (
                <div className="image-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            &times;
                        </button>
                        <div className="modal-slider-container" ref={modalSliderRef} onScroll={handleScroll}>
                            {images.map((src, index) => (
                                <div key={index} className="modal-slider-item">
                                    <img src={src} alt="Zoomed Product" />
                                </div>
                            ))}
                        </div>
                        <div className="modal-slider-dots">
                            {images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`modal-dot ${currentImage === index ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div
                className="detail-content"
                style={{
                    marginTop: 0,
                    borderRadius: '24px 24px 0 0',
                    background: 'white',
                    position: 'relative',
                    zIndex: 10,
                    padding: '24px'
                }}
            >


                {/* Product Info */}
                <div className="product-section">
                    <h1 className="product-title">{item.title}</h1>
                    <div className="product-meta">
                        <span><Clock size={14} /> {getPostTimeLabel(item, nowTick)}</span>
                        <span><Eye size={14} /> {item.views}</span>
                        <span><Heart size={14} /> {likeCount}</span>
                    </div>
                    <p className="product-price" style={{ color: '#333', fontSize: '22px', fontWeight: '800', margin: 0 }}>{item.price}</p>
                </div>

                {/* Unified Info Card (Location & Trade Time) */}
                <div className="unified-info-card">
                    <div
                        className="info-row clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`, '_blank')}
                    >
                        <div className="icon-box">
                            <MapPin size={18} />
                        </div>
                        <div className="info-text">
                            <span className="label">거래 희망 장소</span>
                            <span className="value">{item.location}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="icon-box">
                            <Clock size={18} />
                        </div>
                        <div className="info-text">
                            <span className="label">희망 거래 시간</span>
                            <span className="value">{item.trade_time || '시간 협의'}</span>
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="unified-seller-card">
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            {item.profiles?.avatar_url ? (
                                <img src={item.profiles.avatar_url} alt="판매자" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={28} />
                            )}
                        </div>
                        <div className="unified-info">
                            <h4>{item.profiles?.username || item.profiles?.full_name || '익명'}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>5.0</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="unified-profile-btn"
                        onClick={() => navigate(`/profile/${item.user_id}`)}
                    >
                        프로필
                    </button>
                </div>

                {/* Description - Last */}
                <div className="description-section">
                    <h3>제품 내용</h3>
                    <p>{item.description}</p>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bottom-bar">
                <button
                    className="like-btn"
                    onClick={handleLikeClick}
                    style={{
                        color: isLiked ? '#ff4d4f' : 'inherit',
                        borderColor: isLiked ? '#ff4d4f' : '#ddd'
                    }}
                >
                    <Heart size={24} fill={isLiked ? '#ff4d4f' : 'none'} />
                </button>
                <button className="chat-btn" onClick={handleChatClick}>
                    <MessageCircle size={20} />
                    채팅하기
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
