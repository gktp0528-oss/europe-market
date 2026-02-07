import React, { useState } from 'react';
import { X, MapPin, ChevronRight, Search } from 'lucide-react';
import './LocationSelector.css';

const LocationSelector = ({ isOpen, onClose, onSelect, cities, currentCountryName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);

    if (!isOpen) return null;

    const filteredCities = cities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCityClick = (city) => {
        setSelectedCity(city);
    };

    const handleComplete = () => {
        if (!selectedCity) return;
        const fullLocation = detailAddress
            ? `${selectedCity} ${detailAddress}`
            : selectedCity;
        onSelect(fullLocation);
        onClose();
    };

    return (
        <div className="location-modal-overlay" onClick={onClose}>
            <div className="location-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>거래 지역 선택</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className="location-picker-body">
                    <div className="current-country-badge">
                        <MapPin size={14} />
                        <span>{currentCountryName} 내 지역 선택</span>
                    </div>

                    {!selectedCity ? (
                        <div className="city-selection-view">
                            <div className="search-bar-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="도시 검색 (예: 파리, 런던...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="city-search-input"
                                />
                            </div>
                            <div className="city-list">
                                {filteredCities.map((city, index) => (
                                    <button
                                        key={index}
                                        className="city-item"
                                        onClick={() => handleCityClick(city)}
                                    >
                                        <span>{city}</span>
                                        <ChevronRight size={18} color="#CCC" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="detail-input-view">
                            <div className="selected-city-display">
                                <span className="label">선택된 도시</span>
                                <div className="display-box">
                                    <span className="city-name">{selectedCity}</span>
                                    <button className="change-city-btn" onClick={() => setSelectedCity(null)}>변경</button>
                                </div>
                            </div>

                            <div className="detail-field">
                                <label>상세 지역 (선택)</label>
                                <input
                                    type="text"
                                    placeholder="상세 구역이나 지하철역 등을 입력해주세요"
                                    value={detailAddress}
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                    className="detail-input"
                                    autoFocus
                                />
                                <p className="input-hint">예: 15구, 에펠탑 근처, 킹스크로스역</p>
                            </div>

                            <button
                                className="location-confirm-btn"
                                onClick={handleComplete}
                            >
                                확인
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationSelector;
