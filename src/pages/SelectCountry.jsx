import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import './SelectCountry.css';

const SelectCountry = () => {
    const navigate = useNavigate();
    const { type } = useParams(); // 'used', 'job', 'tutoring', 'meetup'

    const handleCountrySelect = (country) => {
        // Move to the write form with the selected country code
        navigate(`/write/${type}?country=${country.code}`);
    };

    const displayType = {
        used: '중고거래',
        job: '구인구직',
        tutoring: '과외',
        meetup: '모임'
    }[type] || '게시글';

    return (
        <div className="select-country-page">
            <header className="select-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>지역 선택</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="select-content">
                <div className="select-intro">
                    <div className="icon-circle">
                        <Globe size={40} className="globe-icon" />
                    </div>
                    <h2>{displayType} 글을 올릴<br />국가를 선택해주세요</h2>
                    <p>선택하신 국가의 화폐와 지역에 맞춰<br />작성 폼이 구성됩니다.</p>
                </div>

                <div className="country-grid">
                    {SUPPORTED_COUNTRIES.filter(c => c.code !== 'ALL').map((country) => (
                        <button
                            key={country.code}
                            className="country-card"
                            onClick={() => handleCountrySelect(country)}
                        >
                            <div className="flag-circle">
                                <img
                                    src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                                    alt={country.name}
                                    className="flag-img"
                                />
                            </div>
                            <span className="country-name">{country.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectCountry;
