import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import { supabase } from '../lib/supabase';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import './CategoryClothes.css';

const ITEMS_PER_PAGE = 10;

const CategoryMeetups = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const nowTick = useMinuteTicker();

    const fetchPosts = useCallback(async (pageNum = 0) => {
        if (pageNum === 0) setLoading(true);
        else setIsMoreLoading(true);

        try {
            let query = supabase
                .from('posts')
                .select('*')
                .eq('category', 'meetup')
                .order('created_at', { ascending: false })
                .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

            if (selectedCountry.code !== 'ALL') {
                query = query.eq('country_code', selectedCountry.code);
            }

            const { data, error } = await query;
            if (error) throw error;

            if (pageNum === 0) {
                setItems(data || []);
            } else {
                setItems(prev => [...prev, ...(data || [])]);
            }

            setHasMore(data && data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Error fetching meetups:', error);
        } finally {
            setLoading(false);
            setIsMoreLoading(false);
        }
    }, [selectedCountry.code]);

    useEffect(() => {
        setPage(0);
        fetchPosts(0);
    }, [fetchPosts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    return (
        <div className="category-page" style={{ paddingTop: 0 }}>
            <div className="product-grid">
                {loading ? (
                    <div className="loading-state" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <p>게시글을 불러오고 있어요... 🔄</p>
                    </div>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="product-card"
                            onClick={() => navigate(`/meetup/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image" style={{ backgroundColor: item.color || '#F5F5F5' }}>
                                <Users size={40} color="#666" style={{ opacity: 0.3 }} />
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{item.title}</h3>
                                <div className="product-meta">
                                    <span><MapPin size={12} /> {item.location}</span>
                                    <span><Clock size={12} /> {getPostTimeLabel(item, nowTick)}</span>
                                </div>
                                <div className="product-bottom">
                                    <p className="product-price">{item.price}</p>
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
                ) : (
                    <div className="empty-state" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <p>해당 국가의 모임이 없습니다 🥲</p>
                    </div>
                )}
            </div>

            {hasMore && (
                <div className="load-more-container" style={{ textAlign: 'center', margin: '20px 0 40px' }}>
                    <button
                        className="load-more-btn"
                        onClick={handleLoadMore}
                        disabled={isMoreLoading}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '25px',
                            border: '1px solid #eee',
                            backgroundColor: 'white',
                            color: '#e91e63',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isMoreLoading ? '로딩 중... 🔄' : '더 보기 ⬇️'}
                    </button>
                </div>
            )}

            <FloatingActionButton />
        </div>
    );
};

export default CategoryMeetups;
