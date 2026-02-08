import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';
import { ShoppingBag } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteUsed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCountryCode = queryParams.get('country') || 'FR';
    const { user } = useAuth();

    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Get country info for currency
    const selectedCountryInfo = SUPPORTED_COUNTRIES.find(c => c.code === initialCountryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');
    const currency = selectedCountryInfo.currencySymbol;

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        displayPrice: '',
        location: '',
        locationData: null, // Store coordinates and structured info
        tradeTime: '',
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

    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value === '') {
            setFormData({ ...formData, price: '', displayPrice: '' });
            return;
        }

        const formattedValue = Number(value).toLocaleString();
        setFormData({
            ...formData,
            price: value,
            displayPrice: formattedValue
        });
    };

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
            // 1. Upload Images
            const uploadedUrls = [];
            for (const img of images) {
                const fileExt = img.file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `used/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, img.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            // 2. Identify Country (Use the one selected from the previous page)
            const countryCode = initialCountryCode;

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    category: 'used',
                    title: formData.title,
                    price: `${formData.displayPrice}${currency}`,
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: formData.description,
                    trade_time: formData.tradeTime,
                    country_code: countryCode,
                    image_urls: uploadedUrls,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    color: '#F5F5F5',
                    user_id: user?.id // Add user_id
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

    const isFormValid = formData.title && formData.price && formData.description && formData.location;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>중고거래 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
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
                    <label>제목</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="글 제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>가격</label>
                    <div className="price-input-wrapper">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="가격을 입력해주세요"
                            value={formData.displayPrice}
                            onChange={handlePriceChange}
                        />
                        <span className="currency-label">{currency}</span>
                    </div>
                </div>

                <div className="form-group transaction-group">
                    <label>거래 정보</label>
                    <div className="transaction-cards-input">
                        <div className="input-with-icon" onClick={() => setShowLocationPicker(true)} style={{ cursor: 'pointer' }}>
                            <MapPin size={18} className="field-icon" />
                            <input
                                type="text"
                                className="input-field no-border"
                                placeholder="거래 위치를 선택해주세요"
                                value={formData.location}
                                readOnly
                                style={{ pointerEvents: 'none' }}
                            />
                        </div>
                        <div className="input-divider"></div>
                        <div className="time-selector-group">
                            <div className="time-icon-wrapper">
                                <Clock size={18} className="field-icon" />
                            </div>
                            <div className="time-chips-container">
                                {['오전', '오후', '저녁', '주말', '무관'].map((time) => (
                                    <button
                                        key={time}
                                        className={`time-chip ${formData.tradeTime === time ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, tradeTime: time })}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {showLocationPicker && (
                    <LocationPicker
                        countryCode={initialCountryCode}
                        onSelect={handleLocationSelect}
                        onClose={() => setShowLocationPicker(false)}
                    />
                )}

                <div className="form-group">
                    <label>제품 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="게시글 내용을 작성해주세요. (판매 금지 물품은 게시가 제한될 수 있어요)"
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

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => navigate('/category/clothes')}
                title="등록 완료! 🎀"
                message={`하은님의 소중한 물건이 <br/>성공적으로 등록되었습니다! ✨`}
                icon={ShoppingBag}
                buttonText="목록으로 이동"
            />
        </div>
    );
};

export default WriteUsed;
