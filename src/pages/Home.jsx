import React, { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';

const Home = () => {
    const [activeTab, setActiveTab] = useState('marketplace');

    const items = [
        {
            id: 1,
            title: '미개봉 에어팟 프로 2',
            price: '€180',
            location: '파리 마레지구',
            time: '2분 전',
            image: 'https://images.unsplash.com/photo-1588423770574-91021160dfdf?w=200&h=200&fit=crop'
        },
        {
            id: 2,
            title: '한국식 전기밥솥 (6인용)',
            price: '€50',
            location: '베를린 미테',
            time: '15분 전',
            image: 'https://images.unsplash.com/photo-1584441401311-665126f3068e?w=200&h=200&fit=crop'
        },
        {
            id: 3,
            title: '이케아 윙체어 (상태 최상)',
            price: '€70',
            location: '런던 켄싱턴',
            time: '1시간 전',
            image: 'https://images.unsplash.com/photo-1598300042247-d317bf07ca91?w=200&h=200&fit=crop'
        }
    ];

    return (
        <div className="home-page">
            <Header />

            <main className="page-content">
                <section className="quick-menu">
                    <div className="menu-item active">
                        <div className="icon">🛍️</div>
                        <span>중고매물</span>
                    </div>
                    <div className="menu-item">
                        <div className="icon">💼</div>
                        <span>알바/구인</span>
                    </div>
                    <div className="menu-item">
                        <div className="icon">🎓</div>
                        <span>과외/레슨</span>
                    </div>
                    <div className="menu-item">
                        <div className="icon">🤝</div>
                        <span>모임/소통</span>
                    </div>
                </section>

                <section className="item-feed">
                    <div className="section-title">최근 올라온 매물</div>
                    {items.map(item => (
                        <div key={item.id} className="item-card">
                            <div className="item-image">
                                <img src={item.image} alt={item.title} />
                            </div>
                            <div className="item-info">
                                <h3 className="item-title">{item.title}</h3>
                                <div className="item-meta">{item.location} • {item.time}</div>
                                <div className="item-price">{item.price}</div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            <Navigation active="home" />

            <button className="fab">
                <span>+</span>
            </button>

            <style jsx>{`
        .quick-menu {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 24px 16px;
          gap: 12px;
          background: #fff;
        }

        .menu-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .menu-item .icon {
          width: 54px;
          height: 54px;
          background: #f8f9fa;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.2s;
        }

        .menu-item.active .icon {
          background: #fff4e6;
          border: 1px solid #ffcc33;
        }

        .menu-item span {
          font-size: 13px;
          color: #495057;
          font-weight: 500;
        }

        .item-feed {
          padding: 0 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #212529;
        }

        .item-card {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #f1f3f5;
        }

        .item-image img {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          object-fit: cover;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }

        .item-title {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
        }

        .item-meta {
          font-size: 13px;
          color: #868e96;
        }

        .item-price {
          font-size: 17px;
          font-weight: 700;
          color: #f48525;
          margin-top: 4px;
        }

        .fab {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 56px;
          height: 56px;
          background: #f48525;
          color: white;
          border-radius: 28px;
          box-shadow: 0 4px 12px rgba(244, 133, 37, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          z-index: 100;
        }

        /* Responsive max-width helper for FAB */
        @media (min-width: 480px) {
          .fab {
            right: calc(50% - 220px);
          }
        }
      `}</style>
        </div>
    );
};

export default Home;
