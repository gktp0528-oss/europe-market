import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Sparkles, ArrowLeft } from 'lucide-react-native';

const Login = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('알림', '이메일과 비밀번호를 모두 입력해주세요! ✨');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // 로그인 성공 시 AuthContext가 자동으로 상태 변경
        } catch (error) {
            Alert.alert('로그인 실패', '이메일이나 비밀번호를 다시 확인해주세요. 😭');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.inner}>
                {/* Header */}
                {navigation.canGoBack() && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                )}

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.chip}>
                        <Sparkles size={14} color="#FFB7B2" />
                        <Text style={styles.chipText}>유럽 한인 커뮤니티</Text>
                    </View>
                    <Text style={styles.title}>다시 오신 걸{"\n"}환영해요! 😍</Text>
                    <Text style={styles.subtitle}>로그인하고 따끈따끈한 소식을 확인해보세요.</Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>이메일</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={20} color="#9B9B9B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="example@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9B9B9B"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>비밀번호</Text>
                        <View style={styles.inputWrapper}>
                            <Lock size={20} color="#9B9B9B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호 입력"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#9B9B9B"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, (!email || !password) && styles.disabledBtn]}
                        onPress={handleLogin}
                        disabled={loading || !email || !password}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>로그인하기 ✨</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.footerText}>
                            계정이 없으신가요? <Text style={styles.linkText}>회원가입</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    inner: {
        flex: 1,
        padding: 24,
    },
    backBtn: {
        marginTop: 10,
        marginBottom: 30,
    },
    hero: {
        marginBottom: 40,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFB7B222',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    chipText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '700',
        color: '#FFB7B2',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#4A4A4A',
        lineHeight: 36,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#9B9B9B',
        lineHeight: 22,
    },
    form: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A4A4A',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 15,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#4A4A4A',
    },
    submitBtn: {
        backgroundColor: '#FFB7B2',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#FFB7B2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledBtn: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
    },
    submitText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    footerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#9B9B9B',
    },
    linkText: {
        color: '#FFB7B2',
        fontWeight: '700',
    },
});

export default Login;
