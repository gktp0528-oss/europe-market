import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Briefcase, Calendar, DollarSign, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { startChat } from '../lib/chat';
import './DetailPage.css';

// 알바 상세 페이지
const JobDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user } = useAuth();

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
            const conversationId = await startChat(user.id, job.user_id, job.id);
            navigate(`/chat/${conversationId}`);
        } catch (error) {
            alert('채팅 연결 실패');
        }
    };

    useEffect(() => {
        fetchJobDetail();
        incrementViewCount();
    }, [id]);

    const fetchJobDetail = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setJob(data);
        } catch (error) {
            console.error('Error fetching job detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementViewCount = async () => {
        try {
            await supabase.rpc('increment_views', { post_id: id });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    };

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

    return (
        <div className="detail-page style-job">
            {/* Header */}
            <header className="detail-header" style={{ background: hasImages ? 'transparent' : 'white' }}>
                <button className="back-btn" onClick={() => navigate(-1)} style={{ color: hasImages ? 'white' : 'black' }}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn" style={{ color: hasImages ? 'white' : 'black' }}><Share2 size={20} /></button>
                    <button className="action-btn" style={{ color: hasImages ? 'white' : 'black' }}><Heart size={20} /></button>
                </div>
            </header>

            {/* Hero Section (Image Slider or Color) */}
            {hasImages ? (
                <div className="hero-slider-container" style={{ height: '300px', position: 'relative' }}>
                    <img
                        src={job.image_urls[currentImageIndex]}
                        alt="Job Preview"
                        className="hero-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {job.image_urls.length > 1 && (
                        <>
                            <button className="slider-btn prev" onClick={prevImage}><ChevronLeft size={24} /></button>
                            <button className="slider-btn next" onClick={nextImage}><ChevronRight size={24} /></button>
                            <div className="slider-dots">
                                {job.image_urls.map((_, idx) => (
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
                <div className="job-hero" style={{ backgroundColor: job.color || '#FFF9C4', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={48} color="#666" style={{ opacity: 0.3 }} />
                </div>
            )}

            {/* Content */}
            <div className="detail-content" style={{ marginTop: hasImages ? '-20px' : '0', borderRadius: '24px 24px 0 0', background: 'white', position: 'relative', zIndex: 10, padding: '24px' }}>
                {/* Title & Pay */}
                <div className="job-title-section">
                    <h1 className="job-title">{job.title}</h1>
                    <div className="detail-meta-row">
                        <span><Clock size={14} /> {job.time_ago || '방금 전'}</span>
                        <span><Eye size={14} /> {job.views || 0}</span>
                        <span><Heart size={14} /> {job.likes || 0}</span>
                    </div>
                </div>

                {/* Quick Info Cards */}
                {/* Unified Info Card */}
                <div className="unified-info-card">
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

                {/* Requirements */}
                <div className="requirements-section" style={{ marginTop: '24px', padding: '16px', background: '#F9F9F9', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>자격요건</h3>
                    <p style={{ whiteSpace: 'pre-line', color: '#555' }}>{requirements}</p>
                </div>

                {/* Employer Card (Mock for now, or user info if available) */}
                <div className="unified-seller-card" style={{ marginTop: '24px' }}>
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            <User size={28} />
                        </div>
                        <div className="unified-info">
                            <h4>작성자</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>--</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description */}
                <div className="description-section" style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>상세 내용</h3>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#333' }}>{descriptionBody}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar job-bar">
                <button className="like-btn">
                    <Heart size={24} />
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
