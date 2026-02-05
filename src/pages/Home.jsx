import React from 'react';
import './Home.css';
import { Shirt, Armchair, Smartphone, Package, User, MapPin, Clock } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container">
      {/* 1. Header */}
      <header className="home-header">
        <h1 className="logo-text">유럽 벼룩시장</h1>
        <button className="profile-btn">
          <User size={20} />
        </button>
      </header>

      {/* 2. Intro Section */}
      <section className="intro-section">
        <div className="intro-text">
          <h2>유럽에서의 보물찾기<br />시작해볼까요? 💎</h2>
          <p>나만의 특별한 빈티지 아이템을<br />가장 가까운 곳에서 찾아보세요!</p>
        </div>
        <div className="intro-decoration">
          {/* Simple decoration circle */}
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="category-section">
        <h3 className="section-title">카테고리</h3>
        <div className="category-grid">
          <CategoryCard
            title="의류"
            icon={Shirt}
            color="var(--color-primary-pink)"
            delay="0s"
          />
          <CategoryCard
            title="가구"
            icon={Armchair}
            color="var(--color-mint-green)"
            delay="0.1s"
          />
          <CategoryCard
            title="디지털"
            icon={Smartphone}
            color="var(--color-lemon-yellow)"
            delay="0.2s"
          />
          <CategoryCard
            title="기타"
            icon={Package}
            color="var(--color-lavender)"
            delay="0.3s"
          />
        </div>
      </section>

      {/* 4. Real-time Posts Section */}
      <section className="realtime-section">
        <h3 className="section-title">실시간 올라온 매물 🔥</h3>
        <div className="horizontal-scroll">
          <ItemCard
            title="이케아 조명 팔아요"
            price="15유로"
            location="파리 15구"
            time="1분 전"
            color="#FFF0F0"
          />
          <ItemCard
            title="아이폰 13 미니"
            price="350유로"
            location="베를린"
            time="5분 전"
            color="#F0F8FF"
          />
          <ItemCard
            title="빈티지 원피스"
            price="25유로"
            location="런던 소호"
            time="12분 전"
            color="#FFFAF0"
          />
          <ItemCard
            title="커피머신 급처"
            price="50유로"
            location="뮌헨"
            time="30분 전"
            color="#F5F5F5"
          />
        </div>
      </section>
    </div>
  );
};

// Reusable Category Card Component
const CategoryCard = ({ title, icon: Icon, color, delay }) => {
  return (
    <button
      className="category-card"
      style={{ backgroundColor: color, animationDelay: delay }}
    >
      <div className="card-icon-wrapper">
        <Icon size={32} strokeWidth={2} color="#fff" />
      </div>
      <span className="card-title">{title}</span>
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
