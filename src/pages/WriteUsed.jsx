import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Clock, X } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteUsed = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        displayPrice: '',
        location: '',
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

    const isFormValid = formData.title && formData.price && formData.description && formData.location;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>중고거래 글쓰기</h1>
                <div style={{ width: 24 }}></div> {/* Space holder */}
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
                        <span className="currency-label">유로</span>
                    </div>
                </div>

                <div className="form-group transaction-group">
                    <label>거래 정보</label>
                    <div className="transaction-cards-input">
                        <div className="input-with-icon">
                            <MapPin size={18} className="field-icon" />
                            <input
                                type="text"
                                className="input-field no-border"
                                placeholder="선호하는 거래 위치를 입력해주세요"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="input-divider"></div>
                        <div className="input-with-icon">
                            <Clock size={18} className="field-icon" />
                            <input
                                type="text"
                                className="input-field no-border"
                                placeholder="선호하는 거래 시간을 입력해주세요"
                                value={formData.tradeTime}
                                onChange={(e) => setFormData({ ...formData, tradeTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

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
                    <button className="submit-btn-bottom" disabled={!isFormValid}>
                        작성 완료
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WriteUsed;
