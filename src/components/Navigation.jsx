import React from 'react';
import { Home, MessageCircle, Bell, User, Flag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', icon: Home, label: '홈', path: '/' },
    { id: 'chat', icon: MessageCircle, label: '채팅', path: '/chat' },
    { id: 'alarm', icon: Bell, label: '알람', path: '/alarm' },
    { id: 'mypage', icon: User, label: '마이', path: '/mypage' },
    { id: 'country', icon: Flag, label: '국가', path: '/country' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
