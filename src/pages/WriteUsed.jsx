import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteUsed = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
    });

    const isFormValid = formData.title && formData.price && formData.description;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>중고거래 글쓰기</h1>
                <button className="submit-btn" disabled={!isFormValid}>완료</button>
            </header>

            <div className="write-content">
                <div className="image-upload-section">
                    <div className="image-upload-box">
                        <Camera size={24} />
                        <span>0/10</span>
                    </div>
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
                            type="number"
                            className="input-field"
                            placeholder="가격을 입력해주세요"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <span className="currency-label">유로</span>
                    </div>
                </div>

                <div className="form-group">
                    <label>설명</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="게시글 내용을 작성해주세요. (판매 금지 물품은 게시가 제한될 수 있어요)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default WriteUsed;
