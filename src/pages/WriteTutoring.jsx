import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import '../styles/WriteForm.css';

const WriteTutoring = () => {
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
        subject: '',
        payType: '시급',
        payAmount: '',
        location: '',
        locationData: null,
        description: '',
    });

    const [tutoringType, setTutoringType] = useState('tutoring'); // 'tutoring' or 'lesson'
    const [gender, setGender] = useState('male'); // 'male' or 'female'

    const handleTypeChange = (type) => {
        setTutoringType(type);
        setFormData(prev => ({ ...prev, title: '', subject: '', description: '' })); // Reset relevant fields
    };

    const handleGenderChange = (selectedGender) => {
        setGender(selectedGender);
    };

    const handleLocationSelect = (data) => {
        setFormData({
            ...formData,
            location: data.address,
            locationData: data
        });
        setShowLocationPicker(false);
    };

    const handlePayChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, payAmount: value ? Number(value).toLocaleString() : '' });
    };

    const isFormValid = formData.title && formData.subject && formData.description && formData.location && formData.payAmount;

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const formattedPay = `${formData.payType} ${formData.payAmount}${currency}`;

            // Default images based on gender
            const maleImage = '/assets/defaults/tutor_male_animated.png';
            const femaleImage = '/assets/defaults/tutor_female_animated.png';
            const defaultImage = gender === 'male' ? maleImage : femaleImage;

            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    category: 'tutoring',
                    title: formData.title,
                    price: formattedPay,
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: `[${tutoringType === 'tutoring' ? '과외' : '레슨'}] ${tutoringType === 'tutoring' ? '과목' : '분야'}: ${formData.subject}\n\n${formData.description}`,
                    country_code: countryCode,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    image_urls: [defaultImage],
                    color: '#F5F5F5'
                });

            if (dbError) throw dbError;

            alert(`${tutoringType === 'tutoring' ? '과외' : '레슨'}글이 성공적으로 등록되었습니다! ✨`);
            navigate('/category/tutoring');

        } catch (error) {
            console.error('Submission failed:', error);
            alert('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dynamic labels based on type
    const labels = {
        title: tutoringType === 'tutoring' ? '과외 제목' : '레슨 제목',
        subject: tutoringType === 'tutoring' ? '과목' : '분야/악기',
        pay: tutoringType === 'tutoring' ? '과외비' : '레슨비',
        location: tutoringType === 'tutoring' ? '활동 지역' : '레슨 장소',
        description: tutoringType === 'tutoring' ? '선생님 소개 & 수업 방식' : '레슨 커리큘럼 & 소개',
        placeholder: {
            title: tutoringType === 'tutoring' ? '예: 초등 수학 꼼꼼하게 봐드립니다' : '예: 취미 피아노 레슨합니다',
            subject: tutoringType === 'tutoring' ? '예: 수학, 영어, 프랑스어' : '예: 피아노, 요가, 보컬',
            description: tutoringType === 'tutoring'
                ? '학력, 경력, 수업 방식 등을 자세히 적어주세요.'
                : '레슨 경력, 커리큘럼, 대상 수강생 등을 적어주세요.'
        }
    };

    const payTypeOptions = ['시급', '회당'];

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={24} /></button>
                <h1>{tutoringType === 'tutoring' ? '과외 구하기' : '레슨 모집'}</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
                {/* Type Selection */}
                <div className="segment-control" style={{ marginBottom: '12px' }}>
                    <button
                        className={`segment-btn ${tutoringType === 'tutoring' ? 'active' : ''}`}
                        onClick={() => handleTypeChange('tutoring')}
                    >
                        📚 과외
                    </button>
                    <button
                        className={`segment-btn ${tutoringType === 'lesson' ? 'active' : ''}`}
                        onClick={() => handleTypeChange('lesson')}
                    >
                        🎹 레슨
                    </button>
                </div>

                {/* Gender Selection */}
                <div className="segment-control" style={{ marginBottom: '20px' }}>
                    <button
                        className={`segment-btn ${gender === 'male' ? 'active' : ''}`}
                        onClick={() => handleGenderChange('male')}
                    >
                        👨‍🏫 남자 선생님
                    </button>
                    <button
                        className={`segment-btn ${gender === 'female' ? 'active' : ''}`}
                        onClick={() => handleGenderChange('female')}
                    >
                        👩‍🏫 여자 선생님
                    </button>
                </div>

                <div className="form-group">
                    <label>{labels.title}</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder={labels.placeholder.title}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>{labels.subject}</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder={labels.placeholder.subject}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>{labels.location}</label>
                    <div className="input-with-icon" onClick={() => setShowLocationPicker(true)} style={{ cursor: 'pointer', border: '1px solid #e1e8f0', borderRadius: '12px', padding: '4px 12px' }}>
                        <MapPin size={18} className="field-icon" style={{ color: '#64748b' }} />
                        <input
                            type="text"
                            className="input-field no-border"
                            placeholder={tutoringType === 'tutoring' ? '활동 가능한 지역을 선택해주세요' : '레슨 장소를 선택해주세요'}
                            value={formData.location}
                            readOnly
                            style={{ pointerEvents: 'none' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>{labels.pay}</label>
                    <div className="price-input-wrapper">
                        <select
                            className="pay-type-select"
                            value={formData.payType}
                            onChange={(e) => setFormData({ ...formData, payType: e.target.value })}
                        >
                            {payTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="금액 입력"
                            value={formData.payAmount}
                            onChange={handlePayChange}
                        />
                        <span className="currency-label">{currency}</span>
                    </div>
                </div>

                <div className="form-group">
                    <label>{labels.description}</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder={labels.placeholder.description}
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

export default WriteTutoring;
