import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import '../styles/WriteForm.css';

const WriteJob = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        pay: '',
        time: '',
        description: '',
    });

    const isFormValid = formData.title && formData.pay && formData.description;

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>알바/구인 글쓰기</h1>
                <button className="submit-btn" disabled={!isFormValid}>완료</button>
            </header>

            <div className="write-content">
                <div className="form-group">
                    <label>공고 제목</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="구인 제목을 입력해주세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>급여 정보</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 시급 12유로, 일당 100유로"
                        value={formData.pay}
                        onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>근무 시간</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="예: 매주 토,일 10:00~15:00"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>상세 내용</label>
                    <textarea
                        className="input-field textarea-field"
                        placeholder="하는 일, 자격 요건 등을 자세히 적어주세요!"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default WriteJob;
