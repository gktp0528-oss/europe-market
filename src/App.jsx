import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navigation from './components/Navigation';
import './App.css';

import CategoryClothes from './pages/CategoryClothes';

import CategoryClothes from './pages/CategoryClothes';

function App() {
  return (
    <Router>
      <div className="mobile-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/clothes" element={<CategoryClothes />} />
          <Route path="/category/clothes" element={<CategoryClothes />} />
          {/* Placeholder routes for now */}
          <Route path="/chat" element={<div className="flex-center full-screen">채팅 화면 준비중 💬</div>} />
          <Route path="/alarm" element={<div className="flex-center full-screen">알림 화면 준비중 🔔</div>} />
          <Route path="/mypage" element={<div className="flex-center full-screen">마이페이지 준비중 👤</div>} />
          <Route path="/country" element={<div className="flex-center full-screen">국가 선택 화면 준비중 🇫🇷</div>} />
        </Routes>

        {/* Global Navigation Bar */}
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
