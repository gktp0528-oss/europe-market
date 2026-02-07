import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Calendar, UserPlus, Eye, Star, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DetailPage.css';

// 모임 상세 페이지
const MeetupDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [meetup, setMeetup] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!meetup) return <div className="error-message">존재하지 않는 모임입니다.</div>;

    // Parse Description for Participants
    let maxMembers = '0';
    let descriptionBody = meetup.description;

    if (meetup.description && meetup.description.includes('모집 인원:')) {
        const parts = meetup.description.split('\n\n');
        if (parts.length > 0) {
            maxMembers = parts[0].replace('모집 인원:', '').trim();
            descriptionBody = parts.slice(1).join('\n\n');
        }
    }

    return (
        <div className="detail-page style-meetup">
            {/* Header */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn"><Share2 size={20} /></button>
                    <button className="action-btn"><Heart size={20} /></button>
                </div>
            </header>

            {/* Hero Section */}
            <div className="meetup-hero" style={{ backgroundColor: meetup.color || '#80DEEA' }}>
                <Users size={48} color="#666" style={{ opacity: 0.3 }} />
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Title Section */}
                <div className="meetup-title-section">
                    <h1 className="meetup-title">{meetup.title}</h1>
                    <div className="meetup-date-row">
                        <Calendar size={16} />
                        <span>{meetup.price}</span> {/* Date stored in price col */}
                        <div style={{ width: '1px', height: '12px', background: '#ccc', margin: '0 8px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {meetup.views || 0}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> {meetup.likes || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="meetup-info-cards">
                    <div
                        className="meetup-info-card clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetup.location)}`, '_blank')}
                    >
                        <MapPin size={20} />
                        <div>
                            <span className="label">장소</span>
                            <span className="value">{meetup.location}</span>
                        </div>
                    </div>
                    <div className="meetup-info-card">
                        <Users size={20} />
                        <div>
                            <span className="label">참가자</span>
                            <span className="value">모집 {maxMembers}</span>
                        </div>
                    </div>
                    <div className="meetup-info-card">
                        <span className="fee-badge">회비 문의</span>
                    </div>
                </div>

                {/* Participant Bar (Mock for now since we don't track current participants in DB yet) */}
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
