import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Calendar, UserPlus, Eye, Star, Users, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DetailPage.css';

// 모임 상세 페이지
const MeetupDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [meetup, setMeetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchMeetupDetail();
        incrementViewCount();
    }, [id]);

    const fetchMeetupDetail = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setMeetup(data);
        } catch (error) {
            console.error('Error fetching meetup detail:', error);
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

    // Parse Description for Participants
    let maxMembers = '0';
    let descriptionBody = meetup.description;

    if (meetup.description && meetup.description.includes('모집 인원:')) {
        const parts = meetup.description.split('\n\n');
        if (parts.length > 0) {
            maxMembers = parts[0].replace('모집 인원:', '').replace('명', '').trim();
            descriptionBody = parts.slice(1).join('\n\n');
        }
    }

    // Smart Field Mapping for Backward Compatibility
    // Old: price = "Date String", trade_time = null
    // New: price = "Fee String", trade_time = "Date String"
    const isNewFormat = meetup.trade_time != null;
    const displayDate = isNewFormat ? meetup.trade_time : meetup.price;
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
                    <button className="action-btn" style={{ color: hasImages ? 'white' : 'black' }}><Share2 size={20} /></button>
                    <button className="action-btn" style={{ color: hasImages ? 'white' : 'black' }}><Heart size={20} /></button>
                </div>
            </header>

            {/* Hero Section (Image Slider or Color) */}
            {hasImages ? (
                <div className="hero-slider-container" style={{ height: '300px', position: 'relative' }}>
                    <img
                        src={meetup.image_urls[currentImageIndex]}
                        alt="Meetup Preview"
                        className="hero-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                <div className="meetup-hero" style={{ backgroundColor: meetup.color || '#E0F7FA', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={48} color="#666" style={{ opacity: 0.3 }} />
                </div>
            )}

            {/* Content */}
            <div className="detail-content" style={{ marginTop: hasImages ? '-20px' : '0', borderRadius: '24px 24px 0 0', background: 'white', position: 'relative', zIndex: 10, padding: '24px' }}>
                {/* Title Section */}
                <div className="meetup-title-section">
                    <h1 className="meetup-title">{meetup.title}</h1>
                    <div className="meetup-date-row">
                        <Clock size={16} />
                        <span>{displayDate}</span>
                        <div style={{ width: '1px', height: '12px', background: '#ccc', margin: '0 8px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {meetup.views || 0}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> {meetup.likes || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                {/* Unified Info Card */}
                <div className="unified-info-card">
                    <div
                        className="info-row clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetup.location)}`, '_blank')}
                    >
                        <div className="icon-box">
                            <MapPin size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">장소 (지도보기)</span>
                            <span className="value">{meetup.location}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="icon-box">
                            <Users size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">모집 인원</span>
                            <span className="value">{maxMembers}명</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="icon-box">
                            <Star size={20} />
                        </div>
                        <div className="info-text">
                            <span className="label">참가비</span>
                            <span className="value">{displayFee}</span>
                        </div>
                    </div>
                </div>

                {/* Participant Bar (visual only) */}
                <div className="participant-bar">
                    <div
                        className="participant-fill"
                        style={{ width: '10%' }}
                    ></div>
                </div>

                {/* Host Card */}
                {/* Unified Host Card */}
                <div className="unified-seller-card">
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            <User size={28} />
                        </div>
                        <div className="unified-info">
                            <h4>주최자</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>--</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description */}
                <div className="description-section meetup">
                    <h3>모임 소개</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{descriptionBody}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar meetup-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <button className="join-btn">
                    <UserPlus size={20} />
                    참가 신청
                </button>
            </div>
        </div>
    );
};

export default MeetupDetail;
