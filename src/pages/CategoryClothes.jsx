import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Heart, Eye } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import FloatingActionButton from '../components/FloatingActionButton';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import './CategoryClothes.css';

const CategoryClothes = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (selectedCountry.code !== 'ALL') {
                query = query.eq('country_code', selectedCountry.code);
            }

            const { data, error } = await query;

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [selectedCountry]);

    const filteredItems = items;

    return (
        <div className="category-page" style={{ paddingTop: 0 }}>

            <div className="product-grid">
                {loading ? (
                    <div className="loading-state" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <p>게시글을 불러오고 있어요... 🔄</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="product-card"
                            onClick={() => navigate(`/detail/${item.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div
                                className="product-image"
                                style={{
                                    backgroundColor: item.color || '#F5F5F5',
                                    backgroundImage: item.image_urls && item.image_urls.length > 0 ? `url(${item.image_urls[0]})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            ></div>
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
                        <p>해당 국가의 상품이 없습니다 🥲</p>
                        <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>첫 번째 주인공이 되어보세요!</p>
                    </div>
                )}
            </div>

            <FloatingActionButton />
        </div>
    );
};

export default CategoryClothes;

