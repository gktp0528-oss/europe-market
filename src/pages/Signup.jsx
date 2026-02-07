import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import '../styles/WriteForm.css';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nickname: ''
    });

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.nickname) return;

        setLoading(true);
        try {
            // 1. Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nickname: formData.nickname,
                    },
                },
            });

            if (error) throw error;

            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            navigate('/login');

        } catch (error) {
            alert('회원가입 중 오류가 발생했습니다: ' + error.message);
            console.error('Signup error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>회원가입</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content" style={{ marginTop: '40px' }}>
                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label>닉네임</label>
                        <div className="input-with-icon">
                            <User size={20} className="field-icon" />
                            <input
                                type="text"
                                className="input-field no-border"
                                placeholder="사용할 닉네임을 입력하세요"
                                value={formData.nickname}
                                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>이메일</label>
                        <div className="input-with-icon">
                            <Mail size={20} className="field-icon" />
                            <input
                                type="email"
                                className="input-field no-border"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>비밀번호</label>
                        <div className="input-with-icon">
                            <Lock size={20} className="field-icon" />
                            <input
                                type="password"
                                className="input-field no-border"
                                placeholder="6자리 이상 입력"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="submit-container" style={{ marginTop: '40px' }}>
                        <button
                            type="submit"
                            className="submit-btn-bottom"
                            disabled={loading || !formData.email || !formData.password || !formData.nickname}
                        >
                            {loading ? '가입 중...' : '회원가입하기'}
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                        이미 계정이 있으신가요? <Link to="/login" style={{ color: '#E91E63', fontWeight: 'bold' }}>로그인</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
