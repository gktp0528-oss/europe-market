import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteMeetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const countryCode = queryParams.get('country') || 'FR';

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        members: '',
        description: '',
    });

    const isFormValid = formData.title && formData.date && formData.description;

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
                        placeholder="어떤 모임인가요? 모임 장소 등을 적어주세요!"
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

export default WriteMeetup;
