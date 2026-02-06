import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Navigation from './components/Navigation';
import './App.css';

import CategoryClothes from './pages/CategoryClothes';
import CategoryJobs from './pages/CategoryJobs';
import CategoryTutoring from './pages/CategoryTutoring';
import CategoryMeetups from './pages/CategoryMeetups';
import ProductDetail from './pages/ProductDetail';
import JobDetail from './pages/JobDetail';
import TutoringDetail from './pages/TutoringDetail';
import MeetupDetail from './pages/MeetupDetail';
import { CountryProvider } from './contexts/CountryContext';
import WritePost from './pages/WritePost';

// 상세페이지에서 네비게이션 숨기기 위한 래퍼 컴포넌트
const AppContent = () => {
  const location = useLocation();

  // 상세페이지 경로 확인
  const isDetailPage =
    location.pathname.startsWith('/detail/') ||
    location.pathname.startsWith('/job/') ||
    location.pathname.startsWith('/tutoring/') ||
    location.pathname.startsWith('/meetup/') ||
    location.pathname === '/write';

  return (
    <div className="mobile-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/clothes" element={<CategoryClothes />} />
        <Route path="/category/jobs" element={<CategoryJobs />} />
        <Route path="/category/tutoring" element={<CategoryTutoring />} />
        <Route path="/category/meetups" element={<CategoryMeetups />} />
        {/* Detail Pages */}
        <Route path="/detail/:id" element={<ProductDetail />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/tutoring/:id" element={<TutoringDetail />} />
        <Route path="/meetup/:id" element={<MeetupDetail />} />
        {/* Placeholder routes for now */}
        <Route path="/chat" element={<div className="flex-center full-screen">채팅 화면 준비중 💬</div>} />
        <Route path="/alarm" element={<div className="flex-center full-screen">알림 화면 준비중 🔔</div>} />
        <Route path="/mypage" element={<div className="flex-center full-screen">마이페이지 준비중 👤</div>} />
        <Route path="/write" element={<WritePost />} />
      </Routes>

      {/* 상세페이지가 아닐 때만 네비게이션 표시 */}
      {!isDetailPage && <Navigation />}
    </div>
  );
};

function App() {
  return (
    <CountryProvider>
      <Router>
        <AppContent />
      </Router>
    </CountryProvider>
  );
}

export default App;
