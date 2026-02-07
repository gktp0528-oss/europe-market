import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import LocationSelector from '../components/LocationSelector';
import '../styles/WriteForm.css';

const WriteMeetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    // Get country info for cities
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');
    const cities = countryInfo.cities || [];

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        members: '',
        location: '',
        description: '',
    });

    const isFormValid = formData.title && formData.date && formData.description && formData.location;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>모임 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
                <div className="form-group">
                    <label>모임 이름</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="모임 제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>날짜 및 시간</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 2월 20일 저녁 7시"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>모집 인원</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 최대 6명"
                        value={formData.members}
                        onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>모임 장소</label>
                    <div className="input-with-icon-wrapper" onClick={() => setIsLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="#888" />
                            <span style={{ color: formData.location ? '#333' : '#999' }}>
                                {formData.location || '모임 도시를 선택해주세요'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>모임 상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="어떤 모임인가요? 상세한 모임 장소 등을 적어주세요!"
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

export default WriteMeetup;
