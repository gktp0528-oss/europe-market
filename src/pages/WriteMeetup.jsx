import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, MapPin, Camera, X, Calendar, Clock, Users, Star, Tag, CheckCircle, Globe, Monitor } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import '../styles/WriteForm.css';

const MEETUP_TAGS = ['운동', '공부', '친목', '문화', '여행', '언어', '카페', '기타'];

const WriteMeetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';
    const { user, loading } = useAuth();

    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
        }
    }, [user, loading, navigate]);
    const totalSteps = 3;

    // Get country info for currency
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');
    const currency = countryInfo.currencySymbol;

    const [formData, setFormData] = useState({
        title: '',
        meetupType: 'one-time', // 'one-time' or 'recurring'
        date: '',
        startTime: '',
        endTime: '',
        repeatDays: [], // ['월', '수'] etc.
        repeatCycle: '매주', // '매주', '격주', '매월'
        isFree: true,
        fee: '',
        members: '',
        location: '',
        locationData: null,
        onOffline: 'offline', // 'offline' or 'online'
        description: '',
        tags: [],
        approvalType: 'first-come' // 'first-come' or 'approval'
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validation: Max 10 images
        if (images.length + files.length > 10) {
            alert('사진은 최대 10장까지 업로드할 수 있어요.');
            return;
        }

        // Validation: Size and Type
        const validFiles = [];
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name}은(는) 5MB를 초과하여 제외되었습니다.`);
                continue;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        const newImages = validFiles.map(file => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file
        }));

        setImages([...images, ...newImages]);
    };

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleLocationSelect = (data) => {
        setFormData({
            ...formData,
            location: data.address,
            locationData: data
        });
        setShowLocationPicker(false);
    };

    const handleFeeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, fee: value ? Number(value).toLocaleString() : '' });
    };

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const toggleRepeatDay = (day) => {
        setFormData(prev => ({
            ...prev,
            repeatDays: prev.repeatDays.includes(day)
                ? prev.repeatDays.filter(d => d !== day)
                : [...prev.repeatDays, day]
        }));
    };

    const handleSubmit = async () => {
        if (!isSubmitValid || isSubmitting) return;
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload Images
            const uploadedUrls = [];
            for (const img of images) {
                const fileExt = img.file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `meetups/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, img.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            // 2. Format Data for DB
            const formattedFee = formData.isFree ? '무료' : `${formData.fee}${currency}`;

            // For recurring, store days and time. For one-time, store date and time.
            const formattedDate = formData.meetupType === 'one-time'
                ? `${formData.date} ${formData.startTime}`
                : `${formData.repeatDays.join(', ')} ${formData.startTime}`;

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    category: 'meetup',
                    title: formData.title,
                    price: formattedFee,
                    trade_time: formattedDate,
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: formData.description,
                    country_code: countryCode,
                    image_urls: uploadedUrls,
                    views: 0,
                    likes: 0,
                    color: '#E0F7FA',
                    user_id: user.id,
                    metadata: {
                        tags: formData.tags,
                        onOffline: formData.onOffline,
                        approvalType: formData.approvalType,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        isFree: formData.isFree,
                        members: formData.members,
                        meetupType: formData.meetupType,
                        repeatDays: formData.repeatDays,
                        repeatCycle: formData.repeatCycle
                    }
                });

            if (dbError) throw dbError;

            setShowSuccess(true);

        } catch (error) {
            console.error('Submission failed:', error);
            alert('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step-by-step validation
    const isStep1Valid = formData.title && formData.tags.length > 0;
    const isStep2Valid = (formData.meetupType === 'one-time' ? formData.date : formData.repeatDays.length > 0) &&
        formData.startTime && formData.endTime && formData.location;
    const isStep3Valid = formData.members && (formData.isFree || formData.fee) && formData.description;

    const isNextDisabled = (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid);
    const isSubmitValid = isStep1Valid && isStep2Valid && isStep3Valid;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    const stepLabels = ['기본 정보', '일정 및 장소', '참여 조건'];

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={prevStep}><ArrowLeft size={24} /></button>
                <h1>모임 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="step-info">
                    <span className="current-step">{step}/{totalSteps} 단계</span>
                    <span className="step-label">{stepLabels[step - 1]}</span>
                </div>
                <div className="progress-bar-wrapper">
                    <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                </div>
            </div>

            <div className="write-content">
                {step === 1 && (
                    <div className="step-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Image Upload */}
                        <div className="image-upload-section">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                            <div className="image-upload-box" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={24} />
                                <span>{images.length}/10</span>
                            </div>
                            {images.map((img) => (
                                <div key={img.id} className="image-preview-item">
                                    <img src={img.url} alt="upload preview" />
                                    <button className="remove-img-btn" onClick={() => removeImage(img.id)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label>모임 제목</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="어떤 모임인지 한눈에 알 수 있게 적어주세요"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                maxLength={100}
                            />
                        </div>

                        {/* Tags selection */}
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Tag size={16} /> 모임 성격 (멀티 선택 가능)
                            </label>
                            <div className="tag-chips-container" style={{ marginTop: '8px' }}>
                                {MEETUP_TAGS.map(tag => (
                                    <div
                                        key={tag}
                                        className={`day-chip ${formData.tags.includes(tag) ? 'active meetup-active' : ''}`}
                                        onClick={() => toggleTag(tag)}
                                        style={{ padding: '0 20px', fontSize: '13px' }}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Date & Time with Type Toggle */}
                        <div className="form-group">
                            <label>모임 일시</label>
                            <div className="segment-control" style={{ marginTop: '8px', marginBottom: '12px' }}>
                                <button
                                    className={`segment-btn ${formData.meetupType === 'one-time' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, meetupType: 'one-time' })}
                                >
                                    한 번만 만나요
                                </button>
                                <button
                                    className={`segment-btn ${formData.meetupType === 'recurring' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, meetupType: 'recurring' })}
                                >
                                    자주 만나요 (정기)
                                </button>
                            </div>

                            {formData.meetupType === 'one-time' ? (
                                <div className="time-input-box" style={{ marginBottom: '12px' }}>
                                    <Calendar size={18} style={{ color: '#00BCD4' }} />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="recurring-options" style={{ marginBottom: '16px' }}>
                                    <div className="days-selector" style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                        {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                                            <div
                                                key={day}
                                                className={`day-chip ${formData.repeatDays.includes(day) ? 'active meetup-active' : ''}`}
                                                onClick={() => toggleRepeatDay(day)}
                                                style={{ flex: 1, minWidth: '40px' }}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="segment-control" style={{ gap: '4px' }}>
                                        {['매주', '격주', '매월'].map(cycle => (
                                            <button
                                                key={cycle}
                                                className={`segment-btn ${formData.repeatCycle === cycle ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, repeatCycle: cycle })}
                                            >
                                                {cycle}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="time-range-picker" style={{ gap: '8px', background: 'transparent', padding: 0 }}>
                                <div className="time-input-box">
                                    <Clock size={18} style={{ color: '#00BCD4' }} />
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <span style={{ color: '#CBD5E1', fontWeight: '500' }}>~</span>
                                <div className="time-input-box">
                                    <Clock size={18} style={{ color: '#00BCD4' }} />
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Online / Offline Toggle */}
                        <div className="form-group">
                            <label>모임 방식</label>
                            <div className="segment-control" style={{ marginTop: '8px' }}>
                                <button
                                    className={`segment-btn ${formData.onOffline === 'offline' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, onOffline: 'offline' })}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    <Globe size={16} /> 오프라인
                                </button>
                                <button
                                    className={`segment-btn ${formData.onOffline === 'online' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, onOffline: 'online', location: '온라인 (상세 내용 참고)' })}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    <Monitor size={16} /> 온라인
                                </button>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label>{formData.onOffline === 'offline' ? '모임 장소' : '온라인 링크 또는 참여 방법'}</label>
                            {formData.onOffline === 'offline' ? (
                                <div className="input-with-icon" onClick={() => setShowLocationPicker(true)} style={{ cursor: 'pointer', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '6px 16px', background: '#F8FAFC' }}>
                                    <MapPin size={18} className="field-icon" style={{ color: '#00BCD4' }} />
                                    <input
                                        type="text"
                                        className="input-field no-border"
                                        placeholder="모임 장소를 선택해주세요"
                                        value={formData.location}
                                        readOnly
                                        style={{ pointerEvents: 'none', background: 'transparent' }}
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="구글 미트 링크, 줌 회의 ID 등을 입력해주세요"
                                    value={formData.location === '온라인 (상세 내용 참고)' ? '' : formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Members */}
                        <div className="form-group">
                            <label>모집 인원</label>
                            <div className="time-input-box">
                                <Users size={18} style={{ color: '#00BCD4' }} />
                                <input
                                    type="number"
                                    className="input-field no-border"
                                    placeholder="최대 참여 가능 인원 (숫자)"
                                    value={formData.members}
                                    onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                                    style={{ background: 'transparent' }}
                                />
                            </div>
                        </div>

                        {/* Fee Toggle */}
                        <div className="form-group">
                            <label>참가비</label>
                            <div className="segment-control" style={{ marginTop: '8px', marginBottom: !formData.isFree ? '12px' : '0' }}>
                                <button
                                    className={`segment-btn ${formData.isFree ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, isFree: true, fee: '' })}
                                >
                                    무료
                                </button>
                                <button
                                    className={`segment-btn ${!formData.isFree ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, isFree: false })}
                                >
                                    유료 (회비 있음)
                                </button>
                            </div>
                            {!formData.isFree && (
                                <div className="price-input-wrapper">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="금액 입력"
                                        value={formData.fee}
                                        onChange={handleFeeChange}
                                        style={{ background: 'white', border: '1px solid #00BCD4', boxShadow: '0 0 0 4px rgba(0, 188, 212, 0.05)' }}
                                    />
                                    <span className="currency-label" style={{ color: '#0097A7' }}>{currency}</span>
                                </div>
                            )}
                        </div>

                        {/* Approval Method */}
                        <div className="form-group">
                            <label>참여 승인 방식</label>
                            <div className="segment-control" style={{ marginTop: '8px' }}>
                                <button
                                    className={`segment-btn ${formData.approvalType === 'first-come' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, approvalType: 'first-come' })}
                                >
                                    선착순 마감
                                </button>
                                <button
                                    className={`segment-btn ${formData.approvalType === 'approval' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, approvalType: 'approval' })}
                                >
                                    호스트 승인제
                                </button>
                            </div>
                            <div style={{
                                marginTop: '12px', padding: '12px', background: '#F0F9FF', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E0F2FE'
                            }}>
                                <CheckCircle size={16} style={{ color: '#0EA5E9' }} />
                                <p style={{ fontSize: '12px', color: '#0369A1', fontWeight: '500' }}>
                                    {formData.approvalType === 'first-come'
                                        ? '신청 즉시 바로 참여가 확정됩니다.'
                                        : '호스트가 신청서 확인 후 수락해야 참여가 확정됩니다.'}
                                </p>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '8px' }}>
                            <label>모임 상세 내용</label>
                            <textarea
                                className="input-field textarea-field"
                                placeholder="어떤 모임인가요? 준비물이나 상세 일정이 있다면 적어주세요!"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ height: '180px', background: 'white' }}
                                maxLength={2000}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="step-navigation">
                    {step < totalSteps ? (
                        <button
                            className="nav-btn next"
                            onClick={nextStep}
                            disabled={isNextDisabled}
                        >
                            다음으로 ({step}/{totalSteps})
                        </button>
                    ) : (
                        <button
                            className="nav-btn next"
                            disabled={!isSubmitValid || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? '등록 중...' : '모임 만들기'}
                        </button>
                    )}
                </div>
            </div>

            {showLocationPicker && (
                <LocationPicker
                    countryCode={countryCode}
                    onSelect={handleLocationSelect}
                    onClose={() => setShowLocationPicker(false)}
                />
            )}
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => navigate('/category/meetups')}
                title="모임 생성 완료! 👥"
                message={`새로운 모임이 <br/>성공적으로 만들어졌습니다! ✨`}
                icon={Users}
                buttonText="목록으로 이동"
            />
        </div>
    );
};

export default WriteMeetup;
