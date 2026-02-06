import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Pencil, ShoppingBag, Briefcase, GraduationCap } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import './CategoryClothes.css';

const CategoryMeetups = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();
    const [fabExpanded, setFabExpanded] = useState(false);

    const items = [
        { id: 1, title: '주말 등산 모임', date: '2/10 (토)', location: '파리 외곽', time: '5분 전', color: '#C8E6C9', country: 'FR' },
        { id: 2, title: '베를린 한인 조기축구', date: '매주 일요일', location: '베를린 마우어파크', time: '30분 전', color: '#BBDEFB', country: 'DE' },
        { id: 3, title: '독서 모임 (소설)', date: '2/15 (목)', location: '뮌헨 시내', time: '1시간 전', color: '#F8BBD9', country: 'DE' },
        { id: 4, title: '런던 한인 러닝크루', date: '매주 토요일', location: '하이드파크', time: '2시간 전', color: '#B2DFDB', country: 'GB' },
        { id: 5, title: '와인 시음 모임', date: '2/20 (화)', location: '파리 마레지구', time: '3시간 전', color: '#D1C4E9', country: 'FR' },
        { id: 6, title: '보드게임 모임', date: '매주 금요일', location: '프랑크푸르트', time: '4시간 전', color: '#FFE0B2', country: 'DE' },
        { id: 7, title: '암스테르담 자전거 투어', date: '2/12 (일)', location: '중앙역 앞', time: '5시간 전', color: '#B3E5FC', country: 'NL' },
        { id: 8, title: '비엔나 오페라 관람', date: '2/25 (일)', location: '국립오페라극장', time: '1일 전', color: '#F5F5F5', country: 'AT' },
        // 헝가리 샘플
        { id: 9, title: '부다페스트 온천 투어', date: '2/11 (일)', location: '세체니 온천', time: '10분 전', color: '#80DEEA', country: 'HU' },
        { id: 10, title: '헝가리 와인 시음회', date: '2/17 (토)', location: '부다 성 근처', time: '2시간 전', color: '#CE93D8', country: 'HU' },
        { id: 11, title: '다뉴브강 야경 산책', date: '매주 금요일', location: '자유의 다리', time: '4시간 전', color: '#90CAF9', country: 'HU' },
    ];

    const filteredItems = items.filter(item => item.country === selectedCountry.code);

    return (
        <div className="category-page">
            <header className="category-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="header-title">모임 ({selectedCountry.name})</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="product-grid">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="product-card"
                            onClick={() => navigate(`/meetup/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image" style={{ backgroundColor: item.color }}>
                                <Users size={40} color="#666" style={{ opacity: 0.3 }} />
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <p className="product-price">{item.date}</p>
                                <div className="product-meta">
                                    <span><MapPin size={12} /> {item.location}</span>
                                    <span><Clock size={12} /> {item.time}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state" style={{ margin: '20px auto' }}>
                        <p>해당 국가의 모임이 없습니다 🥲</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button - Speed Dial */}
            <div className="fab-container">
                <div className={`fab-options ${fabExpanded ? 'expanded' : ''}`}>
                    <button className="fab-option" onClick={() => { navigate('/write?category=clothes'); setFabExpanded(false); }}>
                        <ShoppingBag size={18} />
                        <span>중고거래</span>
                    </button>
                    <button className="fab-option" onClick={() => { navigate('/write?category=jobs'); setFabExpanded(false); }}>
                        <Briefcase size={18} />
                        <span>알바</span>
                    </button>
                    <button className="fab-option" onClick={() => { navigate('/write?category=tutoring'); setFabExpanded(false); }}>
                        <GraduationCap size={18} />
                        <span>과외/레슨</span>
                    </button>
                    <button className="fab-option" onClick={() => { navigate('/write?category=meetups'); setFabExpanded(false); }}>
                        <Users size={18} />
                        <span>모임</span>
                    </button>
                </div>
                <button
                    className={`fab-write ${fabExpanded ? 'active' : ''}`}
                    onClick={() => setFabExpanded(!fabExpanded)}
                >
                    <Pencil size={24} className={fabExpanded ? 'rotate' : ''} />
                </button>
            </div>

            {fabExpanded && <div className="fab-overlay" onClick={() => setFabExpanded(false)} />}
        </div>
    );
};

export default CategoryMeetups;

