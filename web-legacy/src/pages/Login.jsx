import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;

        setErrorMessage('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            navigate('/'); // Go home after login
        } catch (error) {
            setErrorMessage('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-login-page">
            <div className="auth-bg-orb auth-bg-orb-left" />
            <div className="auth-bg-orb auth-bg-orb-right" />

            <header className="auth-header">
                <button className="auth-back-btn" onClick={() => navigate(-1)} aria-label="뒤로 가기">
                    <ArrowLeft size={20} />
                </button>
            </header>

            <main className="auth-content">
                <section className="auth-hero">
                    <span className="auth-chip">
                        <Sparkles size={14} />
                        유럽 한인 커뮤니티
                    </span>
                    <h1>다시 오신 걸 환영해요</h1>
                    <p>로그인하고 중고거래, 알바, 모임 소식을 확인해보세요.</p>
                </section>

                <section className="auth-card">
                    <form onSubmit={handleLogin} className="auth-form" noValidate>
                        <div className="auth-field-group">
                            <label htmlFor="login-email">이메일</label>
                            <div className="auth-input-shell">
                                <Mail size={18} className="auth-field-icon" />
                                <input
                                    id="login-email"
                                    type="email"
                                    className="auth-input"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="auth-field-group">
                            <label htmlFor="login-password">비밀번호</label>
                            <div className="auth-input-shell">
                                <Lock size={18} className="auth-field-icon" />
                                <input
                                    id="login-password"
                                    type="password"
                                    className="auth-input"
                                    placeholder="비밀번호 입력"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="auth-error" role="alert">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading || !formData.email || !formData.password}
                        >
                            {loading ? '로그인 중...' : '로그인하기'}
                        </button>

                        <p className="auth-footer-text">
                            계정이 없으신가요? <Link to="/signup" className="auth-link">회원가입</Link>
                        </p>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default Login;
