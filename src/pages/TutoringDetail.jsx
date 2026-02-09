import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, BookOpen, Award, Eye, Star, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import './DetailPage.css';

// 과외/레슨 상세 페이지
const TutoringDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [tutoring, setTutoring] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

        if (user.id === tutoring.user_id) {
            alert('본인이 작성한 게시글입니다.');
            return;
        }

        if (!tutoring.user_id) {
            alert('작성자 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            navigate(`/chat/new?post_id=${tutoring.id}&seller_id=${tutoring.user_id}`);
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
            title: tutoring?.title || '과외/레슨',
            text: tutoring?.title || '',
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

    const fetchTutoringDetail = useCallback(async () => {
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
            setTutoring(data);
            setLikeCount(data.likes || 0);
        } catch (error) {
            console.error('Error fetching tutoring detail:', error);
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
        fetchTutoringDetail();
        incrementViewCount();
        fetchLikeStatus();
    }, [id, fetchTutoringDetail, incrementViewCount, fetchLikeStatus]);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!tutoring) return <div className="error-message">존재하지 않는 게시글입니다.</div>;

    // Parse Description for Subject and Type
    let subject = '과목';
    let descriptionBody = tutoring.description;

    // Extract subject from description: "[과외] 과목: 수학" or "[레슨] 분야: 피아노"
    if (tutoring.description) {
        const firstLine = tutoring.description.split('\n\n')[0];

        // Check if starts with [과외] or [레슨]
        if (firstLine.startsWith('[과외]') || firstLine.startsWith('[레슨]')) {
            // Extract subject after "과목:" or "분야:"
            const subjectMatch = firstLine.match(/(?:과목|분야):\s*(.+)/);
            if (subjectMatch) {
                subject = subjectMatch[1].trim();
            }

            // Remove first line from description
            const parts = tutoring.description.split('\n\n');
            descriptionBody = parts.slice(1).join('\n\n');
        }
    }

    const hasImages = tutoring.image_urls && tutoring.image_urls.length > 0;

    const nextImage = (e) => {
        e.stopPropagation();
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev + 1) % tutoring.image_urls.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev - 1 + tutoring.image_urls.length) % tutoring.image_urls.length);
        }
    };

    return (
        <div className="detail-page style-tutoring">
            {/* Header */}
            <header className="detail-header" style={{ background: 'white' }}>
                <button className="back-btn" onClick={() => navigate(-1)} style={{ color: 'black' }}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn" style={{ color: 'black' }} onClick={handleShareClick}><Share2 size={20} /></button>
                    <button
                        className="action-btn"
                        onClick={handleLikeClick}
                        style={{ color: isLiked ? '#ff4d4f' : 'black' }}
                    >
                        <Heart size={20} fill={isLiked ? '#ff4d4f' : 'none'} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div
                className="detail-content"
                style={{
                    marginTop: 0,
                    borderRadius: '24px 24px 0 0',
                    background: 'white',
                    position: 'relative',
                    zIndex: 10,
                    padding: '24px',
                    paddingTop: '88px'
                }}
            >
                {/* Title & Pay */}
                <div className="tutoring-title-section">
                    <span className="subject-badge">{subject}</span>
                    <h1 className="tutoring-title">{tutoring.title}</h1>
                    <div className="detail-meta-row">
                        <span><Clock size={14} /> {getPostTimeLabel(tutoring, nowTick)}</span>
                        <span><Eye size={14} /> {tutoring.views || 0}</span>
                        <span><Heart size={14} /> {likeCount}</span>
                    </div>
                </div>

                {/* Quick Info Cards */}
                {/* Unified Info Card */}
                <div className="unified-info-card">
                    <div className="info-row">
                        <div className="icon-box">
                            <DollarSign size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">수업료</span>
                            <span className="value" style={{ color: '#333', fontWeight: 700 }}>{tutoring.price || '수업료 협의'}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="icon-box">
                            <BookOpen size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">수업 레벨</span>
                            <span className="value">상세참조</span>
                        </div>
                    </div>
                    <div
                        className="info-row clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tutoring.location)}`, '_blank')}
                    >
                        <div className="icon-box">
                            <MapPin size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">수업 장소 (지도보기)</span>
                            <span className="value">{tutoring.location}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="icon-box">
                            <Award size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">수업 방식</span>
                            <span className="value">문의</span>
                        </div>
                    </div>
                </div>

                {hasImages && (
                    <div className="compact-media-card">
                        <div className="compact-media-frame">
                            <img
                                src={tutoring.image_urls[currentImageIndex]}
                                alt={tutoring.title}
                                className="compact-media-image"
                            />
                            {tutoring.image_urls.length > 1 && (
                                <>
                                    <button className="compact-slider-btn prev" onClick={prevImage}><ChevronLeft size={20} /></button>
                                    <button className="compact-slider-btn next" onClick={nextImage}><ChevronRight size={20} /></button>
                                    <div className="compact-slider-dots">
                                        {tutoring.image_urls.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`compact-dot ${currentImageIndex === idx ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Tutor Card */}
                {/* Unified Tutor Card */}
                <div className="unified-seller-card">
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            {tutoring.profiles?.avatar_url ? (
                                <img src={tutoring.profiles.avatar_url} alt="강사" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={28} />
                            )}
                        </div>
                        <div className="unified-info">
                            <h4>{tutoring.profiles?.username || tutoring.profiles?.full_name || '강사'}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>5.0</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="unified-profile-btn"
                        onClick={() => navigate(`/profile/${tutoring.user_id}`)}
                    >
                        프로필
                    </button>
                </div>

                {/* Description */}
                <div className="description-section tutoring">
                    <h3>수업 소개</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{descriptionBody}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar tutoring-bar">
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
                    문의하기 (채팅)
                </button>
                <button className="inquiry-btn">
                    <BookOpen size={20} />
                    수업 신청
                </button>
            </div>
        </div>
    );
};

export default TutoringDetail;
