import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { ShoppingBag, Briefcase, GraduationCap, Users, User, MapPin, Clock, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';

import { supabase } from '../lib/supabase';
import { updateTop10Snapshot } from '../lib/aggregation';

const Home = () => {
  const navigate = useNavigate();

  const { selectedCountry } = useCountry(); // Context 변수명 일치 (selectedCountry)
  const [viewMode, setViewMode] = useState('grid');
  const [popularItems, setPopularItems] = useState([]); // 인기글 상태 추가
  const [loading, setLoading] = useState(true);

  // 날짜 포맷 (YYYY-MM-DD)
  const getFormatDate = (date) => date.toISOString().split('T')[0];

  // TOP 10 데이터 가져오기 (Swap Logic 포함)
  const fetchTop10 = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStr = getFormatDate(today);
      const yesterdayStr = getFormatDate(yesterday);
      const targetCountry = selectedCountry?.code || 'ALL'; // 국가 필터

      // 1. 오늘 날짜 데이터 조회
      let { data: todayData, error: todayError } = await supabase
        .from('popular_snapshots')
        .select('top_items')
        .eq('snapshot_date', todayStr)
        .eq('country_code', targetCountry)
        .single();

      if (todayData && todayData.top_items && todayData.top_items.length > 0) {
        setPopularItems(todayData.top_items);
        console.log(`[Home] Loaded TODAY's TOP 10 for ${targetCountry}`);
      } else {
        // 2. 오늘 데이터 없으면 어제 데이터 조회 (Swap)
        console.log(`[Home] No data for today (${todayStr}), checking yesterday...`);
        let { data: yesterdayData } = await supabase
          .from('popular_snapshots')
          .select('top_items')
          .eq('snapshot_date', yesterdayStr)
          .eq('country_code', targetCountry)
          .single();

        if (yesterdayData && yesterdayData.top_items) {
          setPopularItems(yesterdayData.top_items);
          console.log(`[Home] Swapped to YESTERDAY's TOP 10 for ${targetCountry}`);
        } else {
          setPopularItems([]); // 데이터 없음
        }
      }
    } catch (error) {
      console.error('[Home] Error fetching TOP 10:', error);
    } finally {
      setLoading(false);
    }
  };

  // 국가 변경 시 다시 로드
  useEffect(() => {
    fetchTop10();
  }, [selectedCountry]);


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

        {popularItems.length > 0 ? (
          <div className="popular-list">
            {popularItems.map((item, index) => (
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
                category={item.category}
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
const PopularItemCard = ({ rank, title, price, location, time, color, likes, views, category, onClick }) => {
  const showPrice = category !== 'job' && category !== 'tutoring';

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
          {showPrice && <p className="popular-price">{price}</p>}
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
