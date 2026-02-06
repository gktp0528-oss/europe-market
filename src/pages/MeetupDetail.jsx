import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Users, Calendar, UserPlus, Eye, Star } from 'lucide-react';
import './DetailPage.css';

// 모임 상세 페이지
const MeetupDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const allMeetups = [
        { id: 9, title: '부다페스트 온천 투어', date: '2/11 (일)', location: '세체니 온천', time: '10분 전', color: '#80DEEA', views: 240, likes: 45, meetTime: '오후 2시', participants: { current: 8, max: 12 }, fee: '무료 (입장료 별도)', description: '부다페스트의 유명한 온천들을 함께 둘러봐요! 🛁\n\n📅 일시: 2월 11일 (일) 오후 2시\n📍 집결지: 영웅광장 기둥 앞\n\n🗺️ 코스:\n1. 세체니 온천 (3시간)\n2. 바이다후냐드 성 구경\n3. 근처 카페에서 티타임\n\n💰 참가비: 무료!\n(온천 입장료 약 7,000포린트는 개별 결제)\n\n준비물: 수영복, 타월, 슬리퍼\n\n처음 오시는 분도 편하게 오세요~', host: { name: '온천러버', rating: 4.9, events: 23 } },
        { id: 10, title: '헝가리 와인 시음회', date: '2/17 (토)', location: '부다 성 근처', time: '2시간 전', color: '#CE93D8', views: 180, likes: 32, meetTime: '오후 6시', participants: { current: 5, max: 8 }, fee: '15,000포린트', description: '헝가리 와인을 함께 즐겨요! 🍷\n\n📅 일시: 2월 17일 (토) 오후 6시\n📍 장소: 부다 성 근처 와인바\n\n🍇 시음 와인 (5종):\n- 토카이 아수 (디저트 와인)\n- 에게르 비카베르 (레드)\n- 에게르 케크프란코스\n- 빌라니 카베르네\n- 소믈로이 화이트\n\n💰 참가비: 15,000포린트\n(와인 5잔 + 안주 포함)\n\n정원 8명 선착순 마감!', host: { name: '와인홀릭', rating: 5.0, events: 15 } },
        { id: 11, title: '다뉴브강 야경 산책', date: '매주 금요일', location: '자유의 다리', time: '4시간 전', color: '#90CAF9', views: 320, likes: 89, meetTime: '오후 8시', participants: { current: 12, max: 20 }, fee: '무료', description: '금요일 밤, 다뉴브강 야경과 함께 산책해요! 🌉\n\n📅 일시: 매주 금요일 오후 8시\n📍 집결지: 자유의 다리 페스트 쪽\n\n🚶 산책 코스 (약 1시간):\n자유의 다리 → 겔레르트 언덕 전망대 → 엘리자베스 다리 → 세체니 체인 브릿지\n\n💡 포인트:\n- 야경 사진 찍기 좋은 스팟들!\n- 마무리는 루인바에서 맥주 한 잔 🍺\n\n우천시 취소 (전날 공지)', host: { name: '부다산책러', rating: 4.8, events: 45 } },
    ];

    const meetup = allMeetups.find(m => m.id === parseInt(id)) || allMeetups[0];

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
            <div className="meetup-hero" style={{ backgroundColor: meetup.color }}>
                <Users size={48} color="#666" style={{ opacity: 0.3 }} />
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Title Section */}
                <div className="meetup-title-section">
                    <h1 className="meetup-title">{meetup.title}</h1>
                    <div className="meetup-date-row">
                        <Calendar size={16} />
                        <span>{meetup.date} {meetup.meetTime}</span>
                        <div style={{ width: '1px', height: '12px', background: '#ccc', margin: '0 8px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {meetup.views}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> {meetup.likes}</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="meetup-info-cards">
                    <div className="meetup-info-card">
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
                            <span className="value">{meetup.participants.current}/{meetup.participants.max}명</span>
                        </div>
                    </div>
                    <div className="meetup-info-card">
                        <span className="fee-badge">{meetup.fee}</span>
                    </div>
                </div>

                {/* Participant Bar */}
                <div className="participant-bar">
                    <div
                        className="participant-fill"
                        style={{ width: `${(meetup.participants.current / meetup.participants.max) * 100}%` }}
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
                            <h4>{meetup.host.name}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>{meetup.host.rating}</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description */}
                <div className="description-section meetup">
                    <h3>모임 소개</h3>
                    <p>{meetup.description}</p>
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
