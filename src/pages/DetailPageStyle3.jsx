import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Star, Shield, Truck } from 'lucide-react';
import './DetailPage.css';

/**
 * 스타일 3: 프리미엄 카드 스타일
 * - 그라데이션과 그림자 활용
 * - 뱃지와 태그로 정보 강조
 * - 럭셔리/프리미엄 느낌
 * - 번개장터/마플샵 스타일
 */
const DetailPageStyle3 = () => {
    const navigate = useNavigate();

    const item = {
        id: 1,
        title: '닥터마틴 부츠 250mm',
        price: '55,000포린트',
        originalPrice: '80,000포린트',
        discount: '31%',
        location: '부다페스트 11구',
        time: '3시간 전',
        condition: '거의 새것',
        description: '닥터마틴 1460 클래식 부츠입니다.\n\n✅ 사이즈: 250mm (US 7)\n✅ 색상: 블랙\n✅ 상태: 2회 착용 (실내만)\n✅ 구성품: 박스, 더스트백 포함\n\n정품 인증 가능합니다!',
        tags: ['정품', '거의새것', '직거래가능'],
        seller: {
            name: '헝가리유학생',
            rating: 5.0,
            trades: 47,
            verified: true
        }
    };

    return (
        <div className="detail-page style-3">
            {/* Sticky Header */}
            <header className="detail-header premium">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button className="action-btn"><Share2 size={20} /></button>
                    <button className="action-btn"><Heart size={20} /></button>
                </div>
            </header>

            {/* Hero Image with Gradient */}
            <div className="hero-image" style={{ backgroundColor: '#2F1810' }}>
                <div className="hero-gradient"></div>
                <div className="hero-badge">
                    <Star size={12} fill="#FFD700" color="#FFD700" />
                    인기상품
                </div>
            </div>

            {/* Content Card */}
            <div className="premium-content-card">
                {/* Price Section */}
                <div className="price-section">
                    <div className="price-row">
                        <span className="discount-badge">{item.discount}</span>
                        <span className="current-price">{item.price}</span>
                    </div>
                    <span className="original-price">{item.originalPrice}</span>
                </div>

                <h1 className="product-title">{item.title}</h1>

                {/* Tags */}
                <div className="tag-row">
                    {item.tags.map((tag, idx) => (
                        <span key={idx} className="product-tag">#{tag}</span>
                    ))}
                </div>

                {/* Meta Info */}
                <div className="meta-row">
                    <div className="meta-item">
                        <MapPin size={14} />
                        <span>{item.location}</span>
                    </div>
                    <div className="meta-item">
                        <Clock size={14} />
                        <span>{item.time}</span>
                    </div>
                    <div className="meta-item condition">
                        <span>{item.condition}</span>
                    </div>
                </div>

                {/* Seller Card */}
                <div className="premium-seller-card">
                    <div className="seller-left">
                        <div className="seller-avatar verified">
                            <User size={20} />
                            {item.seller.verified && (
                                <div className="verified-badge">
                                    <Shield size={10} fill="#2196F3" />
                                </div>
                            )}
                        </div>
                        <div className="seller-info">
                            <h4>{item.seller.name}</h4>
                            <div className="seller-stats">
                                <span>⭐ {item.seller.rating}</span>
                                <span>•</span>
                                <span>거래 {item.seller.trades}회</span>
                            </div>
                        </div>
                    </div>
                    <button className="profile-btn">프로필</button>
                </div>

                {/* Features */}
                <div className="features-row">
                    <div className="feature-item">
                        <Shield size={16} />
                        <span>안전결제</span>
                    </div>
                    <div className="feature-item">
                        <Truck size={16} />
                        <span>택배가능</span>
                    </div>
                </div>

                {/* Description */}
                <div className="description-section premium">
                    <h3>상품 설명</h3>
                    <p>{item.description}</p>
                </div>
            </div>

            {/* Premium Bottom Bar */}
            <div className="premium-bottom-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <button className="premium-chat-btn">
                    <MessageCircle size={20} />
                    채팅하기
                </button>
                <button className="buy-btn">
                    바로구매
                </button>
            </div>
        </div>
    );
};

export default DetailPageStyle3;
