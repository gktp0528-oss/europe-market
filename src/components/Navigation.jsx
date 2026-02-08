import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Bell, User } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>홈</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Search size={24} />
        <span>검색</span>
      </NavLink>
      <NavLink to="/write/select/used" className="nav-item write-nav-item">
        <div className="plus-btn-wrapper">
          <Plus size={28} color="white" strokeWidth={3} />
        </div>
        <span>등록</span>
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageCircle size={24} />
        <span>채팅</span>
      </NavLink>
      <NavLink to="/mypage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>MY</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
