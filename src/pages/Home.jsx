import React from 'react';
import './Home.css';
import { Shirt, Armchair, Smartphone, Package, User } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container">
      {/* 1. Header */}
      <header className="home-header">
        <h1 className="logo-text">Europe Market</h1>
        <button className="profile-btn">
          <User size={20} />
        </button>
      </header>

      {/* 2. Intro Section */}
      <section className="intro-section">
        <div className="intro-text">
          <h2>Find your treasure<br />in Europe 💎</h2>
          <p>이곳에서 당신만의 특별한 물건을<br />찾아보세요!</p>
        </div>
        <div className="intro-decoration">
          {/* Simple decoration circle */}
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="category-section">
        <h3 className="section-title">Categories</h3>
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

export default Home;
