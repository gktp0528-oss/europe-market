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
import WriteUsed from './pages/WriteUsed';
import WriteJob from './pages/WriteJob';
import WriteTutoring from './pages/WriteTutoring';
import WriteMeetup from './pages/WriteMeetup';
import SelectCountry from './pages/SelectCountry';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import MyPage from './pages/MyPage';
import MyPosts from './pages/MyPosts';
import Search from './pages/Search';

// 상세페이지에서 네비게이션 숨기기 위한 래퍼 컴포넌트
const AppContent = () => {
  const location = useLocation();

  // 하단 네비게이션을 숨길 페이지 (상세페이지, 글쓰기 등)
  const hideNavigation =
    location.pathname.startsWith('/detail/') ||
    location.pathname.startsWith('/job/') ||
    location.pathname.startsWith('/tutoring/') ||
    location.pathname.startsWith('/meetup/') ||
    location.pathname.startsWith('/write/');

  // 전역 헤더를 숨길 페이지 (상세페이지, 글쓰기, 채팅, 검색 등 - 고유 헤더 사용)
  const hideHeader =
    hideNavigation ||
    location.pathname.startsWith('/chat') ||
    location.pathname === '/search';

  return (
    <div className="mobile-container" style={{ paddingBottom: hideNavigation ? 0 : '90px' }}>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/clothes" element={<CategoryClothes />} />
        <Route path="/category/jobs" element={<CategoryJobs />} />
        <Route path="/category/tutoring" element={<CategoryTutoring />} />
        <Route path="/category/meetups" element={<CategoryMeetups />} />
        {/* Detail Pages */}
        <Route path="/detail/:id" element={<ProductDetail />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/tutoring/:id" element={<TutoringDetail />} />
        <Route path="/meetup/:id" element={<MeetupDetail />} />
        {/* Write Selection & Forms */}
        <Route path="/write/select/:type" element={<SelectCountry />} />
        <Route path="/write/used" element={<WriteUsed />} />
        <Route path="/write/job" element={<WriteJob />} />
        <Route path="/write/tutoring" element={<WriteTutoring />} />
        <Route path="/write/meetup" element={<WriteMeetup />} />

        {/* Chat Routes */}
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route path="/my-posts" element={<MyPosts />} />

        <Route path="/alarm" element={<div className="flex-center full-screen">알림 화면 준비중 🔔</div>} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      {/* 상세페이지가 아닐 때만 네비게이션 표시 */}
      {!hideNavigation && <Navigation />}
    </div>
  );
};

function App() {
  return (
    <CountryProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </CountryProvider>
  );
}

export default App;
