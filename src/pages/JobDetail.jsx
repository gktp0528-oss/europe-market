import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Briefcase, Calendar, DollarSign, Eye, Star } from 'lucide-react';
import './DetailPage.css';

// 알바 상세 페이지
const JobDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const allJobs = [
        { id: 9, title: '부다페스트 한식당 주방보조', pay: '시급 2,500포린트', location: '부다페스트 6구', time: '20분 전', color: '#FFECB3', views: 156, likes: 24, workHours: '주 3일 (금, 토, 일)', workTime: '18:00 - 22:00', requirements: '경력 무관, 한국인 우대', description: '부다페스트 6구에 위치한 한식당에서 주방보조 구합니다.\n\n📍 위치: 부다페스트 6구 안드라시 거리 근처\n⏰ 시간: 저녁 6시 - 10시\n💰 급여: 시급 2,500포린트 (당일 지급)\n\n✅ 담당 업무:\n- 설거지 및 주방 보조\n- 재료 손질 도움\n- 간단한 서빙\n\n관심 있으신 분은 채팅 주세요!', employer: { name: '서울식당', rating: 4.8, hires: 12 } },
        { id: 10, title: '온천 리조트 통역 알바', pay: '일당 40,000포린트', location: '부다페스트 14구', time: '2시간 전', color: '#B2EBF2', views: 89, likes: 12, workHours: '주말 (토, 일)', workTime: '10:00 - 18:00', requirements: '영어/한국어 능통', description: '세체니 온천 근처 리조트에서 한국인 관광객 통역 알바 구합니다!\n\n🏨 근무지: 부다페스트 14구 온천 리조트\n📅 근무일: 주말 (토, 일)\n💰 급여: 일당 40,000포린트 + 점심 제공\n\n✅ 담당 업무:\n- 한국인 투숙객 체크인/아웃 통역\n- 스파 예약 안내\n- 간단한 관광 안내\n\n영어, 한국어 필수 / 헝가리어 가능시 우대!', employer: { name: '테르말호텔', rating: 4.9, hires: 8 } },
        { id: 11, title: '한인 게스트하우스 청소', pay: '시급 2,200포린트', location: '부다페스트 7구', time: '5시간 전', color: '#DCEDC8', views: 45, likes: 5, workHours: '주 5일', workTime: '09:00 - 13:00', requirements: '성실한 분', description: '7구 위치 한인 게스트하우스에서 청소 알바 구합니다.\n\n🏠 근무지: 부다페스트 7구 (유대인 지구)\n⏰ 시간: 오전 9시 - 오후 1시\n💰 급여: 시급 2,200포린트\n\n✅ 담당 업무:\n- 객실 청소 및 침구 교체\n- 공용 공간 청소\n- 세탁물 정리\n\n장기 근무 가능하신 분 우대합니다!', employer: { name: '부다홈', rating: 4.6, hires: 5 } },
    ];

    const job = allJobs.find(j => j.id === parseInt(id)) || allJobs[0];

    return (
        <div className="detail-page style-job">
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
            <div className="job-hero" style={{ backgroundColor: job.color }}>
                <Briefcase size={48} color="#666" style={{ opacity: 0.3 }} />
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Title & Pay */}
                <div className="job-title-section">
                    <h1 className="job-title">{job.title}</h1>
                    <div className="detail-meta-row">
                        <span><Clock size={14} /> {job.time}</span>
                        <span><Eye size={14} /> {job.views}</span>
                        <span><Heart size={14} /> {job.likes}</span>
                    </div>
                    <p className="job-pay">{job.pay}</p>
                </div>

                {/* Quick Info Cards */}
                <div className="job-info-cards">
                    <div className="info-card">
                        <Calendar size={18} />
                        <div>
                            <span className="label">근무일</span>
                            <span className="value">{job.workHours}</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <Clock size={18} />
                        <div>
                            <span className="label">근무시간</span>
                            <span className="value">{job.workTime}</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <MapPin size={18} />
                        <div>
                            <span className="label">위치</span>
                            <span className="value">{job.location}</span>
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="requirements-section">
                    <h3>자격요건</h3>
                    <p>{job.requirements}</p>
                </div>

                {/* Employer Card */}
                {/* Unified Employer Card */}
                <div className="unified-seller-card">
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            <User size={28} />
                        </div>
                        <div className="unified-info">
                            <h4>{job.employer.name}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>{job.employer.rating}</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description */}
                <div className="description-section">
                    <h3>상세 내용</h3>
                    <p>{job.description}</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bottom-bar job-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <button className="apply-btn">
                    <MessageCircle size={20} />
                    지원하기
                </button>
            </div>
        </div>
    );
};

export default JobDetail;
