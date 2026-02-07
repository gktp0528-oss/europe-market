import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, GraduationCap, BookOpen, Award, Eye, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DetailPage.css';

// 과외/레슨 상세 페이지
const TutoringDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [tutoring, setTutoring] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTutoringDetail();
        incrementViewCount();
    }, [id]);

    const fetchTutoringDetail = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setTutoring(data);
        } catch (error) {
            console.error('Error fetching tutoring detail:', error);
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
    if (!tutoring) return <div className="error-message">존재하지 않는 게시글입니다.</div>;

    // Parse Description for Subject if hidden there
    let subject = '과목';
    let descriptionBody = tutoring.description;

    // Attempt to extract "과목: ..." from description if format matches WriteTutoring.jsx
    if (tutoring.description && tutoring.description.startsWith('과목:')) {
        const parts = tutoring.description.split('\n\n');
        if (parts.length > 0) {
            subject = parts[0].replace('과목:', '').trim();
            descriptionBody = parts.slice(1).join('\n\n');
        }
    }

    return (
        <div className="detail-page style-tutoring">
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
            <div className="tutoring-hero" style={{ backgroundColor: tutoring.color || '#C5CAE9' }}>
                <GraduationCap size={48} color="#666" style={{ opacity: 0.3 }} />
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Title & Pay */}
                <div className="tutoring-title-section">
                    <span className="subject-badge">{subject}</span>
                    <h1 className="tutoring-title">{tutoring.title}</h1>
                    <div className="detail-meta-row">
                        <span><Clock size={14} /> {tutoring.time_ago || '방금 전'}</span>
                        <span><Eye size={14} /> {tutoring.views || 0}</span>
                        <span><Heart size={14} /> {tutoring.likes || 0}</span>
                    </div>
                    <p className="tutoring-pay" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{tutoring.price}</p>
                </div>

                {/* Quick Info Cards */}
                <div className="job-info-cards">
                    <div className="info-card">
                        <BookOpen size={18} />
                        <div>
                            <span className="label">수업 레벨</span>
                            <span className="value">상세참조</span>
                        </div>
                    </div>
                    <div
                        className="info-card clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tutoring.location)}`, '_blank')}
                    >
                        <MapPin size={18} />
                        <div>
                            <span className="label">수업 장소</span>
                            <span className="value">{tutoring.location}</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <Award size={18} />
                        <div>
                            <span className="label">수업 방식</span>
                            <span className="value">문의</span>
                        </div>
                    </div>
                </div>

                {/* Tutor Card */}
                {/* Unified Tutor Card */}
                <div className="unified-seller-card">
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            <User size={28} />
                        </div>
                        <div className="unified-info">
                            <h4>강사</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>--</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description */}
                <div className="description-section tutoring">
                    <h3>수업 소개</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{descriptionBody}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar tutoring-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <button className="chat-btn">
                    <MessageCircle size={20} />
                    문의하기
                </button>
                <button className="inquiry-btn">
                    <MessageCircle size={20} />
                    문의하기
                </button>
            </div>
        </div>
    );
};

export default TutoringDetail;
