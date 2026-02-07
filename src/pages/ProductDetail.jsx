import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Eye, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DetailPage.css';

// 중고거래 상세 페이지 (Style 1 - Classic Card)
const ProductDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setItem(data);

            // Increment views
            await supabase
                .from('posts')
                .update({ views: (data.views || 0) + 1 })
                .eq('id', id);

        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const width = e.target.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setCurrentImage(index);
    };

    const modalSliderRef = useRef(null);

    useEffect(() => {
        if (isModalOpen && modalSliderRef.current) {
            modalSliderRef.current.scrollLeft = currentImage * modalSliderRef.current.offsetWidth;
        }
    }, [isModalOpen]);

    if (loading) return <div className="flex-center full-screen">로딩 중... 🔄</div>;
    if (!item) return <div className="flex-center full-screen">게시글을 찾을 수 없습니다 🥲</div>;

    const images = item.image_urls && item.image_urls.length > 0
        ? item.image_urls
        : ['/images/placeholder.png']; // Fallback image

    return (
        <div className="detail-page style-1">
            {/* Header */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn"><Share2 size={20} /></button>
                    <button className="action-btn"><Heart size={20} /></button>
                </div>
            </header>

            {/* Image Slider */}
            <div className="image-wrapper">
                <div className="slider-container" onScroll={handleScroll}>
                    {images.map((src, index) => (
                        <div key={index} className="slider-item" onClick={() => setIsModalOpen(true)}>
                            <img src={src} alt={`Product ${index + 1}`} />
                        </div>
                    ))}
                </div>
                <div className="slider-dots">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${currentImage === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {isModalOpen && (
                <div className="image-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            &times;
                        </button>
                        <div className="modal-slider-container" ref={modalSliderRef} onScroll={handleScroll}>
                            {images.map((src, index) => (
                                <div key={index} className="modal-slider-item">
                                    <img src={src} alt="Zoomed Product" />
                                </div>
                            ))}
                        </div>
                        <div className="modal-slider-dots">
                            {images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`modal-dot ${currentImage === index ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="detail-content">


                {/* Product Info */}
                <div className="product-section">
                    <h1 className="product-title">{item.title}</h1>
                    <div className="product-meta">
                        <span><Clock size={14} /> {item.time}</span>
                        <span><Eye size={14} /> {item.views}</span>
                        <span><Heart size={14} /> {item.likes}</span>
                    </div>
                    <p className="product-price" style={{ color: '#333', fontSize: '22px', fontWeight: '800', margin: 0 }}>{item.price}</p>
                </div>

                {/* Quick Info Cards (Location & Trade Time) */}
                <div className="job-info-cards">
                    <div
                        className="info-card clickable"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`, '_blank')}
                    >
                        <MapPin size={18} />
                        <div>
                            <span className="label">거래 희망 장소</span>
                            <span className="value">{item.location}</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <Clock size={18} />
                        <div>
                            <span className="label">희망 거래 시간</span>
                            <span className="value">{item.trade_time || '시간 협의'}</span>
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="unified-seller-card">
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            <User size={28} />
                        </div>
                        <div className="unified-info">
                            <h4>{item.seller?.name || '익명'}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>{item.seller?.rating || '5.0'}</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
                </div>

                {/* Description - Last */}
                <div className="description-section">
                    <h3>제품 내용</h3>
                    <p>{item.description}</p>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bottom-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <button className="chat-btn">
                    <MessageCircle size={20} />
                    채팅하기
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
