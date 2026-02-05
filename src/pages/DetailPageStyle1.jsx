import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User } from 'lucide-react';
import './DetailPage.css';

/**
 * 스타일 1: 클래식 카드 스타일
 * - 깔끔하고 전통적인 레이아웃
 * - 큰 이미지 + 아래 정보
 * - 당근마켓/중고나라 스타일
 */
const DetailPageStyle1 = () => {
    const navigate = useNavigate();

    // 샘플 데이터
    const item = {
        id: 1,
        title: '캐시미어 코트 (새상품)',
        price: '120,000포린트',
        location: '부다페스트 5구',
        time: '15분 전',
        views: 42,
        likes: 5,
        description: '작년에 구매한 캐시미어 100% 코트입니다.\n한 번도 입지 않은 새상품이에요.\n사이즈는 M이고, 색상은 베이지입니다.\n\n직거래 선호하며, 5구 근처에서 만나요!',
        seller: {
            name: '유럽언니',
            rating: 4.8,
            trades: 23
        }
    };

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

            {/* Main Image */}
            <div className="detail-image" style={{ backgroundColor: '#E8D5B7' }}>
                <span className="image-placeholder">상품 이미지</span>
            </div>

            {/* Content */}
            <div className="detail-content">
                {/* Seller Info */}
                <div className="seller-card">
                    <div className="seller-avatar">
                        <User size={24} />
                    </div>
                    <div className="seller-info">
                        <h4>{item.seller.name}</h4>
                        <span>⭐ {item.seller.rating} · 거래 {item.seller.trades}회</span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-section">
                    <h1 className="product-title">{item.title}</h1>
                    <p className="product-price">{item.price}</p>
                    <div className="product-meta">
                        <span><MapPin size={14} /> {item.location}</span>
                        <span><Clock size={14} /> {item.time}</span>
                        <span>조회 {item.views}</span>
                    </div>
                </div>

                {/* Description */}
                <div className="description-section">
                    <p>{item.description}</p>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bottom-bar">
                <button className="like-btn">
                    <Heart size={24} />
                </button>
                <div className="price-display">
                    <strong>{item.price}</strong>
                </div>
                <button className="chat-btn">
                    <MessageCircle size={20} />
                    채팅하기
                </button>
            </div>
        </div>
    );
};

export default DetailPageStyle1;
