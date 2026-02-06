import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import './CategoryClothes.css';

const CategoryJobs = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();

    const items = [
        { id: 1, title: '한식당 홀서빙 알바', pay: '시급 12유로', location: '파리 1구', time: '10분 전', color: '#E3F2FD', country: 'FR', views: 85, likes: 12 },
        { id: 2, title: '이삿짐 운반 도움', pay: '건당 50유로', location: '베를린 미테', time: '30분 전', color: '#FFF8E1', country: 'DE', views: 42, likes: 5 },
        { id: 3, title: '주말 베이비시터', pay: '시급 15유로', location: '뮌헨', time: '1시간 전', color: '#FCE4EC', country: 'DE', views: 128, likes: 25 },
        { id: 4, title: '한인마트 계산원', pay: '시급 11유로', location: '프랑크푸르트', time: '2시간 전', color: '#E8F5E9', country: 'DE', views: 65, likes: 8 },
        { id: 5, title: '통역 도우미 (영한)', pay: '시급 25파운드', location: '런던 소호', time: '3시간 전', color: '#F3E5F5', country: 'GB', views: 150, likes: 30 },
        { id: 6, title: '카페 바리스타', pay: '시급 10유로', location: '암스테르담', time: '4시간 전', color: '#E0F7FA', country: 'NL', views: 90, likes: 15 },
        { id: 7, title: '한국어 가이드', pay: '일당 100유로', location: '파리 7구', time: '5시간 전', color: '#FFF3E0', country: 'FR', views: 200, likes: 45 },
        { id: 8, title: '입주 청소 도우미', pay: '시급 14유로', location: '비엔나', time: '6시간 전', color: '#FAFAFA', country: 'AT', views: 30, likes: 2 },
        // 헝가리 샘플
        { id: 9, title: '부다페스트 한식당 주방보조', pay: '시급 2,500포린트', location: '부다페스트 6구', time: '20분 전', color: '#FFECB3', country: 'HU', views: 45, likes: 8 },
        { id: 10, title: '온천 리조트 통역 알바', pay: '일당 40,000포린트', location: '부다페스트 14구', time: '2시간 전', color: '#B2EBF2', country: 'HU', views: 120, likes: 23 },
        { id: 11, title: '한인 게스트하우스 청소', pay: '시급 2,200포린트', location: '부다페스트 7구', time: '5시간 전', color: '#DCEDC8', country: 'HU', views: 32, likes: 4 },
    ];

    const filteredItems = items.filter(item =>
        selectedCountry.code === 'ALL' || item.country === selectedCountry.code
    );

    return (
        <div className="category-page" style={{ paddingTop: 0 }}>

            <div className="product-grid">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="product-card"
                            onClick={() => navigate(`/job/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image" style={{ backgroundColor: item.color }}>
                                <Briefcase size={40} color="#666" style={{ opacity: 0.3 }} />
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <div className="product-meta">
                                    <span><MapPin size={12} /> {item.location}</span>
                                    <span><Clock size={12} /> {item.time}</span>
                                </div>
                                <div className="product-bottom">
                                    <p className="product-price">{item.pay}</p>
                                    <div className="product-interactions" style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#8E8E93' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Eye size={12} /> {item.views}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FF7675' }}>
                                            <Heart size={12} /> {item.likes}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state" style={{ margin: '20px auto' }}>
                        <p>해당 국가의 알바 공고가 없습니다 🥲</p>
                    </div>
                )}
            </div>

            <FloatingActionButton />
        </div>
    );
};

export default CategoryJobs;

