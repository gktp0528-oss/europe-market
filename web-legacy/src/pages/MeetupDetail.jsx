import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Calendar, UserPlus, Eye, Star, Users, User, ChevronLeft, ChevronRight, Clock, Tag, Monitor, Globe, CheckCircle, ShieldCheck, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './DetailPage.css';

// 모임 상세 페이지
const MeetupDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [meetup, setMeetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const { user } = useAuth();

    const handleChatClick = async () => {
        if (!user) {
            if (window.confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                navigate('/login');
            }
            return;
        }

        if (user.id === meetup.user_id) {
            alert('본인이 작성한 게시글입니다.');
            return;
        }

        if (!meetup.user_id) {
            alert('작성자 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            navigate(`/chat/new?post_id=${meetup.id}&seller_id=${meetup.user_id}`);
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
            title: meetup?.title || '모임',
            text: meetup?.title || '모임에 참여하세요!',
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

    const fetchMeetupDetail = useCallback(async () => {
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
            setMeetup(data);
            setLikeCount(data.likes || 0);
        } catch (error) {
            console.error('Error fetching meetup detail:', error);
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
        fetchMeetupDetail();
        incrementViewCount();
        fetchLikeStatus();
    }, [id, fetchMeetupDetail, incrementViewCount, fetchLikeStatus]);

    const nextImage = (e) => {
        e.stopPropagation();
        if (meetup.image_urls && meetup.image_urls.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % meetup.image_urls.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (meetup.image_urls && meetup.image_urls.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + meetup.image_urls.length) % meetup.image_urls.length);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!meetup) return <div className="error-message">존재하지 않는 모임입니다.</div>;

    // Metadata extraction with defaults for backward compatibility
    const metadata = meetup.metadata || {};
    const tags = metadata.tags || [];
    const onOffline = metadata.onOffline || 'offline';
    const approvalType = metadata.approvalType || 'first-come';
    const startTime = metadata.startTime || '';
    const endTime = metadata.endTime || '';
    const meetupType = metadata.meetupType || 'one-time';
    const repeatDays = metadata.repeatDays || [];
    const repeatCycle = metadata.repeatCycle || '매주';

    // Parse Description for Participants (legacy fallback)
    let maxMembers = metadata.members || '0';
    let descriptionBody = meetup.description;

    if (!metadata.members && meetup.description && meetup.description.includes('모집 인원:')) {
        const parts = meetup.description.split('\n\n');
        if (parts.length > 0) {
            maxMembers = parts[0].replace('모집 인원:', '').replace('명', '').trim();
            descriptionBody = parts.slice(1).join('\n\n');
        }
    }

    // Smart Field Mapping for Backward Compatibility
    const isNewFormat = meetup.trade_time != null;
    const isRecurring = meetupType === 'recurring';

    // For recurring: "매주 (월, 수)", For one-time: "2024-03-10"
    const displayDate = isRecurring
        ? `${repeatCycle} (${repeatDays.join(', ')})`
        : (meetup.trade_time ? meetup.trade_time.split(' ')[0] : (meetup.price && meetup.price.includes('-') ? meetup.price : '날짜 미정'));

    const displayTime = startTime && endTime ? `${startTime} ~ ${endTime}` : (meetup.trade_time && meetup.trade_time.includes(':') ? meetup.trade_time.split(' ')[1] : '시간 미정');
    const displayFee = isNewFormat ? meetup.price : '회비 문의';
    const hasImages = meetup.image_urls && meetup.image_urls.length > 0;

    return (
        <div className="detail-page style-meetup">
            {/* Header */}
            <header className="detail-header" style={{ background: hasImages ? 'transparent' : 'white' }}>
                <button className="back-btn" onClick={() => navigate(-1)} style={{ color: hasImages ? 'white' : 'black' }}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn" onClick={handleShareClick} style={{ color: hasImages ? 'white' : 'black' }}>
                        <Share2 size={20} />
                    </button>
                    <button
                        className="action-btn"
                        onClick={handleLikeClick}
                        style={{ color: isLiked ? '#ff4d4f' : (hasImages ? 'white' : 'black') }}
                    >
                        <Heart size={20} fill={isLiked ? '#ff4d4f' : 'none'} />
                    </button>
                </div>
            </header>

            {/* Hero Section (Image Slider or Color) */}
            {hasImages ? (
                <div className="hero-slider-container" style={{ position: 'relative' }}>
                    <img
                        src={meetup.image_urls[currentImageIndex]}
                        alt="Meetup Preview"
                        className="hero-image"
                    />
                    {meetup.image_urls.length > 1 && (
                        <>
                            <button className="slider-btn prev" onClick={prevImage}><ChevronLeft size={24} /></button>
                            <button className="slider-btn next" onClick={nextImage}><ChevronRight size={24} /></button>
                            <div className="slider-dots">
                                {meetup.image_urls.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`dot ${currentImageIndex === idx ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="meetup-hero" style={{ backgroundColor: meetup.color || '#E0F7FA' }}>
                    <Users size={48} color="#666" style={{ opacity: 0.3 }} />
                </div>
            )}

            {/* Content */}
            <div className="detail-content" style={{ marginTop: 0, borderRadius: '24px 24px 0 0', background: 'white', position: 'relative', zIndex: 10, padding: '24px' }}>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="meetup-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {tags.map(tag => (
                            <span key={tag} style={{ padding: '4px 10px', background: '#F0F9FF', color: '#0097A7', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title Section */}
                <div className="meetup-title-section">
                    <h1 className="meetup-title" style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.3', marginBottom: '12px' }}>{meetup.title}</h1>
                    <div className="meetup-date-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={16} color="#00BCD4" />
                            <span>{displayDate}</span>
                        </div>
                        <div style={{ width: '1px', height: '12px', background: '#eee' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {meetup.views || 0}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> {likeCount}</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="unified-info-card" style={{ marginTop: '24px' }}>
                    {/* Method & Location */}
                    <div
                        className={`info-row ${onOffline === 'offline' ? 'clickable' : ''}`}
                        onClick={() => onOffline === 'offline' && window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetup.location)}`, '_blank')}
                    >
                        <div className="icon-box" style={{ background: '#E0F7FA', color: '#0097A7' }}>
                            {onOffline === 'offline' ? <MapPin size={20} /> : <Monitor size={20} />}
                        </div>
                        <div className="info-text">
                            <span className="label">{onOffline === 'offline' ? '장소 (지도보기)' : '진행 방식'}</span>
                            <span className="value">{onOffline === 'offline' ? meetup.location : '온라인 모임'}</span>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="info-row">
                        <div className="icon-box" style={{ background: '#F3E5F5', color: '#7B1FA2' }}>
                            <Clock size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">시간</span>
                            <span className="value">{displayTime}</span>
                        </div>
                    </div>

                    {/* Members & Approval */}
                    <div className="info-row">
                        <div className="icon-box" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                            <Users size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">모집 인원 & 승인 방식</span>
                            <span className="value">
                                {maxMembers}명 · {approvalType === 'first-come' ? '선착순' : '승인제'}
                            </span>
                        </div>
                    </div>

                    {/* Fee */}
                    <div className="info-row">
                        <div className="icon-box" style={{ background: '#FFF3E0', color: '#E65100' }}>
                            <Star size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">참가비</span>
                            <span className="value">{displayFee}</span>
                        </div>
                    </div>
                </div>

                {/* Participation Status (Visual) */}
                <div className="participation-status" style={{ marginTop: '20px', padding: '16px', background: '#F8F9FA', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ color: '#666' }}>신청 인원 1명</span>
                        <span style={{ fontWeight: '700', color: '#00BCD4' }}>최대 {maxMembers}명</span>
                    </div>
                    <div className="participant-bar" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                            className="participant-fill"
                            style={{ width: '10%', height: '100%', background: '#00BCD4' }}
                        ></div>
                    </div>
                </div>

                {/* Host Card */}
                <div className="unified-seller-card" style={{ marginTop: '24px' }}>
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            {meetup.profiles?.avatar_url ? (
                                <img src={meetup.profiles.avatar_url} alt="호스트" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={28} />
                            )}
                        </div>
                        <div className="unified-info">
                            <h4>{meetup.profiles?.username || meetup.profiles?.full_name || '호스트'}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>5.0</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="unified-profile-btn"
                        onClick={() => navigate(`/profile/${meetup.user_id}`)}
                    >
                        프로필
                    </button>
                </div>

                {/* Description */}
                <div className="description-section meetup" style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>모임 소개</h3>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#333' }}>{descriptionBody}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar meetup-bar" style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: '480px', display: 'flex', gap: '12px', padding: '12px 20px',
                background: 'white', borderTop: '1px solid #eee', zIndex: 1000
            }}>
                <button
                    className="like-btn"
                    onClick={handleLikeClick}
                    style={{
                        width: '48px', height: '48px',
                        border: `1px solid ${isLiked ? '#ff4d4f' : '#ddd'}`,
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isLiked ? '#ff4d4f' : 'inherit'
                    }}
                >
                    <Heart size={24} fill={isLiked ? '#ff4d4f' : 'none'} />
                </button>
                <button className="like-btn" onClick={handleChatClick} style={{
                    width: '48px', height: '48px', border: '1px solid #ddd', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00BCD4'
                }}>
                    <MessageCircle size={24} />
                </button>
                <button className="join-btn" style={{
                    flex: 1, padding: '16px', background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
                    color: 'white', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    {approvalType === 'first-come' ? <UserPlus size={20} /> : <CheckCircle size={20} />}
                    {approvalType === 'first-come' ? '참가 신청' : '승인 요청하기'}
                </button>
            </div>
        </div>
    );
};

export default MeetupDetail;
