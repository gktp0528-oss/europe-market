import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Search, User, Plus } from 'lucide-react';
import { useChatUnread } from '../contexts/ChatUnreadContext';
import './Navigation.css';

const Navigation = () => {
  const { totalUnread } = useChatUnread();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={26} />
        <span>홈</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Search size={26} />
        <span>검색</span>
      </NavLink>
      <NavLink to="/write/select/used" className="nav-item">
        <Plus size={26} />
        <span>등록</span>
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <MessageCircle size={26} />
          {totalUnread > 0 && (
            <span className="nav-badge">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>
        <span>채팅</span>
      </NavLink>
      <NavLink to="/mypage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={26} />
        <span>MY</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
