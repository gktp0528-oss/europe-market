import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Camera, MapPin, Check } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';
import './WritePost.css';

const WritePost = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectedCountry } = useCountry();

    const initialCategory = searchParams.get('category') || 'clothes';

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(initialCategory);
    const [price, setPrice] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState([]);

    // Determine currency based on country
    const getCurrencySymbol = (code) => {
        switch (code) {
            case 'GB': return '£';
            case 'HU': return 'Ft';
            case 'CZ': return 'Kč';
            case 'PL': return 'zł';
            default: return '€';
        }
    };

    const currency = getCurrencySymbol(selectedCountry.code);

    const categories = [
        { id: 'clothes', label: '중고거래' },
        { id: 'jobs', label: '알바' },
        { id: 'tutoring', label: '과외/레슨' },
        { id: 'meetups', label: '모임' },
    ];

    const handleImageUpload = (e) => {
        // In a real app, logic to handle file upload
        // For now, adding a dummy image color block
        if (images.length < 10) {
            const newImage = {
                id: Date.now(),
                url: `https://via.placeholder.com/150?text=IMG${images.length + 1}`
            };
            setImages([...images, newImage]);
        }
    };

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleSubmit = () => {
        if (!title || !description) return;

        // Here you would send data to backend
        console.log({
            title, category, price: isFree ? 0 : price, description, location, images, country: selectedCountry.code
        });

        // Simulate success and go back
        alert('게시글이 등록되었습니다!');
        navigate(-1);
    };

    const isFormValid = title.length > 0 && description.length > 0 && (category !== 'meetups' ? (price.length > 0 || isFree) : true);

    return (
        <div className="write-container">
            {/* Header */}
            <header className="write-header">
                <button className="close-btn" onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
                <h1 className="header-title">글쓰기</h1>
                <button
                    className={`submit-btn ${isFormValid ? 'active' : ''}`}
                    disabled={!isFormValid}
                    onClick={handleSubmit}
                >
                    완료
                </button>
            </header>

            <div className="write-content">
                {/* Photo Section */}
                <div className="photo-section">
                    <button className="photo-add-btn" onClick={handleImageUpload}>
                        <Camera size={24} />
                        <span className="photo-count">{images.length}/10</span>
                    </button>

                    {images.map((img) => (
                        <div key={img.id} className="photo-preview">
                            <img src={img.url} alt="upload" />
                            <button className="photo-remove" onClick={() => removeImage(img.id)}>
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Title */}
                <div className="input-group">
                    <label className="input-label">제목</label>
                    <input
                        type="text"
                        className="text-input"
                        placeholder="글 제목을 입력해주세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Category */}
                <div className="input-group">
                    <label className="input-label">카테고리</label>
                    <div className="category-chips">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`category-chip ${category === cat.id ? 'selected' : ''}`}
                                onClick={() => setCategory(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price (Conditional based on category) */}
                {category !== 'meetups' && (
                    <div className="input-group">
                        <label className="input-label">
                            {category === 'jobs' ? '시급/급여' : '가격'}
                        </label>
                        <div className="price-input-wrapper">
                            <span className="currency-symbol">{currency}</span>
                            <input
                                type="number"
                                className="text-input"
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                disabled={isFree}
                            />
                        </div>
                        {category === 'clothes' && (
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={isFree}
                                    onChange={(e) => {
                                        setIsFree(e.target.checked);
                                        if (e.target.checked) setPrice('');
                                    }}
                                />
                                <span className="checkbox-label">나눔하기</span>
                            </label>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className="input-group">
                    <label className="input-label">내용</label>
                    <textarea
                        className="textarea-input"
                        placeholder={`게시올릴 내용을 상세하게 적어주세요.\n(판매 금지 물품은 게시가 제한될 수 있어요.)`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Location */}
                <div className="input-group">
                    <label className="input-label">거래 희망 장소</label>
                    <div className="location-input-wrapper">
                        <MapPin size={18} className="location-icon" />
                        <input
                            type="text"
                            className="text-input"
                            placeholder="장소를 입력해주세요 (선택)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WritePost;
