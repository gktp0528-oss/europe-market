import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import './App.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const CategoryClothes = lazy(() => import('./pages/CategoryClothes'));
const CategoryJobs = lazy(() => import('./pages/CategoryJobs'));
const CategoryTutoring = lazy(() => import('./pages/CategoryTutoring'));
const CategoryMeetups = lazy(() => import('./pages/CategoryMeetups'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const TutoringDetail = lazy(() => import('./pages/TutoringDetail'));
const MeetupDetail = lazy(() => import('./pages/MeetupDetail'));
const WriteUsed = lazy(() => import('./pages/WriteUsed'));
const WriteJob = lazy(() => import('./pages/WriteJob'));
const WriteTutoring = lazy(() => import('./pages/WriteTutoring'));
const WriteMeetup = lazy(() => import('./pages/WriteMeetup'));
const SelectCountry = lazy(() => import('./pages/SelectCountry'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ChatList = lazy(() => import('./pages/ChatList'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));
const MyPage = lazy(() => import('./pages/MyPage'));
const MyPosts = lazy(() => import('./pages/MyPosts'));
const Search = lazy(() => import('./pages/Search'));

import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import { CountryProvider } from './contexts/CountryContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex-center full-screen" style={{ flexDirection: 'column', gap: '12px' }}>
    <div className="loading-spinner" />
    <p style={{ color: '#666', fontSize: '14px' }}>잠시만 기다려주세요...</p>
  </div>
);

// 상세페이지에서 네비게이션 숨기기 위한 래퍼 컴포넌트
const AppContent = () => {
  const location = useLocation();

  // 하단 네비게이션을 숨길 페이지 (상세페이지, 글쓰기 등)
  const hideNavigation =
    location.pathname.startsWith('/detail/') ||
    location.pathname.startsWith('/job/') ||
    location.pathname.startsWith('/tutoring/') ||
    location.pathname.startsWith('/meetup/') ||
    location.pathname.startsWith('/write/') ||
    location.pathname === '/login' ||
    location.pathname === '/signup';

  // 전역 헤더를 숨길 페이지 (상세페이지, 글쓰기, 채팅, 검색 등 - 고유 헤더 사용)
  const hideHeader =
    hideNavigation ||
    location.pathname.startsWith('/chat') ||
    location.pathname === '/search' ||
    location.pathname === '/login' ||
    location.pathname === '/signup';

  return (
    <div className="mobile-container" style={{ paddingBottom: hideNavigation ? 0 : '90px' }}>
      {!hideHeader && <Header />}
      <Suspense fallback={<PageLoader />}>
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
          {/* Write Selection & Forms (Protected) */}
          <Route path="/write/select/:type" element={<ProtectedRoute><SelectCountry /></ProtectedRoute>} />
          <Route path="/write/used" element={<ProtectedRoute><WriteUsed /></ProtectedRoute>} />
          <Route path="/write/job" element={<ProtectedRoute><WriteJob /></ProtectedRoute>} />
          <Route path="/write/tutoring" element={<ProtectedRoute><WriteTutoring /></ProtectedRoute>} />
          <Route path="/write/meetup" element={<ProtectedRoute><WriteMeetup /></ProtectedRoute>} />

          {/* Chat Routes (Protected) */}
          <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />

          <Route path="/alarm" element={<div className="flex-center full-screen">알림 화면 준비중 🔔</div>} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Suspense>
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
// trigger
