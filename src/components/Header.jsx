import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Search, Bell } from 'lucide-react';
import CountryModal from './CountryModal';
import { useCountry } from '../contexts/CountryContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedCountry } = useCountry();

  const isHome = location.pathname === '/';

  const getPageTitle = () => {
    if (location.pathname.includes('/category/clothes')) return '중고거래';
    if (location.pathname.includes('/category/jobs')) return '알바';
    if (location.pathname.includes('/category/tutoring')) return '과외/레슨';
    if (location.pathname.includes('/category/meetups')) return '모임';
    if (location.pathname.includes('/chat')) return '채팅';
    if (location.pathname.includes('/alarm')) return '알림';
    if (location.pathname.includes('/mypage')) return '마이페이지';
    return '';
  };

  const pageTitle = getPageTitle();

  return (
    <>
      <header className="header glass">
        <div className="header-left">
          {!isHome ? (
            <div className="back-group">
              <button className="icon-btn back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={24} />
              </button>
              {pageTitle && <span className="header-title">{pageTitle}</span>}
            </div>
          ) : (
            <h1 className="logo-text">이유살이</h1>
          )}
        </div>

        <button className="country-select-header" onClick={() => setIsModalOpen(true)}>
          <span className="country-flag">{selectedCountry.flag}</span>
          <span className="country-name">{selectedCountry.name}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div className="header-right">
          <button className="icon-btn">
            <Search size={22} />
          </button>
          <button className="icon-btn">
            <User size={22} onClick={() => navigate('/mypage')} />
          </button>
        </div>

        <style jsx>{`
            .header {
              position: sticky;
              top: 0;
              z-index: 1000;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 16px;
              background: rgba(255, 255, 255, 0.85);
              backdrop-filter: blur(12px);
              border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }

            .header-left {
              flex: 1;
              display: flex;
              align-items: center;
            }

            .back-group {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .header-title {
              font-size: 16px;
              font-weight: 700;
              color: #2D3436;
            }

            .logo-text {
              font-family: 'Quicksand', sans-serif;
              font-size: 20px;
              font-weight: 800;
              color: var(--text-main, #2D3436);
              margin: 0;
            }

            .country-select-header {
              display: flex;
              align-items: center;
              gap: 4px;
              background: #F8F9FA;
              padding: 6px 12px;
              border-radius: 20px;
              border: 1px solid rgba(0, 0, 0, 0.03);
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .country-select-header:hover {
              background: #F1F3F5;
              transform: translateY(-1px);
            }

            .country-flag {
              font-size: 16px;
            }

            .country-name {
              font-size: 13px;
              font-weight: 700;
              color: #495057;
            }

            .header-right {
              flex: 1;
              display: flex;
              justify-content: flex-end;
              gap: 8px;
            }

            .icon-btn {
              background: none;
              border: none;
              padding: 8px;
              border-radius: 50%;
              color: #2D3436;
              cursor: pointer;
              transition: background 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .icon-btn:hover {
              background: rgba(0, 0, 0, 0.05);
            }

            .back-btn {
              margin-left: -8px;
            }
          `}</style>
      </header>
      <CountryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;
