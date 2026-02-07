import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import '../styles/WriteForm.css';

const WriteMeetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        members: '',
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
                    category: 'meetup',
                    title: formData.title,
                    price: formData.date, // Meetup date stored in price field for now to match detail page logic
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: `모집 인원: ${formData.members}\n\n${formData.description}`,
                    country_code: countryCode,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    color: '#F5F5F5'
                });

            if (dbError) throw dbError;

            alert('모임글이 성공적으로 등록되었습니다! ✨');
            navigate('/category/meetups');

        } catch (error) {
            console.error('Submission failed:', error);
            alert('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <label>장소 선택</label>
                    <div className="input-with-icon" onClick={() => setShowLocationPicker(true)} style={{ cursor: 'pointer', border: '1px solid #e1e8f0', borderRadius: '12px', padding: '4px 12px' }}>
                        <MapPin size={18} className="field-icon" style={{ color: '#64748b' }} />
                        <input
                            type="text"
                            className="input-field no-border"
                            placeholder="모임 장소를 선택해주세요"
                            value={formData.location}
                            readOnly
                            style={{ pointerEvents: 'none' }}
                        />
                    </div>
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
                    <label>모임 상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="어떤 모임인가요? 상세 내용을 적어주세요!"
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

export default WriteMeetup;
