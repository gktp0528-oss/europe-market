import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Briefcase } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';
import ImagePickerGrid from '../components/ImagePickerGrid';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';
import { uploadImages } from '../utils/imageUpload';

const PAY_TYPES = ['시급', '일급', '월급', '협의'];
const WORK_DAYS = ['월', '화', '수', '목', '금', '토', '일', '무관'];

const WriteJobScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { selectedCountry } = useCountry();
    const countryCode = selectedCountry?.code || 'FR';

    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        payType: '시급',
        payAmount: '',
        workDays: [],
        workTimeStart: '',
        workTimeEnd: '',
        location: '',
        locationData: null,
        description: '',
        requirements: '',
    });

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const toggleWorkDay = (day) => {
        setFormData(prev => {
            if (day === '무관') {
                return { ...prev, workDays: prev.workDays.includes('무관') ? [] : ['무관'] };
            }
            const newDays = prev.workDays.filter(d => d !== '무관');
            if (newDays.includes(day)) {
                return { ...prev, workDays: newDays.filter(d => d !== day) };
            }
            return { ...prev, workDays: [...newDays, day] };
        });
    };

    const handleLocationSelect = (data) => {
        setFormData(prev => ({ ...prev, location: data.address, locationData: data }));
        setShowLocationPicker(false);
    };

    const isFormValid = formData.title && formData.description && formData.location &&
        formData.workDays.length > 0 &&
        (formData.workDays.includes('무관') || (formData.workTimeStart && formData.workTimeEnd));

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;
        if (!user) { Alert.alert('알림', '로그인이 필요합니다.'); return; }

        setIsSubmitting(true);
        try {
            const uploadedUrls = images.length > 0 ? await uploadImages(images, 'jobs') : [];

            const formattedPay = formData.payAmount
                ? `${formData.payType} ${formData.payAmount}€`
                : '급여 협의';

            const formattedTime = formData.workDays.includes('무관')
                ? '요일/시간 협의'
                : `${formData.workDays.join(',')} ${formData.workTimeStart}~${formData.workTimeEnd}`;

            const fullDescription = formData.requirements
                ? `[자격요건]\n${formData.requirements}\n\n[상세내용]\n${formData.description}`
                : formData.description;

            const { error } = await supabase.from('posts').insert({
                category: 'job',
                title: formData.title,
                price: formattedPay,
                location: formData.location,
                latitude: formData.locationData?.lat,
                longitude: formData.locationData?.lng,
                description: fullDescription,
                trade_time: formattedTime,
                country_code: countryCode,
                image_urls: uploadedUrls,
                views: 0, likes: 0,
                color: '#FFF9C4',
                user_id: user.id,
                metadata: {
                    pay_type: formData.payType,
                    work_time: formattedTime,
                },
            });

            if (error) throw error;
            setShowSuccess(true);
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('오류', '등록 중 오류가 발생했습니다.');
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
                <Text style={styles.headerTitle}>알바/구인 글쓰기</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <ImagePickerGrid images={images} setImages={setImages} />

                    <Text style={styles.label}>공고 제목</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="가게명 + 구인 포지션 (예: 서울식당 주방보조)"
                        placeholderTextColor="#C0C0C0"
                        value={formData.title}
                        onChangeText={(v) => updateField('title', v)}
                        maxLength={100}
                    />

                    <Text style={styles.label}>급여 정보</Text>
                    <View style={styles.payTypeRow}>
                        {PAY_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.chip, formData.payType === type && styles.chipActive]}
                                onPress={() => updateField('payType', type)}
                            >
                                <Text style={[styles.chipText, formData.payType === type && styles.chipTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {formData.payType !== '협의' && (
                        <View style={styles.payAmountRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="금액 입력"
                                placeholderTextColor="#C0C0C0"
                                value={formData.payAmount}
                                onChangeText={(v) => updateField('payAmount', v.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                            />
                            <View style={styles.currencyBadge}>
                                <Text style={styles.currencyText}>€</Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.label}>근무 위치</Text>
                    <TouchableOpacity style={styles.locationBtn} onPress={() => setShowLocationPicker(true)}>
                        <MapPin size={18} color="#FFB7B2" />
                        <Text style={[styles.locationText, !formData.location && { color: '#C0C0C0' }]}>
                            {formData.location || '근무지 위치 선택'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>근무 요일</Text>
                    <View style={styles.daysRow}>
                        {WORK_DAYS.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayChip, formData.workDays.includes(day) && styles.dayChipActive]}
                                onPress={() => toggleWorkDay(day)}
                            >
                                <Text style={[styles.dayChipText, formData.workDays.includes(day) && styles.dayChipTextActive]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {!formData.workDays.includes('무관') && formData.workDays.length > 0 && (
                        <>
                            <Text style={styles.label}>근무 시간</Text>
                            <View style={styles.timeRow}>
                                <View style={styles.timeBox}>
                                    <Clock size={16} color="#FFB7B2" />
                                    <TextInput
                                        style={styles.timeInput}
                                        placeholder="시작 (예: 09:00)"
                                        placeholderTextColor="#C0C0C0"
                                        value={formData.workTimeStart}
                                        onChangeText={(v) => updateField('workTimeStart', v)}
                                    />
                                </View>
                                <Text style={styles.tilde}>~</Text>
                                <View style={styles.timeBox}>
                                    <TextInput
                                        style={styles.timeInput}
                                        placeholder="종료 (예: 18:00)"
                                        placeholderTextColor="#C0C0C0"
                                        value={formData.workTimeEnd}
                                        onChangeText={(v) => updateField('workTimeEnd', v)}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    <Text style={styles.label}>자격 요건</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 한국어 능통, 경력 6개월 이상"
                        placeholderTextColor="#C0C0C0"
                        value={formData.requirements}
                        onChangeText={(v) => updateField('requirements', v)}
                        maxLength={500}
                    />

                    <Text style={styles.label}>상세 내용</Text>
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="업무 내용, 복리후생, 근무 분위기 등을 자유롭게 적어주세요."
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
                        <Text style={styles.submitBtnText}>구인 공고 올리기</Text>
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
                title="등록 완료!"
                message={`구인 공고가\n성공적으로 등록되었습니다!`}
                Icon={Briefcase}
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
    label: { fontSize: 14, fontWeight: '700', color: '#4A4A4A', marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#4A4A4A',
    },
    textarea: { height: 150, textAlignVertical: 'top' },
    payTypeRow: { flexDirection: 'row', gap: 8 },
    payAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    currencyBadge: {
        backgroundColor: '#FFB7B215', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14,
    },
    currencyText: { fontSize: 15, fontWeight: '700', color: '#FFB7B2' },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0',
    },
    chipActive: { backgroundColor: '#FFB7B2', borderColor: '#FFB7B2' },
    chipText: { fontSize: 13, color: '#9B9B9B', fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    locationBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    },
    locationText: { fontSize: 15, color: '#4A4A4A', flex: 1 },
    daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    dayChip: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
        backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0',
    },
    dayChipActive: { backgroundColor: '#FFB7B2', borderColor: '#FFB7B2' },
    dayChipText: { fontSize: 13, color: '#9B9B9B', fontWeight: '600' },
    dayChipTextActive: { color: '#fff' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    timeBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12,
    },
    timeInput: { flex: 1, fontSize: 14, color: '#4A4A4A' },
    tilde: { fontSize: 16, color: '#9B9B9B' },
    bottomBar: {
        padding: 16, paddingBottom: 30,
        borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff',
    },
    submitBtn: {
        backgroundColor: '#FFB7B2', height: 52, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default WriteJobScreen;
