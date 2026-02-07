import React, { useState, useEffect } from 'react';
import { X, ChevronRight, MapPin, Search } from 'lucide-react';
import { CITY_DISTRICTS } from '../lib/locationUtils';
import './LocationPicker.css';

const LocationPicker = ({ isOpen, onClose, onSelect, countryCode }) => {
    const [step, setStep] = useState(1); // 1: City, 2: District
    const [selectedCity, setSelectedCity] = useState(null);
    const [customCity, setCustomCity] = useState('');
    const [customDistrict, setCustomDistrict] = useState('');

    const countryData = CITY_DISTRICTS[countryCode] || { cities: [] };
    const cities = countryData.cities;

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedCity(null);
            setCustomCity('');
            setCustomDistrict('');
        }
    }, [isOpen]);

    const handleCitySelect = (city) => {
        if (city.name === '기타') {
            setStep(1.5); // Custom city input
        } else {
            setSelectedCity(city);
            setStep(2);
        }
    };

    const handleDistrictSelect = (district) => {
        if (district === '직접 입력') {
            setStep(2.5); // Custom district input
        } else {
            onSelect(`${selectedCity.name} - ${district}`);
            onClose();
        }
    };

    const submitCustomCity = () => {
        if (customCity.trim()) {
            setSelectedCity({ name: customCity, districts: ['직접 입력'] });
            setStep(2);
        }
    };

    const submitCustomDistrict = () => {
        if (customDistrict.trim()) {
            onSelect(`${selectedCity.name} - ${customDistrict}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="location-picker-overlay" onClick={onClose}>
            <div className="location-picker-content" onClick={e => e.stopPropagation()}>
                <header className="picker-header">
                    <button onClick={onClose}><X size={24} /></button>
                    <h2>위치 선택</h2>
                    <div style={{ width: 24 }}></div>
                </header>

                <div className="picker-body">
                    {step === 1 && (
                        <div className="picker-step fade-in">
                            <h3 className="step-title">도시를 선택해주세요</h3>
                            <div className="selection-list">
                                {cities.map((city, idx) => (
                                    <button key={idx} className="selection-item" onClick={() => handleCitySelect(city)}>
                                        <span>{city.name}</span>
                                        <ChevronRight size={20} color="#ccc" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 1.5 && (
                        <div className="picker-step fade-in">
                            <h3 className="step-title">도시 이름을 입력해주세요</h3>
                            <div className="custom-input-group">
                                <input
                                    type="text"
                                    placeholder="도시명 (예: 니스, 보르도)"
                                    value={customCity}
                                    onChange={(e) => setCustomCity(e.target.value)}
                                    autoFocus
                                />
                                <button className="confirm-btn" onClick={submitCustomCity} disabled={!customCity.trim()}>확인</button>
                            </div>
                            <button className="back-link" onClick={() => setStep(1)}>뒤로 가기</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="picker-step fade-in">
                            <div className="step-header">
                                <button className="back-btn-small" onClick={() => setStep(1)}>
                                    <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /> {selectedCity.name}
                                </button>
                                <h3 className="step-title">상세 구역을 선택해주세요</h3>
                            </div>
                            <div className="selection-list">
                                {selectedCity.districts.map((district, idx) => (
                                    <button key={idx} className="selection-item" onClick={() => handleDistrictSelect(district)}>
                                        <span>{district}</span>
                                        <ChevronRight size={20} color="#ccc" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2.5 && (
                        <div className="picker-step fade-in">
                            <h3 className="step-title">상세 위치(구역)를 입력해주세요</h3>
                            <div className="custom-input-group">
                                <input
                                    type="text"
                                    placeholder="상세 구역 이름 직접 입력"
                                    value={customDistrict}
                                    onChange={(e) => setCustomDistrict(e.target.value)}
                                    autoFocus
                                />
                                <button className="confirm-btn" onClick={submitCustomDistrict} disabled={!customDistrict.trim()}>확인</button>
                            </div>
                            <button className="back-link" onClick={() => setStep(2)}>뒤로 가기</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
