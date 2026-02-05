import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Clock, MessageCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import './DetailPage.css';

/**
 * 스타일 2: 풀스크린 갤러리 스타일
 * - 이미지가 전체 화면 차지
 * - 스와이프 가능한 갤러리
 * - 정보는 오버레이로 표시
 * - 인스타그램/에어비앤비 스타일
 */
const DetailPageStyle2 = () => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);

    const item = {
        id: 1,
        title: '빈티지 헝가리 자수 블라우스',
        price: '35,000포린트',
        location: '부다페스트 7구',
        time: '1시간 전',
        images: ['#FFDAB9', '#FFE4C4', '#FFF8DC'], // 이미지 대신 색상
        description: '헝가리 전통 자수가 들어간 블라우스입니다.\n빈티지 제품으로 상태 양호합니다.\n\n🏷️ 사이즈: Free\n🎨 색상: 화이트 + 컬러 자수',
        seller: {
            name: '부다페스트마켓',
            rating: 4.9,
            trades: 156
        }
    };

    return (
        <div className="detail-page style-2">
            {/* Full Screen Image Gallery */}
            <div className="fullscreen-gallery">
                <div
                    className="gallery-image"
                    style={{ backgroundColor: item.images[currentImage] }}
                >
                    {/* Navigation Arrows */}
                    {currentImage > 0 && (
                        <button
                            className="gallery-nav prev"
                            onClick={() => setCurrentImage(currentImage - 1)}
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}
                    {currentImage < item.images.length - 1 && (
                        <button
                            className="gallery-nav next"
                            onClick={() => setCurrentImage(currentImage + 1)}
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}

                    {/* Image Counter */}
                    <div className="image-counter">
                        {currentImage + 1} / {item.images.length}
                    </div>
                </div>

                {/* Overlay Header */}
                <header className="overlay-header">
                    <button className="back-btn glass" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="header-actions">
                        <button className="action-btn glass"><Share2 size={20} /></button>
                        <button className="action-btn glass"><Heart size={20} /></button>
                    </div>
                </header>
            </div>

            {/* Content Sheet */}
            <div className="content-sheet">
                <div className="sheet-handle"></div>

                <div className="sheet-content">
                    <h1 className="product-title">{item.title}</h1>
                    <p className="product-price">{item.price}</p>

                    <div className="product-meta">
                        <span><MapPin size={14} /> {item.location}</span>
                        <span><Clock size={14} /> {item.time}</span>
                    </div>

                    <div className="divider"></div>

                    <div className="seller-row">
                        <div className="seller-avatar"><User size={20} /></div>
                        <div className="seller-info">
                            <h4>{item.seller.name}</h4>
                            <span>⭐ {item.seller.rating}</span>
                        </div>
                        <button className="follow-btn">팔로우</button>
                    </div>

                    <div className="divider"></div>

                    <div className="description-section">
                        <p>{item.description}</p>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="floating-chat-btn">
                <MessageCircle size={24} />
                채팅하기
            </button>
        </div>
    );
};

export default DetailPageStyle2;
