import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { ShoppingBag, Briefcase, GraduationCap, Users, User, MapPin, Clock } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';

const DUMMY_ITEMS = [
  { id: 1, title: '이케아 조명 팔아요', price: '15유로', location: '파리 15구', time: '1분 전', color: '#FFF0F0', country: 'FR' },
  { id: 2, title: '아이폰 13 미니', price: '350유로', location: '베를린 미테', time: '5분 전', color: '#F0F8FF', country: 'DE' },
  { id: 3, title: '빈티지 원피스', price: '25파운드', location: '런던 소호', time: '12분 전', color: '#FFFAF0', country: 'GB' },
  { id: 4, title: '네스프레소 머신', price: '50유로', location: '뮌헨', time: '30분 전', color: '#F5F5F5', country: 'DE' },
  { id: 5, title: '전기밥솥 팝니다', price: '40유로', location: '암스테르담', time: '1시간 전', color: '#E8F5E9', country: 'NL' },
  { id: 6, title: '자전거 급처', price: '80유로', location: '프랑크푸르트', time: '2시간 전', color: '#FFF3E0', country: 'DE' },
];

const Home = () => {
  const navigate = useNavigate();
  const { selectedCountry } = useCountry();

  const filteredItems = DUMMY_ITEMS.filter(item =>
    selectedCountry.code === 'ALL' || item.country === selectedCountry.code
  );

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

      {/* 4. Real-time Posts Section */}
      <section className="realtime-section">
        <div className="section-header">
          <h3 className="section-title">{selectedCountry.name}의 최신 글</h3>
        </div>

        {filteredItems.length > 0 ? (
          <div className="horizontal-scroll">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                title={item.title}
                price={item.price}
                location={item.location}
                time={item.time}
                color={item.color}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>아직 등록된 게시물이 없어요 🥲</p>
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
