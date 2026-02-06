import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, GraduationCap, Pencil, ShoppingBag, Briefcase, Users } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import './CategoryClothes.css';

const CategoryTutoring = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();
    const [fabExpanded, setFabExpanded] = useState(false);

    const items = [
        { id: 1, title: '초등 수학 과외', pay: '시급 30유로', location: '파리 16구', time: '15분 전', color: '#E8EAF6', country: 'FR' },
        { id: 2, title: '성인 한국어 레슨', pay: '시급 25유로', location: '베를린 샤를로텐부르크', time: '1시간 전', color: '#FFF8E1', country: 'DE' },
        { id: 3, title: '피아노 레슨', pay: '시급 35유로', location: '뮌헨', time: '2시간 전', color: '#FCE4EC', country: 'DE' },
        { id: 4, title: '영어 회화 과외', pay: '시급 20파운드', location: '런던 켄싱턴', time: '3시간 전', color: '#E0F7FA', country: 'GB' },
        { id: 5, title: '중학생 영어 과외', pay: '시급 28유로', location: '프랑크푸르트', time: '4시간 전', color: '#F3E5F5', country: 'DE' },
        { id: 6, title: '프랑스어 입문 레슨', pay: '시급 22유로', location: '파리 5구', time: '5시간 전', color: '#E8F5E9', country: 'FR' },
        { id: 7, title: '고등 수학 과외', pay: '시급 40유로', location: '암스테르담', time: '6시간 전', color: '#FFF3E0', country: 'NL' },
        { id: 8, title: '바이올린 레슨', pay: '시급 45유로', location: '비엔나', time: '1일 전', color: '#ECEFF1', country: 'AT' },
        // 헝가리 샘플
        { id: 9, title: '헝가리어 기초 레슨', pay: '시급 8,000포린트', location: '부다페스트 5구', time: '30분 전', color: '#C5CAE9', country: 'HU' },
        { id: 10, title: '한국어 회화 과외', pay: '시급 10,000포린트', location: '부다페스트 13구', time: '3시간 전', color: '#FFCCBC', country: 'HU' },
        { id: 11, title: '기타 레슨 (초급)', pay: '시급 7,000포린트', location: '부다페스트 11구', time: '6시간 전', color: '#D7CCC8', country: 'HU' },
    ];

    const filteredItems = items.filter(item => item.country === selectedCountry.code);

    return (
        <div className="category-page">
            <header className="category-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="header-title">과외/레슨 ({selectedCountry.name})</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="product-grid">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="product-card"
                            onClick={() => navigate(`/tutoring/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image" style={{ backgroundColor: item.color }}>
                                <GraduationCap size={40} color="#666" style={{ opacity: 0.3 }} />
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <p className="product-price">{item.pay}</p>
                                <div className="product-meta">
                                    <span><MapPin size={12} /> {item.location}</span>
                                    <span><Clock size={12} /> {item.time}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state" style={{ margin: '20px auto' }}>
                        <p>해당 국가의 과외/레슨 글이 없습니다 🥲</p>
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

export default CategoryTutoring;

