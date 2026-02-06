import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './AdBanner.css';

const ADS = [
    { id: 1, text: '유럽 전역 택배 대행 서비스 오픈! 📦', bgColor: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)' },
    { id: 2, text: '한인 민박 할인 코드: KOREA2024 🏠', bgColor: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)' },
    { id: 3, text: '파리 맛집 투어 선착순 모집 중 🍷', bgColor: 'linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)' },
    { id: 4, text: '베를린 벼룩시장 이번 주말 개최! 🥨', bgColor: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' },
    { id: 5, text: '독일어/프랑스어 과외 매칭 서비스 🎓', bgColor: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)' },
];

const AdBanner = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === ADS.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? ADS.length - 1 : prev - 1));
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 1500); // 1.5s automatic slide
        return () => clearInterval(interval);
    }, [nextSlide, currentIndex]); // currentIndex를 의존성에 추가하여 변경 시 인터벌 재설정

    return (
        <div className="ad-banner-container">
            <div
                className="ad-slides-wrapper"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {ADS.map((ad) => (
                    <div
                        key={ad.id}
                        className="ad-slide"
                        style={{ background: ad.bgColor }}
                    >
                        <span className="ad-text">{ad.text}</span>
                    </div>
                ))}
            </div>

            <button className="ad-nav-btn prev" onClick={prevSlide}>
                <ChevronLeft size={18} />
            </button>
            <button className="ad-nav-btn next" onClick={nextSlide}>
                <ChevronRight size={18} />
            </button>

            <div className="ad-dots">
                {ADS.map((_, index) => (
                    <div
                        key={index}
                        className={`ad-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdBanner;
