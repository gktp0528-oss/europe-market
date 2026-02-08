import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    User,
    ChevronRight,
    ShoppingBag,
    Briefcase,
    BookOpen,
    Users,
    LogOut,
    Settings,
    Bell
} from 'lucide-react';
import '../styles/MyPage.css';

const MyPage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex-center full-screen">
                <p>로딩 중...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-center full-screen" style={{ flexDirection: 'column', gap: 20 }}>
                <p>로그인이 필요한 서비스입니다. 😊</p>
                <button
                    className="submit-btn-bottom"
                    style={{ width: 'auto', padding: '12px 30px', position: 'static' }}
                    onClick={() => navigate('/login')}
                >
                    로그인하러 가기
                </button>
            </div>
        );
    }

    return (
        <div className="mypage-container">
            {/* Profile Section */}
            <div className="profile-section">
                <div className="profile-avatar">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" />
                    ) : (
                        <User size={40} color="#ccc" />
                    )}
                </div>
                <div className="profile-info">
                    <h2 className="profile-nickname">{profile?.username || '하은님'}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>
            </div>

            {/* Activities Menu */}
            <div className="mypage-menu">
                <div className="menu-item" onClick={() => navigate('/my-posts')}>
                    <div className="menu-icon" style={{ backgroundColor: '#fff0f6' }}>
                        <ShoppingBag size={20} color="#eb2f96" />
                    </div>
                    <span className="menu-label">내가 쓴 글</span>
                    <ChevronRight size={18} color="#ccc" />
                </div>
                {/* 준비 중인 기능들 */}
                <div className="menu-item" style={{ opacity: 0.6 }}>
                    <div className="menu-icon" style={{ backgroundColor: '#e6f7ff' }}>
                        <Bell size={20} color="#1890ff" />
                    </div>
                    <span className="menu-label">알림 설정</span>
                    <span style={{ fontSize: 12, color: '#999', marginRight: 10 }}>준비중</span>
                    <ChevronRight size={18} color="#ccc" />
                </div>
                <div className="menu-item" style={{ opacity: 0.6 }}>
                    <div className="menu-icon" style={{ backgroundColor: '#f9f0ff' }}>
                        <Settings size={20} color="#722ed1" />
                    </div>
                    <span className="menu-label">앱 설정</span>
                    <span style={{ fontSize: 12, color: '#999', marginRight: 10 }}>준비중</span>
                    <ChevronRight size={18} color="#ccc" />
                </div>
            </div>

            {/* Support Menu */}
            <div className="mypage-menu">
                <div className="menu-item">
                    <span className="menu-label">공지사항</span>
                    <ChevronRight size={18} color="#ccc" />
                </div>
                <div className="menu-item">
                    <span className="menu-label">자주 묻는 질문</span>
                    <ChevronRight size={18} color="#ccc" />
                </div>
            </div>

            {/* Logout Section */}
            <div className="logout-section">
                <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
                    <LogOut size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    로그아웃
                </button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">로그아웃 하시겠습니까?</h3>
                        <p className="modal-desc">언제든 다시 오셔서 하은님의 예쁜 물건들을 보여주세요! 💖</p>
                        <div className="modal-buttons">
                            <button className="modal-btn cancel" onClick={() => setShowLogoutModal(false)}>취소</button>
                            <button className="modal-btn confirm" onClick={handleLogout}>로그아웃</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;
