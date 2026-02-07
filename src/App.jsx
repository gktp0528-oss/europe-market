import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
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
import WriteUsed from './pages/WriteUsed';
import WriteJob from './pages/WriteJob';
import WriteTutoring from './pages/WriteTutoring';
import WriteMeetup from './pages/WriteMeetup';
import SelectCountry from './pages/SelectCountry';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import { CountryProvider } from './contexts/CountryContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

// 상세페이지에서 네비게이션 숨기기 위한 래퍼 컴포넌트
const AppContent = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const direction = navType === 'POP' ? 'back' : 'forward';

  // 상세페이지 경로 확인
  const isDetailPage =
    location.pathname.startsWith('/detail/') ||
    location.pathname.startsWith('/job/') ||
    location.pathname.startsWith('/tutoring/') ||
    location.pathname.startsWith('/meetup/') ||
    location.pathname.startsWith('/write/');

  return (
    <div className="mobile-container">
      {!isDetailPage && <Header />}

      <AnimatePresence mode="popLayout" custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/category/clothes" element={<PageTransition><CategoryClothes /></PageTransition>} />
          <Route path="/category/jobs" element={<PageTransition><CategoryJobs /></PageTransition>} />
          <Route path="/category/tutoring" element={<PageTransition><CategoryTutoring /></PageTransition>} />
          <Route path="/category/meetups" element={<PageTransition><CategoryMeetups /></PageTransition>} />

          {/* Detail Pages */}
          <Route path="/detail/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/job/:id" element={<PageTransition><JobDetail /></PageTransition>} />
          <Route path="/tutoring/:id" element={<PageTransition><TutoringDetail /></PageTransition>} />
          <Route path="/meetup/:id" element={<PageTransition><MeetupDetail /></PageTransition>} />

          {/* Write Selection & Forms */}
          <Route path="/write/select/:type" element={<PageTransition><SelectCountry /></PageTransition>} />
          <Route path="/write/used" element={<PageTransition><WriteUsed /></PageTransition>} />
          <Route path="/write/job" element={<PageTransition><WriteJob /></PageTransition>} />
          <Route path="/write/tutoring" element={<PageTransition><WriteTutoring /></PageTransition>} />
          <Route path="/write/meetup" element={<PageTransition><WriteMeetup /></PageTransition>} />

          {/* Placeholder routes for now */}
          <Route path="/chat" element={<PageTransition><div className="flex-center full-screen">채팅 화면 준비중 💬</div></PageTransition>} />
          <Route path="/alarm" element={<PageTransition><div className="flex-center full-screen">알림 화면 준비중 🔔</div></PageTransition>} />
          <Route path="/mypage" element={<PageTransition><div className="flex-center full-screen">마이페이지 준비중 👤</div></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {/* 상세페이지가 아닐 때만 네비게이션 표시 */}
      {!isDetailPage && <Navigation />}
    </div>
  );
};

function App() {
  return (
    <CountryProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </CountryProvider>
  );
}

export default App;
