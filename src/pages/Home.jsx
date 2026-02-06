import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { ShoppingBag, Briefcase, GraduationCap, Users, User, MapPin, Clock } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';

const POPULAR_ITEMS = [
  { id: 1, title: '이케아 조명 팔아요', price: '15유로', location: '파리 15구', time: '1분 전', color: '#FFF0F0', country: 'FR', views: 156 },
  { id: 2, title: '아이폰 13 미니', price: '350유로', location: '베를린 미테', time: '5분 전', color: '#F0F8FF', country: 'DE', views: 243 },
  { id: 3, title: '빈티지 원피스', price: '25파운드', location: '런던 소호', time: '12분 전', color: '#FFFAF0', country: 'GB', views: 89 },
  { id: 4, title: '네스프레소 머신', price: '50유로', location: '뮌헨', time: '30분 전', color: '#F5F5F5', country: 'DE', views: 167 },
  { id: 5, title: '전기밥솥 팝니다', price: '40유로', location: '암스테르담', time: '1시간 전', color: '#E8F5E9', country: 'NL', views: 92 },
  { id: 6, title: '자전거 급처', price: '80유로', location: '프랑크푸르트', time: '2시간 전', color: '#FFF3E0', country: 'DE', views: 110 },
  { id: 7, title: '캐시미어 코트', price: '300유로', location: '밀라노', time: '3시간 전', color: '#ECEFF1', country: 'IT', views: 78 },
  { id: 8, title: '한국어 가이드 구함', price: '협의', location: '비엔나', time: '4시간 전', color: '#F1F8E9', country: 'AT', views: 56 },
  { id: 9, title: '부다페스트 한인민박', price: '45유로', location: '부다페스트', time: '5시간 전', color: '#E1F5FE', country: 'HU', views: 134 },
  { id: 10, title: '프라하 스냅 촬영', price: '80유로', location: '프라하', time: '6시간 전', color: '#FFF3E0', country: 'CZ', views: 210 },
  { id: 11, title: '한식당 주방 보조', price: '시급 12유로', location: '베를린', time: '7시간 전', color: '#F3E5F5', country: 'DE', views: 145 },
  { id: 12, title: '루이비통 카드지갑', price: '200유로', location: '파리', time: '8시간 전', color: '#FAFAFA', country: 'FR', views: 320 },
];

const Home = () => {
  const navigate = useNavigate();
  const { selectedCountry } = useCountry();

  // Filter by country if not ALL, then sort by views top 10
  const filteredPopular = POPULAR_ITEMS
    .filter(item => selectedCountry.code === 'ALL' || item.country === selectedCountry.code)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <div className="home-container" style={{ paddingTop: '20px' }}>
      <AdBanner />

      {/* 2. Category Grid */}
      <section className="category-section">
        <h3 className="section-title">카테고리</h3>
        <div className="category-grid">
          <CategoryCard
            title="중고거래"
            icon={ShoppingBag}
            delay="0s"
            onClick={() => navigate('/category/clothes')}
          />
          <CategoryCard
            title="알바"
            icon={Briefcase}
            delay="0.1s"
            onClick={() => navigate('/category/jobs')}
          />
          <CategoryCard
            title="과외/레슨"
            icon={GraduationCap}
            delay="0.2s"
            onClick={() => navigate('/category/tutoring')}
          />
          <CategoryCard
            title="모임"
            icon={Users}
            delay="0.3s"
            onClick={() => navigate('/category/meetups')}
          />
        </div>
      </section>

      {/* 4. Popular Posts Section */}
      <section className="realtime-section">
        <div className="section-header">
          <h3 className="section-title">오늘의 인기글 TOP 10 🔥</h3>
        </div>

        {filteredPopular.length > 0 ? (
          <div className="popular-list">
            {filteredPopular.map((item, index) => (
              <PopularItemCard
                key={item.id}
                rank={index + 1}
                title={item.title}
                price={item.price}
                location={item.location}
                time={item.time}
                color={item.color}
                onClick={() => navigate(`/detail/${item.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>아직 인기글이 없어요 🥲</p>
          </div>
        )}
      </section>

      <FloatingActionButton />
    </div>
  );
};

// Reusable Category Card Component
const CategoryCard = ({ title, icon: Icon, delay, onClick }) => {
  return (
    <button
      className="category-card"
      style={{ backgroundColor: 'var(--category-bg)', animationDelay: delay }}
      onClick={onClick}
    >
      <div className="card-icon-wrapper">
        <Icon size={24} strokeWidth={2} color="var(--color-primary-pink)" />
      </div>
      <span className="card-title" style={{ color: 'var(--text-main)', textShadow: 'none' }}>{title}</span>
    </button>
  );
};

// Horizontal Popular Item Card
const PopularItemCard = ({ rank, title, price, location, time, color, onClick }) => {
  return (
    <div className="popular-item-card" onClick={onClick}>
      <div className="popular-card-left">
        <div className="rank-badge-horizontal">{rank}</div>
        <div className="popular-image-placeholder" style={{ backgroundColor: color }}></div>
      </div>
      <div className="popular-info">
        <h4 className="popular-title">{title}</h4>
        <p className="popular-price">{price}</p>
        <div className="popular-meta">
          <span><MapPin size={10} /> {location}</span>
          <span><Clock size={10} /> {time}</span>
        </div>
      </div>
    </div>
  );
};

// Reusable Item Card Component
const ItemCard = ({ title, price, location, time, color }) => {
  return (
    <div className="item-card">
      <div className="item-image-placeholder" style={{ backgroundColor: color }}>
        {/* Placeholder for image */}
      </div>
      <div className="item-info">
        <h4 className="item-title">{title}</h4>
        <p className="item-price">{price}</p>
        <div className="item-meta">
          <span><MapPin size={10} /> {location}</span>
          <span><Clock size={10} /> {time}</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
