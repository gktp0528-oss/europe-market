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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const SignupScreen = ({ navigation }) => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const isFormValid =
        nickname.trim().length >= 2 &&
        email.trim().length > 0 &&
        password.length >= 6 &&
        password === passwordConfirm;

    const handleSignup = async () => {
        if (!isFormValid) {
            Alert.alert('입력 확인', '닉네임/이메일/비밀번호를 다시 확인해주세요.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: { nickname: nickname.trim() },
                },
            });

            if (error) throw error;

            if (data?.session) {
                Alert.alert('회원가입 완료', '바로 로그인되었습니다.');
            } else {
                Alert.alert(
                    '회원가입 완료',
                    '인증 메일을 확인한 뒤 로그인해주세요.',
                    [{ text: '확인', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert('회원가입 실패', error?.message || '잠시 후 다시 시도해주세요.');
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>

                <Text style={styles.title}>회원가입</Text>
                <Text style={styles.subtitle}>기본 정보만 입력하면 바로 시작할 수 있어요.</Text>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>닉네임</Text>
                        <View style={styles.inputWrapper}>
                            <User size={20} color="#9B9B9B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={nickname}
                                onChangeText={setNickname}
                                placeholder="닉네임"
                                placeholderTextColor="#9B9B9B"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>이메일</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={20} color="#9B9B9B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="example@email.com"
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
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholder="6자리 이상"
                                placeholderTextColor="#9B9B9B"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>비밀번호 확인</Text>
                        <View style={styles.inputWrapper}>
                            <Lock size={20} color="#9B9B9B" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={passwordConfirm}
                                onChangeText={setPasswordConfirm}
                                secureTextEntry
                                placeholder="비밀번호 재입력"
                                placeholderTextColor="#9B9B9B"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, !isFormValid && styles.disabledBtn]}
                        onPress={handleSignup}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>가입하기</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    inner: { flex: 1, padding: 24 },
    backBtn: { marginTop: 10, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '800', color: '#4A4A4A' },
    subtitle: { marginTop: 8, marginBottom: 24, fontSize: 15, color: '#9B9B9B' },
    form: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', color: '#4A4A4A', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 15,
        paddingHorizontal: 16,
    },
    icon: { marginRight: 12 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#4A4A4A' },
    submitBtn: {
        marginTop: 8,
        height: 52,
        borderRadius: 15,
        backgroundColor: '#FFB7B2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledBtn: {
        backgroundColor: '#E0E0E0',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
});

export default SignupScreen;
