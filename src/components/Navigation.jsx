import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = ({ active }) => {
    return (
        <nav className="navigation glass">
            <Link to="/" className={`nav-item ${active === 'home' ? 'active' : ''}`}>
                <div className="icon">🏠</div>
                <span>홈</span>
            </Link>
            <Link to="/chat" className={`nav-item ${active === 'chat' ? 'active' : ''}`}>
                <div className="icon">💬</div>
                <span>채팅</span>
            </Link>
            <Link to="/profile" className={`nav-item ${active === 'profile' ? 'active' : ''}`}>
                <div className="icon">👤</div>
                <span>나의 유로</span>
            </Link>

            <style jsx>{`
        .navigation {
          position: fixed;
          bottom: 0;
          width: 100%;
          max-width: 480px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          border-top: 1px solid #f1f3f5;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #adb5bd;
          transition: all 0.2s;
        }

        .nav-item.active {
          color: #212529;
        }

        .nav-item .icon {
          font-size: 22px;
        }

        .nav-item span {
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
        </nav>
    );
};

export default Navigation;
