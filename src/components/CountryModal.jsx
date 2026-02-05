import React from 'react';
import { X } from 'lucide-react';
import { useCountry, SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import './CountryModal.css';

const CountryModal = ({ isOpen, onClose }) => {
    const { selectedCountry, setSelectedCountry } = useCountry();

    if (!isOpen) return null;

    const handleSelect = (country) => {
        setSelectedCountry(country);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>국가 선택</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-desc">원하시는 국가를 선택해주세요.<br />해당 국가의 게시물만 보여집니다.</p>
                    <div className="country-grid">
                        {SUPPORTED_COUNTRIES.map((country) => (
                            <button
                                key={country.code}
                                className={`country-item ${selectedCountry.code === country.code ? 'active' : ''}`}
                                onClick={() => handleSelect(country)}
                            >
                                <div className="country-flag">{country.flag}</div>
                                <span className="country-name">{country.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountryModal;
