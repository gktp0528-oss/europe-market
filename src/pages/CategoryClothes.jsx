import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import './CategoryClothes.css';

const CategoryClothes = () => {
    const navigate = useNavigate();

    // Mock Data for Clothing
    const items = [
        { id: 1, title: '폴로 랄프로렌 셔츠', price: '30유로', location: '파리 15구', time: '10분 전', color: '#F5F5DC' },
        { id: 2, title: '빈티지 꽃무늬 원피스', price: '25유로', location: '마레지구', time: '30분 전', color: '#FFE4E1' },
        { id: 3, title: '나이키 후드티', price: '20유로', location: '베를린 미테', time: '1시간 전', color: '#E6E6FA' },
        { id: 4, title: 'COS 니트 가디건', price: '45유로', location: '런던 소호', time: '2시간 전', color: '#F0FFFF' },
        { id: 5, title: '자라 트렌치 코트', price: '40유로', location: '프랑크푸르트', time: '3시간 전', color: '#FFFACD' },
        { id: 6, title: '아페쎄 데님 스커트', price: '50유로', location: '파리 11구', time: '5시간 전', color: '#E0FFFF' },
        { id: 7, title: '아디다스 져지', price: '25유로', location: '뮌헨', time: '6시간 전', color: '#FAF0E6' },
        { id: 8, title: '바버 왁스 자켓', price: '120유로', location: '런던 킹스크로스', time: '1일 전', color: '#F0FFF0' },
    ];

    return (
        <div className="category-page">
            <header className="category-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="header-title">의류</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="product-grid">
                {items.map((item) => (
                    <div key={item.id} className="product-card">
                        <div className="product-image" style={{ backgroundColor: item.color }}></div>
                        <div className="product-info">
                            <h3 className="product-title">{item.title}</h3>
                            <p className="product-price">{item.price}</p>
                            <div className="product-meta">
                                <span><MapPin size={12} /> {item.location}</span>
                                <span><Clock size={12} /> {item.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryClothes;
