import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import '../styles/WriteForm.css'; // Reusing existing form styles

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            navigate('/'); // Go home after login
        } catch (error) {
            alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h1>로그인</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="write-content" style={{ marginTop: '40px' }}>
                <form onSubmit={handleLogin}>
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
                                placeholder="비밀번호 입력"
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
                            disabled={loading || !formData.email || !formData.password}
                        >
                            {loading ? '로그인 중...' : '로그인하기'}
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                        계정이 없으신가요? <Link to="/signup" style={{ color: '#E91E63', fontWeight: 'bold' }}>회원가입</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
