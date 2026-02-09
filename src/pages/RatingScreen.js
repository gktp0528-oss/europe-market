import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const RatingScreen = ({ navigation, route }) => {
    const { transactionId, rateeId, username } = route.params || {};
    const [score, setScore] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const { error } = await supabase.rpc('submit_profile_rating', {
                p_transaction_id: transactionId,
                p_ratee_id: rateeId,
                p_score: score,
                p_comment: comment
            });

            if (error) throw error;

            Alert.alert('성공', '소중한 후기가 성공적으로 등록되었습니다! ✨', [
                { text: '확인', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error('Submit rating error:', err);
            Alert.alert('오류', err.message || '후기 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>별점 남기기</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        <Text style={styles.username}>{username}</Text>님과의 이용은 어떠셨나요?
                    </Text>
                </View>

                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <TouchableOpacity key={s} onPress={() => setScore(s)} style={styles.starBtn}>
                            <Star
                                size={40}
                                color={s <= score ? "#FFB7B2" : "#E0E0E0"}
                                fill={s <= score ? "#FFB7B2" : "transparent"}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.scoreText}>{score}점</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>후기 남기기 (선택)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이용한 경험을 공유해주세요 (최대 100자)"
                        placeholderTextColor="#9B9B9B"
                        value={comment}
                        onChangeText={setComment}
                        maxLength={100}
                        multiline
                    />
                    <Text style={[styles.charCount, comment.length >= 100 && { color: '#FFB7B2' }]}>
                        {comment.length}/100
                    </Text>
                </View>
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={20}
            >
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>등록하기</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#4A4A4A' },
    content: { padding: 24, alignItems: 'center' },
    infoBox: { marginBottom: 30, alignItems: 'center' },
    infoText: { fontSize: 18, color: '#4A4A4A', textAlign: 'center', lineHeight: 26 },
    username: { fontWeight: '800', color: '#FFB7B2' },
    starContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    starBtn: { padding: 8 },
    scoreText: { width: '100%', textAlign: 'center', fontSize: 24, fontWeight: '700', color: '#FFB7B2', marginTop: 10 },
    inputContainer: { width: '100%', marginTop: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#9B9B9B', marginBottom: 10 },
    input: {
        width: '100%', backgroundColor: '#F8F8F8', borderRadius: 12, padding: 16,
        fontSize: 15, color: '#4A4A4A', height: 120, textAlignVertical: 'top',
    },
    charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#9B9B9B', marginTop: 6 },
    submitBtn: {
        marginHorizontal: 24, marginBottom: 24, backgroundColor: '#FFB7B2',
        height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        shadowColor: "#FFB7B2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    submitBtnDisabled: { backgroundColor: '#FFD1CE' },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default RatingScreen;
