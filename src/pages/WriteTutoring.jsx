import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import LocationSelector from '../components/LocationSelector';
import '../styles/WriteForm.css';

const WriteTutoring = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    // Get country info for currency and cities
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');
    const currency = countryInfo.currencySymbol;
    const cities = countryInfo.cities || [];

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        pay: '',
        location: '',
        description: '',
    });

    const isFormValid = formData.title && formData.subject && formData.description && formData.location;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>과외/레슨 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
                <div className="form-group">
                    <label>레슨 제목</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="레슨/과외 제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>과목/분야</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 프랑스어 회화, 초등 수학"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>과외 지역</label>
                    <div className="input-with-icon-wrapper" onClick={() => setIsLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="#888" />
                            <span style={{ color: formData.location ? '#333' : '#999' }}>
                                {formData.location || '과외 도시를 선택해주세요'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>레슨비 정보</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder={`예: 시급 30${currency}, 회당 상의`}
                        value={formData.pay}
                        onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>레슨 상세 설명</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="커리큘럼, 대상 학생 등을 설명해주세요!"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="submit-container">
                    <button className="submit-btn-bottom" disabled={!isFormValid}>
                        작성 완료
                    </button>
                </div>
            </div>

            <LocationSelector
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelect={(val) => setFormData({ ...formData, location: val })}
                cities={cities}
                currentCountryName={countryInfo.name}
            />
        </div>
    );
};

export default WriteTutoring;
