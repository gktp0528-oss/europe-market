import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, BookOpen } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';

const WriteTutoringScreen = ({ navigation, route }) => {
    const editPost = route.params?.editPost;
    const isEditMode = !!editPost;
    const { user } = useAuth();
    const { selectedCountry } = useCountry();
    const countryCode = selectedCountry?.code || 'FR';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [tutoringType, setTutoringType] = useState('tutoring');
    const [gender, setGender] = useState('male');

    const [formData, setFormData] = useState({
        title: editPost?.title || '',
        subject: editPost?.metadata?.subject || '',
        location: editPost?.location || '',
        locationData: editPost?.latitude ? { address: editPost.location, lat: editPost.latitude, lng: editPost.longitude } : null,
        description: editPost?.description ? (editPost.description.split('\n\n').slice(1).join('\n\n') || editPost.description) : '',
    });

    useEffect(() => {
        if (isEditMode) {
            setTutoringType(editPost.metadata?.tutoringType || 'tutoring');
            setGender(editPost.metadata?.gender || 'male');
        }
    }, [isEditMode, editPost]);

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleTypeChange = (type) => {
        setTutoringType(type);
        setFormData(prev => ({ ...prev, title: '', subject: '', description: '' }));
    };

    const handleLocationSelect = (data) => {
        setFormData(prev => ({ ...prev, location: data.address, locationData: data }));
        setShowLocationPicker(false);
    };

    const isFormValid = formData.title && formData.subject && formData.description && formData.location;

    const labels = {
        title: tutoringType === 'tutoring' ? '과외 제목' : '레슨 제목',
        subject: tutoringType === 'tutoring' ? '과목' : '분야/악기',
        location: tutoringType === 'tutoring' ? '활동 지역' : '레슨 장소',
        description: tutoringType === 'tutoring' ? '선생님 소개 & 수업 방식' : '레슨 커리큘럼 & 소개',
        placeholder: {
            title: tutoringType === 'tutoring' ? '예: 초등 수학 꼼꼼하게 봐드립니다' : '예: 취미 피아노 레슨합니다',
            subject: tutoringType === 'tutoring' ? '예: 수학, 영어, 프랑스어' : '예: 피아노, 요가, 보컬',
            description: tutoringType === 'tutoring'
                ? '학력, 경력, 수업 방식 등을 자세히 적어주세요.'
                : '레슨 경력, 커리큘럼, 대상 수강생 등을 적어주세요.',
        },
    };

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;
        if (!user) { Alert.alert('알림', '로그인이 필요합니다.'); return; }

        setIsSubmitting(true);
        try {
            const postData = {
                category: 'tutoring',
                title: formData.title,
                price: editPost?.price || '수업료 협의',
                location: formData.location,
                latitude: formData.locationData?.lat,
                longitude: formData.locationData?.lng,
                description: `[${tutoringType === 'tutoring' ? '과외' : '레슨'}] ${tutoringType === 'tutoring' ? '과목' : '분야'}: ${formData.subject}\n\n${formData.description}`,
                country_code: countryCode,
                image_urls: editPost?.image_urls || [],
                user_id: user.id,
                metadata: {
                    subject: formData.subject,
                    tutoringType,
                    gender,
                },
            };

            if (isEditMode) {
                const { error } = await supabase.from('posts').update(postData).eq('id', editPost.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('posts').insert({
                    ...postData,
                    views: 0,
                    likes: 0,
                    color: '#F5F5F5',
                });
                if (error) throw error;
            }

            setShowSuccess(true);
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('오류', '처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {tutoringType === 'tutoring' ? '과외 구하기' : '레슨 모집'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    {/* Type Toggle */}
                    <View style={styles.segmentRow}>
                        <TouchableOpacity
                            style={[styles.segment, tutoringType === 'tutoring' && styles.segmentActive]}
                            onPress={() => handleTypeChange('tutoring')}
                        >
                            <Text style={[styles.segmentText, tutoringType === 'tutoring' && styles.segmentTextActive]}>
                                과외
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segment, tutoringType === 'lesson' && styles.segmentActive]}
                            onPress={() => handleTypeChange('lesson')}
                        >
                            <Text style={[styles.segmentText, tutoringType === 'lesson' && styles.segmentTextActive]}>
                                레슨
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gender Toggle */}
                    <View style={[styles.segmentRow, { marginTop: 12 }]}>
                        <TouchableOpacity
                            style={[styles.segment, gender === 'male' && styles.segmentActive]}
                            onPress={() => setGender('male')}
                        >
                            <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>
                                남자 선생님
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segment, gender === 'female' && styles.segmentActive]}
                            onPress={() => setGender('female')}
                        >
                            <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>
                                여자 선생님
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>{labels.title}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={labels.placeholder.title}
                        placeholderTextColor="#C0C0C0"
                        value={formData.title}
                        onChangeText={(v) => updateField('title', v)}
                        maxLength={100}
                    />

                    <Text style={styles.label}>{labels.subject}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={labels.placeholder.subject}
                        placeholderTextColor="#C0C0C0"
                        value={formData.subject}
                        onChangeText={(v) => updateField('subject', v)}
                        maxLength={50}
                    />

                    <Text style={styles.label}>{labels.location}</Text>
                    <TouchableOpacity style={styles.locationBtn} onPress={() => setShowLocationPicker(true)}>
                        <MapPin size={18} color="#B5EAD7" />
                        <Text style={[styles.locationText, !formData.location && { color: '#C0C0C0' }]}>
                            {formData.location || '위치를 선택해주세요'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>{labels.description}</Text>
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder={labels.placeholder.description}
                        placeholderTextColor="#C0C0C0"
                        value={formData.description}
                        onChangeText={(v) => updateField('description', v)}
                        multiline
                        textAlignVertical="top"
                        maxLength={2000}
                    />

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.submitBtn, (!isFormValid || isSubmitting) && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>{isEditMode ? '수정 완료' : '작성 완료'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <LocationPicker
                visible={showLocationPicker}
                countryCode={countryCode}
                onSelect={handleLocationSelect}
                onClose={() => setShowLocationPicker(false)}
            />

            <SuccessModal
                visible={showSuccess}
                onClose={() => { setShowSuccess(false); navigation.goBack(); }}
                title={isEditMode ? "수정 완료!" : `${tutoringType === 'tutoring' ? '과외' : '레슨'} 등록 완료!`}
                message={isEditMode ? `공고 내용이\n성공적으로 수정되었습니다!` : `${tutoringType === 'tutoring' ? '과외' : '레슨'} 공고가\n성공적으로 등록되었습니다!`}
                Icon={BookOpen}
                iconColor="#B5EAD7"
                buttonText="목록으로 이동"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#4A4A4A' },
    content: { flex: 1, padding: 20 },
    segmentRow: { flexDirection: 'row', gap: 8, backgroundColor: '#F8F8F8', borderRadius: 14, padding: 4 },
    segment: {
        flex: 1, paddingVertical: 12, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    segmentActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    segmentText: { fontSize: 14, fontWeight: '600', color: '#9B9B9B' },
    segmentTextActive: { color: '#4A4A4A' },
    label: { fontSize: 14, fontWeight: '700', color: '#4A4A4A', marginBottom: 8, marginTop: 20 },
    input: {
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#4A4A4A',
    },
    textarea: { height: 180, textAlignVertical: 'top' },
    locationBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    },
    locationText: { fontSize: 15, color: '#4A4A4A', flex: 1 },
    bottomBar: {
        padding: 16, paddingBottom: 30,
        borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff',
    },
    submitBtn: {
        backgroundColor: '#B5EAD7', height: 52, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    headerActions: { flexDirection: 'row', gap: 10 },
});

export default WriteTutoringScreen;
