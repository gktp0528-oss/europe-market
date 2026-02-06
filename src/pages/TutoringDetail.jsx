import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, GraduationCap, BookOpen, Award, Eye, Star } from 'lucide-react';
import './DetailPage.css';

// 과외/레슨 상세 페이지
const TutoringDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const allTutoring = [
        { id: 9, title: '헝가리어 기초 레슨', pay: '시급 8,000포린트', location: '부다페스트 5구', time: '30분 전', color: '#C5CAE9', views: 92, likes: 15, subject: '헝가리어', level: '입문/초급', method: '대면 또는 온라인', description: '헝가리어 기초부터 차근차근 알려드립니다!\n\n📚 커리큘럼:\n1주차: 알파벳과 발음\n2주차: 기본 인사말\n3주차: 숫자와 시간 표현\n4주차: 일상 회화 기초\n\n🎓 강사 소개:\n- 헝가리 거주 5년차\n- 한국어 교원 자격증 보유\n- 1:1 맞춤 수업 가능\n\n첫 수업 30분 무료 체험!', tutor: { name: '마자르언니', rating: 4.9, students: 28 } },
        { id: 10, title: '한국어 회화 과외', pay: '시급 10,000포린트', location: '부다페스트 13구', time: '3시간 전', color: '#FFCCBC', views: 145, likes: 42, subject: '한국어', level: '전체', method: '대면 선호', description: '한국어 회화 실력 향상시켜 드립니다!\n\n🎯 대상:\n- 한국어 기초가 있는 헝가리인\n- 회화 실력을 늘리고 싶은 분\n- K-드라마/K-팝 팬\n\n📖 수업 방식:\n- 주제별 자유 대화\n- 드라마/예능 대본 읽기\n- 발음 교정\n\n수업료 협의 가능합니다!', tutor: { name: '한국어쌤', rating: 5.0, students: 45 } },
        { id: 11, title: '기타 레슨 (초급)', pay: '시급 7,000포린트', location: '부다페스트 11구', time: '6시간 전', color: '#D7CCC8', views: 67, likes: 8, subject: '기타', level: '초급', method: '대면', description: '기타 처음 배우시는 분들 환영합니다! 🎸\n\n🎵 배우는 곡:\n- 쉬운 코드 위주 K-POP\n- 캠프파이어 인기곡\n- 핑거스타일 기초\n\n🎸 준비물:\n- 본인 기타 (없으시면 빌려드려요)\n\n레슨 장소: 11구 게예르트 광장 근처\n\n첫 레슨 50% 할인 이벤트 중!', tutor: { name: '기타리스트K', rating: 4.7, students: 15 } },
    ];

    const tutoring = allTutoring.find(t => t.id === parseInt(id)) || allTutoring[0];

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
            <div className="tutoring-hero" style={{ backgroundColor: tutoring.color }}>
                <GraduationCap size={48} color="#666" style={{ opacity: 0.3 }} />
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Title & Pay */}
                <div className="tutoring-title-section">
                    <span className="subject-badge">{tutoring.subject}</span>
                    <h1 className="tutoring-title">{tutoring.title}</h1>
                    <div className="detail-meta-row">
                        <span><Clock size={14} /> {tutoring.time}</span>
                        <span><Eye size={14} /> {tutoring.views}</span>
                        <span><Heart size={14} /> {tutoring.likes}</span>
                    </div>
                    <p className="tutoring-pay">{tutoring.pay}</p>
                </div>

                {/* Quick Info */}
                <div className="tutoring-info-row">
                    <div className="info-chip">
                        <BookOpen size={14} />
                        <span>{tutoring.level}</span>
                    </div>
                    <div className="info-chip">
                        <MapPin size={14} />
                        <span>{tutoring.location}</span>
                    </div>
                    <div className="info-chip">
                        <Award size={14} />
                        <span>{tutoring.method}</span>
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
                            <h4>{tutoring.tutor.name}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>{tutoring.tutor.rating}</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description */}
                <div className="description-section tutoring">
                    <h3>수업 소개</h3>
                    <p>{tutoring.description}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar tutoring-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <div className="price-info">
                    <span className="label">레슨비</span>
                    <strong>{tutoring.pay}</strong>
                </div>
                <button className="inquiry-btn">
                    <MessageCircle size={20} />
                    문의하기
                </button>
            </div>
        </div>
    );
};

export default TutoringDetail;
