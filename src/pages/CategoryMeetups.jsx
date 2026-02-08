import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import { supabase } from '../lib/supabase';
import './CategoryClothes.css';

const CategoryMeetups = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('posts')
                .select('*')
                .eq('category', 'meetup')
                .order('created_at', { ascending: false });

            if (selectedCountry.code !== 'ALL') {
                query = query.eq('country_code', selectedCountry.code);
            }

            const { data, error } = await query;
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching meetups:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCountry.code]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

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
                                    <span><Clock size={12} /> {item.time_ago || '방금 전'}</span>
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
            <FloatingActionButton />
        </div>
    );
};

export default CategoryMeetups;

