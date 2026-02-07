import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, X, Calendar, Clock, Users, Star, Tag, CheckCircle, Globe, Monitor } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import '../styles/WriteForm.css';

const MEETUP_TAGS = ['운동', '공부', '친목', '문화', '여행', '언어', '카페', '기타'];

const WriteMeetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Get country info for currency
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');
    const currency = countryInfo.currencySymbol;

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
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
        if (images.length + files.length > 10) {
            alert('사진은 최대 10장까지 업로드할 수 있어요.');
            return;
        }

        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
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

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // 1. Upload Images
            const uploadedUrls = [];
            for (const img of images) {
                const fileExt = img.file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
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
            const formattedDate = `${formData.date} ${formData.startTime}`; // Store Date+StartTime in trade_time
            const fullDescription = `모집 인원: ${formData.members}명\n\n${formData.description}`;

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
                    description: fullDescription,
                    country_code: countryCode,
                    image_urls: uploadedUrls,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    color: '#E0F7FA',
                    metadata: {
                        tags: formData.tags,
                        onOffline: formData.onOffline,
                        approvalType: formData.approvalType,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        isFree: formData.isFree,
                        members: formData.members
                    }
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

    const isFormValid = formData.title &&
        formData.date &&
        formData.startTime &&
        (formData.isFree || formData.fee) &&
        formData.members &&
        formData.location &&
        formData.description &&
        formData.tags.length > 0;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>모임 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
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
                    />
                </div>

                {/* Tags selection */}
                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={16} /> 모임 성격 (멀티 선택 가능)
                    </label>
                    <div className="tag-chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {MEETUP_TAGS.map(tag => (
                            <div
                                key={tag}
                                className={`day-chip ${formData.tags.includes(tag) ? 'active' : ''}`}
                                onClick={() => toggleTag(tag)}
                                style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Online / Offline Toggle */}
                <div className="form-group">
                    <label>모임 방식</label>
                    <div className="segment-control" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginTop: '8px' }}>
                        <button
                            className={`segment-btn ${formData.onOffline === 'offline' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, onOffline: 'offline' })}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: formData.onOffline === 'offline' ? 'white' : 'transparent',
                                boxShadow: formData.onOffline === 'offline' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: formData.onOffline === 'offline' ? '700' : '500',
                                color: formData.onOffline === 'offline' ? '#00BCD4' : '#64748b',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            <Globe size={16} /> 오프라인
                        </button>
                        <button
                            className={`segment-btn ${formData.onOffline === 'online' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, onOffline: 'online', location: '온라인 (상세 내용 참고)' })}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: formData.onOffline === 'online' ? 'white' : 'transparent',
                                boxShadow: formData.onOffline === 'online' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: formData.onOffline === 'online' ? '700' : '500',
                                color: formData.onOffline === 'online' ? '#00BCD4' : '#64748b',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            <Monitor size={16} /> 온라인
                        </button>
                    </div>
                </div>

                {/* Location */}
                <div className="form-group">
                    <label>{formData.onOffline === 'offline' ? '모임 장소' : '온라인 링크 또는 참여 방법'}</label>
                    {formData.onOffline === 'offline' ? (
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

                {/* Date & Time */}
                <div className="form-group">
                    <label>모임 일시</label>
                    <div className="time-input-box" style={{ marginBottom: '8px' }}>
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className="time-range-picker">
                        <div className="time-input-box" style={{ flex: 1 }}>
                            <Clock size={16} />
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <span style={{ color: '#cbd5e1' }}>~</span>
                        <div className="time-input-box" style={{ flex: 1 }}>
                            <Clock size={16} />
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Fee Toggle */}
                <div className="form-group">
                    <label>참가비</label>
                    <div className="segment-control" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginTop: '8px', marginBottom: !formData.isFree ? '12px' : '0' }}>
                        <button
                            className={`segment-btn ${formData.isFree ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, isFree: true, fee: '' })}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: formData.isFree ? 'white' : 'transparent',
                                boxShadow: formData.isFree ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: formData.isFree ? '700' : '500',
                                color: formData.isFree ? '#00BCD4' : '#64748b',
                                cursor: 'pointer'
                            }}
                        >
                            무료
                        </button>
                        <button
                            className={`segment-btn ${!formData.isFree ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, isFree: false })}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: !formData.isFree ? 'white' : 'transparent',
                                boxShadow: !formData.isFree ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: !formData.isFree ? '700' : '500',
                                color: !formData.isFree ? '#00BCD4' : '#64748b',
                                cursor: 'pointer'
                            }}
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
                            />
                            <span className="currency-label">{currency}</span>
                        </div>
                    )}
                </div>

                {/* Members */}
                <div className="form-group">
                    <label>모집 인원</label>
                    <div className="input-with-icon">
                        <Users size={18} className="field-icon" style={{ color: '#64748b' }} />
                        <input
                            type="number"
                            className="input-field no-border"
                            placeholder="최대 참여 가능 인원 (숫자)"
                            value={formData.members}
                            onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                        />
                    </div>
                </div>

                {/* Approval Method */}
                <div className="form-group">
                    <label>참여 승인 방식</label>
                    <div className="segment-control" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginTop: '8px' }}>
                        <button
                            className={`segment-btn ${formData.approvalType === 'first-come' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, approvalType: 'first-come' })}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: formData.approvalType === 'first-come' ? 'white' : 'transparent',
                                boxShadow: formData.approvalType === 'first-come' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: formData.approvalType === 'first-come' ? '700' : '500',
                                color: formData.approvalType === 'first-come' ? '#00BCD4' : '#64748b',
                                cursor: 'pointer'
                            }}
                        >
                            선착순 마감
                        </button>
                        <button
                            className={`segment-btn ${formData.approvalType === 'approval' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, approvalType: 'approval' })}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: formData.approvalType === 'approval' ? 'white' : 'transparent',
                                boxShadow: formData.approvalType === 'approval' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontWeight: formData.approvalType === 'approval' ? '700' : '500',
                                color: formData.approvalType === 'approval' ? '#00BCD4' : '#64748b',
                                cursor: 'pointer'
                            }}
                        >
                            호스트 승인제
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginLeft: '4px' }}>
                        {formData.approvalType === 'first-come'
                            ? '💡 신청 즉시 바로 참여가 확정됩니다.'
                            : '💡 호스트가 신청서 확인 후 수락해야 참여가 확정됩니다.'}
                    </p>
                </div>

                <div className="form-group">
                    <label>모임 상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="어떤 모임인가요? 준비물이나 상세 일정이 있다면 적어주세요!"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ height: '150px' }}
                    />
                </div>

                <div className="submit-container">
                    <button
                        className="submit-btn-bottom"
                        disabled={!isFormValid || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? '등록 중...' : '모임 만들기'}
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
