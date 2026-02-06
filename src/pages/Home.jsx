import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { ShoppingBag, Briefcase, GraduationCap, Users, User, MapPin, Clock, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';
import { supabase } from '../lib/supabase';

const Home = () => {
  const navigate = useNavigate();
  const { selectedCountry } = useCountry();
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularPosts();
  }, []);

  const fetchPopularPosts = async () => {
    try {
      setLoading(true);
      // 집계된 인기글 캐시 테이블에서 데이터 가져오기
      const { data, error } = await supabase
        .from('popular_posts_cache')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;
      setPopularItems(data || []);
    } catch (error) {
      console.error('인기글 로딩 실패:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 국가 필터 적용 (캐시된 데이터 내에서 선택된 국가가 있다면 필터링)
  const filteredPopular = popularItems
    .filter(item => selectedCountry.code === 'ALL' || item.country === selectedCountry.code)
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
                likes={item.likes}
                views={item.views}
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
const PopularItemCard = ({ rank, title, price, location, time, color, likes, views, onClick }) => {
  return (
    <div className="popular-item-card" onClick={onClick}>
      <div className="popular-card-left">
        <div className="rank-badge-horizontal">{rank}</div>
        <div className="popular-image-placeholder" style={{ backgroundColor: color }}></div>
      </div>
      <div className="popular-info">
        <h4 className="popular-title">{title}</h4>
        <div className="popular-meta">
          <span><MapPin size={10} /> {location}</span>
          <span><Clock size={10} /> {time}</span>
        </div>
        <div className="popular-bottom">
          <p className="popular-price">{price}</p>
          <div className="item-interactions">
            <span className="interaction-item">
              <Eye size={12} /> {views}
            </span>
            <span className="interaction-item heart">
              <Heart size={12} /> {likes}
            </span>
          </div>
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
