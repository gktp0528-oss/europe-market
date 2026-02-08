import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Search, Bell } from 'lucide-react';
import CountryModal from './CountryModal';
import { useCountry } from '../contexts/CountryContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedCountry } = useCountry();
  const { user, signOut } = useAuth();

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
            <button className="country-select-logo" onClick={() => setIsModalOpen(true)}>
              {selectedCountry.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', marginTop: '2px' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          )}
        </div>

        {!isHome && (
          <button className="country-select-header-minimal" onClick={() => setIsModalOpen(true)}>
            <span className="country-name-small">{selectedCountry.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}

        <div className="header-right">
          <button className="icon-btn" onClick={() => navigate('/search')}>
            <Search size={22} />
          </button>
          {user ? (
            <button className="icon-btn" onClick={() => navigate('/alarm')}>
              <div style={{ position: 'relative' }}>
                <Bell size={22} color="#E91E63" />
                <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4CAF50', border: '1px solid white' }}></span>
              </div>
            </button>
          ) : (
            <button className="login-btn-header" onClick={() => navigate('/login')}>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>로그인</span>
            </button>
          )}
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

            .country-select-logo {
              font-family: 'Quicksand', sans-serif;
              font-size: 20px;
              font-weight: 800;
              color: var(--text-main, #2D3436);
              background: none;
              border: none;
              padding: 0;
              cursor: pointer;
              display: flex;
              align-items: center;
              letter-spacing: -0.5px;
            }

            .country-select-header-minimal {
              display: flex;
              align-items: center;
              gap: 4px;
              background: none;
              border: none;
              padding: 4px 8px;
              cursor: pointer;
              color: #495057;
            }

            .country-name-small {
              font-size: 13px;
              font-weight: 700;
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

            .login-btn-header {
                background: #E91E63;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 20px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .login-btn-header:hover {
                background: #D81B60;
            }
          `}</style>
      </header>
      <CountryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;
