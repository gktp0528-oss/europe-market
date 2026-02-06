import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, GraduationCap, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import './CategoryClothes.css';

const CategoryTutoring = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();

    const items = [
        { id: 1, title: '초등 수학 과외', pay: '시급 30유로', location: '파리 16구', time: '15분 전', color: '#E8EAF6', country: 'FR', views: 56, likes: 8 },
        { id: 2, title: '성인 한국어 레슨', pay: '시급 25유로', location: '베를린 샤를로텐부르크', time: '1시간 전', color: '#FFF8E1', country: 'DE', views: 92, likes: 15 },
        { id: 3, title: '피아노 레슨', pay: '시급 35유로', location: '뮌헨', time: '2시간 전', color: '#FCE4EC', country: 'DE', views: 45, likes: 6 },
        { id: 4, title: '영어 회화 과외', pay: '시급 20파운드', location: '런던 켄싱턴', time: '3시간 전', color: '#E0F7FA', country: 'GB', views: 110, likes: 22 },
        { id: 5, title: '중학생 영어 과외', pay: '시급 28유로', location: '프랑크푸르트', time: '4시간 전', color: '#F3E5F5', country: 'DE', views: 78, likes: 12 },
        { id: 6, title: '프랑스어 입문 레슨', pay: '시급 22유로', location: '파리 5구', time: '5시간 전', color: '#E8F5E9', country: 'FR', views: 88, likes: 14 },
        { id: 7, title: '고등 수학 과외', pay: '시급 40유로', location: '암스테르담', time: '6시간 전', color: '#FFF3E0', country: 'NL', views: 34, likes: 4 },
        { id: 8, title: '바이올린 레슨', pay: '시급 45유로', location: '비엔나', time: '1일 전', color: '#ECEFF1', country: 'AT', views: 67, likes: 9 },
        // 헝가리 샘플
        { id: 9, title: '헝가리어 기초 레슨', pay: '시급 8,000포린트', location: '부다페스트 5구', time: '30분 전', color: '#C5CAE9', country: 'HU', views: 25, likes: 3 },
        { id: 10, title: '한국어 회화 과외', pay: '시급 10,000포린트', location: '부다페스트 13구', time: '3시간 전', color: '#FFCCBC', country: 'HU', views: 105, likes: 18 },
        { id: 11, title: '기타 레슨 (초급)', pay: '시급 7,000포린트', location: '부다페스트 11구', time: '6시간 전', color: '#D7CCC8', country: 'HU', views: 50, likes: 7 },
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
                            onClick={() => navigate(`/tutoring/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image" style={{ backgroundColor: item.color }}>
                                <GraduationCap size={40} color="#666" style={{ opacity: 0.3 }} />
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
                        <p>해당 국가의 과외/레슨 글이 없습니다 🥲</p>
                    </div>
                )}
            </div>

            <FloatingActionButton />
        </div>
    );
};

export default CategoryTutoring;

