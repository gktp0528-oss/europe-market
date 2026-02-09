import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchUserProfile = useCallback(async () => {
        try {
            // 프로필 정보 조회
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // 사용자 게시글 조회
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (postsError) throw postsError;
            setPosts(postsData || []);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handlePostClick = (post) => {
        const categoryRoutes = {
            'used': '/product',
            'job': '/job',
            'tutoring': '/tutoring',
            'meetup': '/meetup'
        };
        const route = categoryRoutes[post.category] || '/product';
        navigate(`${route}/${post.id}`);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!profile) {
        return (
            <div className="error-container">
                <p>프로필을 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)}>돌아가기</button>
            </div>
        );
    }

    return (
        <div className="user-profile-page">
            {/* Header */}
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>프로필</h1>
            </header>

            {/* Profile Info */}
            <div className="profile-info-card">
                <div className="profile-avatar">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} />
                    ) : (
                        <UserIcon size={48} />
                    )}
                </div>
                <h2 className="profile-name">
                    {profile.username || profile.full_name || '익명'}
                </h2>
                <div className="profile-rating">
                    <Star size={16} fill="#ffc107" color="#ffc107" />
                    <span>5.0</span>
                </div>
                {user?.id === userId && (
                    <button className="edit-profile-btn" onClick={() => navigate('/settings')}>
                        프로필 수정
                    </button>
                )}
            </div>

            {/* Posts Section */}
            <div className="profile-posts-section">
                <h3 className="section-title">
                    게시글 ({posts.length})
                </h3>
                {posts.length === 0 ? (
                    <div className="empty-posts">
                        <p>등록된 게시글이 없습니다.</p>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="post-card"
                                onClick={() => handlePostClick(post)}
                            >
                                <div className="post-image">
                                    {post.image_urls && post.image_urls.length > 0 ? (
                                        <img src={post.image_urls[0]} alt={post.title} />
                                    ) : (
                                        <div className="post-placeholder" style={{ backgroundColor: post.color || '#e0e0e0' }}>
                                            <UserIcon size={32} color="#999" />
                                        </div>
                                    )}
                                </div>
                                <div className="post-info">
                                    <h4 className="post-title">{post.title}</h4>
                                    {post.price && (
                                        <p className="post-price">{post.price}</p>
                                    )}
                                    {post.location && (
                                        <div className="post-location">
                                            <MapPin size={12} />
                                            <span>{post.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
