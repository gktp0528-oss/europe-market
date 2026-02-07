import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, X, Calendar, Clock, Users, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import '../styles/WriteForm.css';

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
        time: '',
        isFree: false,
        fee: '',
        members: '',
        location: '',
        locationData: null,
        description: '',
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
            const formattedDate = `${formData.date} ${formData.time}`; // Store Date+Time in trade_time
            const fullDescription = `모집 인원: ${formData.members}명\n\n${formData.description}`;

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    category: 'meetup',
                    title: formData.title,
                    price: formattedFee,     // Store Fee in price column
                    trade_time: formattedDate, // Store Date/Time in trade_time column
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: fullDescription,
                    country_code: countryCode,
                    image_urls: uploadedUrls,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    color: '#E0F7FA' // Light Cyan for meetups
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

    const isFormValid = formData.title && formData.date && formData.time && (formData.isFree || formData.fee) && formData.members && formData.location && formData.description;

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
                    <label>일시</label>
                    <div className="time-range-picker">
                        <div className="time-input-box" style={{ flex: 1.5 }}>
                            <Calendar size={16} />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="time-input-box" style={{ flex: 1 }}>
                            <Clock size={16} />
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>장소</label>
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
                    <label>참가 인원</label>
                    <div className="input-with-icon">
                        <Users size={18} className="field-icon" style={{ color: '#64748b' }} />
                        <input
                            type="number"
                            className="input-field no-border"
                            placeholder="최대 인원 (숫자만 입력)"
                            value={formData.members}
                            onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>참가비 (회비)</label>
                    <div className="price-input-wrapper">
                        <div
                            className={`day-chip ${formData.isFree ? 'active' : ''}`}
                            style={{ marginRight: '8px', padding: '8px 12px', fontSize: '13px' }}
                            onClick={() => setFormData(prev => ({ ...prev, isFree: !prev.isFree, fee: '' }))}
                        >
                            무료
                        </div>
                        {!formData.isFree && (
                            <>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="금액 입력"
                                    value={formData.fee}
                                    onChange={handleFeeChange}
                                />
                                <span className="currency-label">{currency}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>모임 상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="어떤 모임인가요? 상세 내용을 적어주세요!"
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
