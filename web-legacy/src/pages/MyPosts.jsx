import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, MessageCircle, Heart, Eye, MapPin, Clock, Briefcase } from 'lucide-react';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import './CategoryClothes.css'; // Reusing common list styles

const MyPosts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const nowTick = useMinuteTicker();

    useEffect(() => {
        if (!user) return;

        const fetchMyPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setPosts(data);
            } catch (err) {
                console.error('Error fetching my posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, [user]);

    if (!user) return null;

    return (
        <div className="category-page">
            <header className="category-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>내가 쓴 글</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="product-grid" style={{ padding: '0 16px' }}>
                {loading ? (
                    <div className="loading-state" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <p>게시글을 불러오고 있어요... 🔄</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-state" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <p>아직 작성한 글이 없어요. 📝</p>
                    </div>
                ) : (
                    posts.map((item) => (
                        <div
                            key={item.id}
                            className="product-card"
                            onClick={() => {
                                // Dynamic routing based on category
                                const route = item.category === 'used' ? '/detail/' :
                                    item.category === 'job' ? '/job/' :
                                        item.category === 'tutoring' ? '/tutoring/' :
                                            item.category === 'meetup' ? '/meetup/' : '/detail/';
                                navigate(`${route}${item.id}`);
                            }}
                        >
                            <div className="product-image">
                                {item.image_urls && item.image_urls.length > 0 ? (
                                    <img src={item.image_urls[0]} alt={item.title} />
                                ) : (
                                    <div className="no-image" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '12px' }}>
                                        <Briefcase size={40} color="#666" style={{ opacity: 0.3 }} />
                                    </div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <div className="product-meta">
                                    <span><MapPin size={12} /> {item.location}</span>
                                    <span><Clock size={12} /> {getPostTimeLabel(item, nowTick)}</span>
                                </div>
                                <div className="product-bottom">
                                    <span className="product-price">{item.price || '가격 협의'}</span>
                                    <div className="product-interactions">
                                        <span className="interaction-item">
                                            <Eye size={12} /> {item.views || 0}
                                        </span>
                                        <span className="interaction-item heart">
                                            <Heart size={12} /> {item.likes || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyPosts;
