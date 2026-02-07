import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteTutoring = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        pay: '',
        description: '',
    });

    const isFormValid = formData.title && formData.subject && formData.description;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>과외/레슨 글쓰기</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content">
                <div className="form-group">
                    <label>레슨 제목</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="레슨/과외 제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>과목/분야</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 프랑스어 회화, 초등 수학"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>레슨비 정보</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 시급 30유로, 회당 상의"
                        value={formData.pay}
                        onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>레슨 상세 설명</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="커리큘럼, 대상 학생 등을 설명해주세요!"
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

export default WriteTutoring;
