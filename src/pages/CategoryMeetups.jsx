import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import './CategoryClothes.css';

const CategoryMeetups = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();

    const items = [
        { id: 1, title: '주말 등산 모임', date: '2/10 (토)', location: '파리 외곽', time: '5분 전', color: '#C8E6C9', country: 'FR', views: 42, likes: 12 },
        { id: 2, title: '베를린 한인 조기축구', date: '매주 일요일', location: '베를린 마우어파크', time: '30분 전', color: '#BBDEFB', country: 'DE', views: 85, likes: 24 },
        { id: 3, title: '독서 모임 (소설)', date: '2/15 (목)', location: '뮌헨 시내', time: '1시간 전', color: '#F8BBD9', country: 'DE', views: 30, likes: 8 },
        { id: 4, title: '런던 한인 러닝크루', date: '매주 토요일', location: '하이드파크', time: '2시간 전', color: '#B2DFDB', country: 'GB', views: 120, likes: 45 },
        { id: 5, title: '와인 시음 모임', date: '2/20 (화)', location: '파리 마레지구', time: '3시간 전', color: '#D1C4E9', country: 'FR', views: 65, likes: 18 },
        { id: 6, title: '보드게임 모임', date: '매주 금요일', location: '프랑크푸르트', time: '4시간 전', color: '#FFE0B2', country: 'DE', views: 40, likes: 10 },
        { id: 7, title: '암스테르담 자전거 투어', date: '2/12 (일)', location: '중앙역 앞', time: '5시간 전', color: '#B3E5FC', country: 'NL', views: 55, likes: 15 },
        { id: 8, title: '비엔나 오페라 관람', date: '2/25 (일)', location: '국립오페라극장', time: '1일 전', color: '#F5F5F5', country: 'AT', views: 90, likes: 22 },
        // 헝가리 샘플
        { id: 9, title: '부다페스트 온천 투어', date: '2/11 (일)', location: '세체니 온천', time: '10분 전', color: '#80DEEA', country: 'HU', views: 150, likes: 35 },
        { id: 10, title: '헝가리 와인 시음회', date: '2/17 (토)', location: '부다 성 근처', time: '2시간 전', color: '#CE93D8', country: 'HU', views: 70, likes: 20 },
        { id: 11, title: '다뉴브강 야경 산책', date: '매주 금요일', location: '자유의 다리', time: '4시간 전', color: '#90CAF9', country: 'HU', views: 80, likes: 25 },
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
                            onClick={() => navigate(`/meetup/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image" style={{ backgroundColor: item.color }}>
                                <Users size={40} color="#666" style={{ opacity: 0.3 }} />
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <div className="product-meta">
                                    <span><MapPin size={12} /> {item.location}</span>
                                    <span><Clock size={12} /> {item.time}</span>
                                </div>
                                <div className="product-bottom">
                                    <p className="product-price">{item.date}</p>
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
                        <p>해당 국가의 모임이 없습니다 🥲</p>
                    </div>
                )}
            </div>

            <FloatingActionButton />
        </div>
    );
};

export default CategoryMeetups;

