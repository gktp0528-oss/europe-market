import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Calendar, DollarSign, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import './DetailPage.css';

// 알바 상세 페이지
const JobDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const { user } = useAuth();
    const nowTick = useMinuteTicker();

    const handleChatClick = async () => {
        if (!user) {
            if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                navigate('/login');
            }
            return;
        }

        if (user.id === job.user_id) {
            alert('본인 게시글입니다.');
            return;
        }

        if (!job.user_id) {
            alert('작성자 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            navigate(`/chat/new?post_id=${job.id}&seller_id=${job.user_id}`);
        } catch (error) {
            console.error('Chat connection failed:', error);
            alert('채팅 연결 실패');
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
            title: job?.title || '알바',
            text: `${job?.title} - ${job?.price || '급여 협의'}`,
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

    const fetchJobDetail = useCallback(async () => {
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
            setJob(data);
            setLikeCount(data.likes || 0);
        } catch (error) {
            console.error('Error fetching job detail:', error);
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
        fetchJobDetail();
        incrementViewCount();
        fetchLikeStatus();
    }, [id, fetchJobDetail, incrementViewCount, fetchLikeStatus]);

    const nextImage = (e) => {
        e.stopPropagation();
        if (job.image_urls && job.image_urls.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % job.image_urls.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (job.image_urls && job.image_urls.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + job.image_urls.length) % job.image_urls.length);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!job) return <div className="error-message">존재하지 않는 공고입니다.</div>;

    // Parse Description for Requirements
    let requirements = '상세 내용 확인';
    let descriptionBody = job.description;

    if (job.description && job.description.includes('[자격요건]')) {
        const parts = job.description.split('[상세내용]');
        if (parts.length > 1) {
            requirements = parts[0].replace('[자격요건]', '').trim();
            descriptionBody = parts[1].trim();
        }
    }

    const hasImages = job.image_urls && job.image_urls.length > 0;
    const jobKeywords = (() => {
        const metadataTags = Array.isArray(job.metadata?.tags) ? job.metadata.tags.filter(Boolean) : [];
        if (metadataTags.length > 0) {
            return metadataTags.slice(0, 3);
        }

        const hashTags = `${job.title || ''} ${job.description || ''}`
            .match(/#[^\s#]+/g)
            ?.map((tag) => tag.replace('#', ''))
            .filter(Boolean) || [];

        if (hashTags.length > 0) {
            return hashTags.slice(0, 3);
        }

        return ['구인'];
    })();

    return (
        <div className="detail-page style-job">
            {/* Header */}
            <header className="detail-header" style={{ background: 'white' }}>
                <button className="back-btn" onClick={() => navigate(-1)} style={{ color: 'black' }}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn" onClick={handleShareClick} style={{ color: 'black' }}>
                        <Share2 size={20} />
                    </button>
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
            <div className="detail-content" style={{ marginTop: 0, borderRadius: '24px 24px 0 0', background: 'white', position: 'relative', zIndex: 10, padding: '24px', paddingTop: '88px' }}>
                {/* Title & Pay */}
                <div className="job-title-section">
                    <div className="job-keywords">
                        {jobKeywords.map((keyword) => (
                            <span key={keyword} className="job-keyword-badge">#{keyword}</span>
                        ))}
                    </div>
                    <h1 className="job-title">{job.title}</h1>
                    <div className="detail-meta-row">
                        <span><Clock size={14} /> {getPostTimeLabel(job, nowTick)}</span>
                        <span><Eye size={14} /> {job.views || 0}</span>
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
                            <span className="label">급여</span>
                            <span className="value" style={{ color: '#333', fontWeight: 700 }}>{job.price || '급여 협의'}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="icon-box">
                            <Calendar size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">근무일시</span>
                            <span className="value">{job.trade_time}</span>
                        </div>
                    </div>
                    <div
                        className="info-row clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`, '_blank')}
                    >
                        <div className="icon-box">
                            <MapPin size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">위치 (지도보기)</span>
                            <span className="value">{job.location}</span>
                        </div>
                    </div>
                </div>

                {hasImages && (
                    <div className="compact-media-card">
                        <div className="compact-media-frame">
                            <img
                                src={job.image_urls[currentImageIndex]}
                                alt="Job Preview"
                                className="compact-media-image"
                            />
                            {job.image_urls.length > 1 && (
                                <>
                                    <button className="compact-slider-btn prev" onClick={prevImage}><ChevronLeft size={20} /></button>
                                    <button className="compact-slider-btn next" onClick={nextImage}><ChevronRight size={20} /></button>
                                    <div className="compact-slider-dots">
                                        {job.image_urls.map((_, idx) => (
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

                {/* Requirements */}
                <div className="requirements-section" style={{ marginTop: '24px', padding: '16px', background: '#F9F9F9', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>자격요건</h3>
                    <p style={{ whiteSpace: 'pre-line', color: '#555' }}>{requirements}</p>
                </div>

                {/* Employer Card */}
                <div className="unified-seller-card" style={{ marginTop: '24px' }}>
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            {job.profiles?.avatar_url ? (
                                <img src={job.profiles.avatar_url} alt="작성자" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={28} />
                            )}
                        </div>
                        <div className="unified-info">
                            <h4>{job.profiles?.username || job.profiles?.full_name || '작성자'}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>5.0</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="unified-profile-btn"
                        onClick={() => navigate(`/profile/${job.user_id}`)}
                    >
                        프로필
                    </button>
                </div>

                {/* Description */}
                <div className="description-section" style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>상세 내용</h3>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#333' }}>{descriptionBody}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar job-bar">
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
                <button className="apply-btn" onClick={handleChatClick}>
                    <MessageCircle size={20} />
                    지원하기 (채팅)
                </button>
            </div>
        </div>
    );
};

export default JobDetail;
