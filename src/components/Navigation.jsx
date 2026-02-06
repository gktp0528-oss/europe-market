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
      <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageCircle size={24} />
        <span>채팅</span>
      </NavLink>
      <NavLink to="/alarm" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={24} />
        <span>알림</span>
      </NavLink>
      <NavLink to="/mypage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>마이</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
