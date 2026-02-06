import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, Eye, Star } from 'lucide-react';
import './DetailPage.css';

// 중고거래 상세 페이지 (Style 1 - Classic Card)
const ProductDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock Data - 나중에 실제 데이터로 교체
    const allItems = [
        { id: 1, title: '폴로 랄프로렌 셔츠', price: '30유로', location: '파리 15구', time: '10분 전', tradeTime: '평일 19시 이후', color: '#F5F5DC', views: 28, likes: 3, description: '폴로 랄프로렌 남성 셔츠입니다.\n사이즈: M\n상태: 거의 새것\n\n직거래 선호합니다.', seller: { name: '파리지앵', rating: 4.7, trades: 15 } },
        { id: 2, title: '빈티지 꽃무늬 원피스', price: '25유로', location: '마레지구', time: '30분 전', tradeTime: '주말 오후 2시~6시', color: '#FFE4E1', views: 45, likes: 8, description: '빈티지 꽃무늬 원피스에요.\n사이즈: S-M\n\n마레지구에서 직거래 가능합니다!', seller: { name: '프랑스언니', rating: 4.9, trades: 42 } },
        { id: 3, title: '나이키 후드티', price: '20유로', location: '베를린 미테', time: '1시간 전', tradeTime: '시간 협의', color: '#E6E6FA', views: 33, likes: 5, description: '나이키 기모 후드티입니다.\n사이즈: L\n색상: 그레이\n\n미테역 근처 직거래!', seller: { name: '베를린사는사람', rating: 4.5, trades: 8 } },
        { id: 11, title: '캐시미어 코트 (새상품)', price: '120,000포린트', location: '부다페스트 5구', time: '15분 전', tradeTime: '평일 점심시간 가능', color: '#E8D5B7', views: 42, likes: 5, description: '작년에 구매한 캐시미어 100% 코트입니다.\n한 번도 입지 않은 새상품이에요.\n사이즈는 M이고, 색상은 베이지입니다.\n\n직거래 선호하며, 5구 근처에서 만나요!', seller: { name: '유럽언니', rating: 4.8, trades: 23 } },
        { id: 12, title: '빈티지 헝가리 자수 블라우스', price: '35,000포린트', location: '부다페스트 7구', time: '1시간 전', tradeTime: '주말 언제나', color: '#FFDAB9', views: 67, likes: 12, description: '헝가리 전통 자수가 들어간 블라우스입니다.\n빈티지 제품으로 상태 양호합니다.\n\n🏷️ 사이즈: Free\n🎨 색상: 화이트 + 컬러 자수', seller: { name: '부다페스트마켓', rating: 4.9, trades: 156 } },
        { id: 13, title: '닥터마틴 부츠 250mm', price: '55,000포린트', location: '부다페스트 11구', time: '3시간 전', tradeTime: '퇴근 후 (18시 이후)', color: '#2F1810', views: 89, likes: 15, description: '닥터마틴 1460 클래식 부츠입니다.\n\n✅ 사이즈: 250mm (US 7)\n✅ 색상: 블랙\n✅ 상태: 2회 착용 (실내만)\n✅ 구성품: 박스, 더스트백 포함\n\n정품 인증 가능합니다!', seller: { name: '헝가리유학생', rating: 5.0, trades: 47 } },
    ];

    const item = allItems.find(i => i.id === parseInt(id)) || allItems[0];

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
            <div className="detail-image" style={{ backgroundColor: item.color }}>
                <span className="image-placeholder">상품 이미지</span>
            </div>

            {/* Content */}
            <div className="detail-content">


                {/* Product Info */}
                <div className="product-section">
                    <h1 className="product-title">{item.title}</h1>
                    <p className="product-price">{item.price}</p>
                    <div className="product-meta">
                        <span><Clock size={14} /> {item.time}</span>
                        <span><Eye size={14} /> {item.views}</span>
                        <span><Heart size={14} /> {item.likes}</span>
                    </div>
                </div>

                {/* Quick Info Cards (Location & Trade Time) */}
                <div className="job-info-cards" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <div className="info-card">
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
                            <span className="value">{item.tradeTime}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="description-section">
                    <p>{item.description}</p>
                </div>

                {/* Seller Info - Moved to Bottom */}
                <div className="unified-seller-card" style={{ marginTop: '24px', marginBottom: '40px' }}>
                    <div className="unified-seller-left">
                        <div className="unified-avatar">
                            <User size={28} />
                        </div>
                        <div className="unified-info">
                            <h4>{item.seller.name}</h4>
                            <div className="rating-badge">
                                <Star size={14} />
                                <span>{item.seller.rating}</span>
                            </div>
                        </div>
                    </div>
                    <button className="unified-profile-btn">프로필</button>
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

export default ProductDetail;
