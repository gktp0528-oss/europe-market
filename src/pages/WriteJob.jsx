import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, X, Clock } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';
import { Briefcase } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteJob = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Get country info for currency
    SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES.find(c => c.code === 'FR');

    const [formData, setFormData] = useState({
        title: '',
        payType: '시급',
        payAmount: '',
        workDays: [],
        workTimeStart: '',
        workTimeEnd: '',
        location: '',
        locationData: null,
        description: '',
        requirements: ''
    });

    const workDaysOptions = ['월', '화', '수', '목', '금', '토', '일', '무관'];

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

    const toggleWorkDay = (day) => {
        if (day === '무관') {
            setFormData(prev => ({
                ...prev,
                workDays: prev.workDays.includes('무관') ? [] : ['무관']
            }));
            return;
        }

        setFormData(prev => {
            const newDays = prev.workDays.includes('무관') ? [] : [...prev.workDays];
            if (newDays.includes(day)) {
                return { ...prev, workDays: newDays.filter(d => d !== day) };
            } else {
                return { ...prev, workDays: [...newDays, day] };
            }
        });
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
                const filePath = `jobs/${fileName}`;

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
            const formattedPay = "급여 협의";
            const formattedTime = formData.workDays.includes('무관')
                ? '요일/시간 협의'
                : `${formData.workDays.join(',')} ${formData.workTimeStart}~${formData.workTimeEnd}`;

            const fullDescription = `[자격요건]\n${formData.requirements}\n\n[상세내용]\n${formData.description}`;

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    category: 'job',
                    title: formData.title,
                    price: formattedPay,
                    location: formData.location,
                    latitude: formData.locationData?.lat,
                    longitude: formData.locationData?.lng,
                    description: fullDescription,
                    trade_time: formattedTime,
                    country_code: countryCode,
                    image_urls: uploadedUrls,
                    time_ago: '방금 전',
                    views: 0,
                    likes: 0,
                    color: '#FFF9C4', // Light yellow for jobs
                    user_id: user?.id
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

    const isFormValid = formData.title && formData.description && formData.location && (formData.workDays.length > 0) && (formData.workDays.includes('무관') || (formData.workTimeStart && formData.workTimeEnd));

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>알바/구인 글쓰기</h1>
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
                    <label>공고 제목</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="가게명 + 구인 포지션 (예: 서울식당 주방보조)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>


                <div className="form-group transaction-group">
                    <label>근무 조건</label>

                    {/* Location */}
                    <div className="input-with-icon" onClick={() => setShowLocationPicker(true)} style={{ cursor: 'pointer', marginBottom: '12px' }}>
                        <MapPin size={18} className="field-icon" />
                        <input
                            type="text"
                            className="input-field no-border"
                            placeholder="근무지 위치 선택"
                            value={formData.location}
                            readOnly
                            style={{ pointerEvents: 'none' }}
                        />
                    </div>

                    {/* Work Days */}
                    <div className="days-selector">
                        {workDaysOptions.map(day => (
                            <button
                                key={day}
                                className={`day-chip ${formData.workDays.includes(day) ? 'active' : ''}`}
                                onClick={() => toggleWorkDay(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Work Time */}
                    {!formData.workDays.includes('무관') && (
                        <div className="time-range-picker">
                            <div className="time-input-box">
                                <Clock size={16} />
                                <input
                                    type="time"
                                    value={formData.workTimeStart}
                                    onChange={(e) => setFormData({ ...formData, workTimeStart: e.target.value })}
                                />
                            </div>
                            <span className="tilde">~</span>
                            <div className="time-input-box">
                                <input
                                    type="time"
                                    value={formData.workTimeEnd}
                                    onChange={(e) => setFormData({ ...formData, workTimeEnd: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>자격 요건</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 한국어 능통, 경력 6개월 이상, 비자 소지자"
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="업무 내용, 복리후생, 근무 분위기 등을 자유롭게 적어주세요."
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
                        {isSubmitting ? '등록 중...' : '구인 공고 올리기'}
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
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => navigate('/category/jobs')}
                title="등록 완료! 💼"
                message={`하은님의 구인 공고가 <br/>성공적으로 등록되었습니다! ✨`}
                icon={Briefcase}
                buttonText="목록으로 이동"
            />
        </div>
    );
};

export default WriteJob;
