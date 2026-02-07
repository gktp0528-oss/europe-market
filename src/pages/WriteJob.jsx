import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import '../styles/WriteForm.css';

const WriteJob = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Get country info for currency
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');
    const currency = countryInfo.currencySymbol;

    const [formData, setFormData] = useState({
        title: '',
        pay: '',
        time: '',
        location: '',
        locationData: null,
        description: '',
    });

    const handleLocationSelect = (data) => {
        setFormData({
            ...formData,
            location: data.address,
            locationData: data
        });
        setShowLocationPicker(false);
    };

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    category: 'job',
                    title: formData.title,
                    price: formData.pay,
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: formData.description,
                    trade_time: formData.time,
                    country_code: countryCode,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    color: '#F5F5F5'
                });

            if (dbError) throw dbError;

            alert('구인글이 성공적으로 등록되었습니다! ✨');
            navigate('/category/jobs');

        } catch (error) {
            console.error('Submission failed:', error);
            alert('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.title && formData.pay && formData.description && formData.location;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>알바/구인 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
                <div className="form-group">
                    <label>공고 제목</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="구인 제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>급여 정보</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder={`예: 시급 12${currency}, 일당 100${currency}`}
                        value={formData.pay}
                        onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>근무 위치</label>
                    <div className="input-with-icon" onClick={() => setShowLocationPicker(true)} style={{ cursor: 'pointer', border: '1px solid #e1e8f0', borderRadius: '12px', padding: '4px 12px' }}>
                        <MapPin size={18} className="field-icon" style={{ color: '#64748b' }} />
                        <input
                            type="text"
                            className="input-field no-border"
                            placeholder="근무 위치를 선택해주세요"
                            value={formData.location}
                            readOnly
                            style={{ pointerEvents: 'none' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>근무 시간</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 매주 토,일 10:00~15:00"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="하는 일, 자격 요건 등을 자세히 적어주세요!"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="submit-container">
                    <button
                        className="submit-btn-bottom"
                        disabled={!isFormValid || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? '등록 중...' : '작성 완료'}
                    </button>
                </div>
            </div>

            {showLocationPicker && (
                <LocationPicker
                    countryCode={countryCode}
                    onSelect={handleLocationSelect}
                    onClose={() => setShowLocationPicker(false)}
                />
            )}
        </div>
    );
};

export default WriteJob;
