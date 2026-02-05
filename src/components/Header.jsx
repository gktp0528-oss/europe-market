import React from 'react';

const Header = () => {
    return (
        <header className="header glass">
            <div className="location">
                <span>파리, 프랑스</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            <div className="actions">
                <button className="icon-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                <button className="icon-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>
            </div>

            <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid #f1f3f5;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }

        .brand {
          font-size: 20px;
          font-weight: 800;
          color: #f48525;
          letter-spacing: -0.5px;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
          background: #f8f9fa;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .icon-btn {
          color: #495057;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
      `}</style>
        </header>
    );
};

export default Header;
