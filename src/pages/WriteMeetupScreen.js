import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft, MapPin, Calendar, Clock, Users, Tag, Globe, Monitor, CheckCircle
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCountry, SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import ImagePickerGrid from '../components/ImagePickerGrid';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';
import { uploadImages } from '../utils/imageUpload';

const MEETUP_TAGS = ['운동', '공부', '친목', '문화', '여행', '언어', '카페', '기타'];
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const REPEAT_CYCLES = ['매주', '격주', '매월'];
const TOTAL_STEPS = 3;
const STEP_LABELS = ['기본 정보', '일정 및 장소', '참여 조건'];

const WriteMeetupScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { selectedCountry } = useCountry();
    const countryCode = selectedCountry?.code || 'FR';
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[1];
    const currency = countryInfo.currencySymbol;

    const [step, setStep] = useState(1);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        meetupType: 'one-time',
        date: '',
        startTime: '',
        endTime: '',
        repeatDays: [],
        repeatCycle: '매주',
        isFree: true,
        fee: '',
        members: '',
        location: '',
        locationData: null,
        onOffline: 'offline',
        description: '',
        tags: [],
        approvalType: 'first-come',
    });

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
        }));
    };

    const toggleRepeatDay = (day) => {
        setFormData(prev => ({
            ...prev,
            repeatDays: prev.repeatDays.includes(day)
                ? prev.repeatDays.filter(d => d !== day)
                : [...prev.repeatDays, day],
        }));
    };

    const handleLocationSelect = (data) => {
        setFormData(prev => ({ ...prev, location: data.address, locationData: data }));
        setShowLocationPicker(false);
    };

    const handleFeeChange = (value) => {
        const num = value.replace(/[^0-9]/g, '');
        updateField('fee', num ? Number(num).toLocaleString() : '');
    };

    // Validation
    const isStep1Valid = formData.title && formData.tags.length > 0;
    const isStep2Valid =
        (formData.meetupType === 'one-time' ? formData.date : formData.repeatDays.length > 0) &&
        formData.startTime && formData.endTime && formData.location;
    const isStep3Valid = formData.members && (formData.isFree || formData.fee) && formData.description;
    const isSubmitValid = isStep1Valid && isStep2Valid && isStep3Valid;

    const nextStep = () => { if (step < TOTAL_STEPS) setStep(step + 1); };
    const prevStep = () => { if (step > 1) setStep(step - 1); else navigation.goBack(); };

    const handleSubmit = async () => {
        if (!isSubmitValid || isSubmitting) return;
        if (!user) { Alert.alert('알림', '로그인이 필요합니다.'); return; }

        setIsSubmitting(true);
        try {
            const uploadedUrls = images.length > 0 ? await uploadImages(images, 'meetups') : [];

            const formattedFee = formData.isFree ? '무료' : `${formData.fee}${currency}`;
            const formattedDate = formData.meetupType === 'one-time'
                ? `${formData.date} ${formData.startTime}`
                : `${formData.repeatDays.join(', ')} ${formData.startTime}`;

            const { error } = await supabase.from('posts').insert({
                category: 'meetup',
                title: formData.title,
                price: formattedFee,
                trade_time: formattedDate,
                location: formData.location,
                latitude: formData.locationData?.lat,
                longitude: formData.locationData?.lng,
                description: formData.description,
                country_code: countryCode,
                image_urls: uploadedUrls,
                views: 0, likes: 0,
                color: '#E0F7FA',
                user_id: user.id,
                metadata: {
                    tags: formData.tags,
                    onOffline: formData.onOffline,
                    approvalType: formData.approvalType,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    isFree: formData.isFree,
                    members: formData.members,
                    meetupType: formData.meetupType,
                    date: formData.date,
                    repeatDays: formData.repeatDays,
                    repeatCycle: formData.repeatCycle,
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

    const renderStep1 = () => (
        <View>
            <ImagePickerGrid images={images} setImages={setImages} />

            <Text style={styles.label}>모임 제목</Text>
            <TextInput
                style={styles.input}
                placeholder="어떤 모임인지 한눈에 알 수 있게 적어주세요"
                placeholderTextColor="#C0C0C0"
                value={formData.title}
                onChangeText={(v) => updateField('title', v)}
                maxLength={100}
            />

            <Text style={styles.label}>
                <Tag size={14} color="#C3B1E1" /> 모임 성격 (멀티 선택 가능)
            </Text>
            <View style={styles.tagGrid}>
                {MEETUP_TAGS.map(tag => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tagChip, formData.tags.includes(tag) && styles.tagChipActive]}
                        onPress={() => toggleTag(tag)}
                    >
                        <Text style={[styles.tagChipText, formData.tags.includes(tag) && styles.tagChipTextActive]}>
                            {tag}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={styles.label}>모임 일시</Text>
            <View style={styles.segmentRow}>
                <TouchableOpacity
                    style={[styles.segment, formData.meetupType === 'one-time' && styles.segmentActive]}
                    onPress={() => updateField('meetupType', 'one-time')}
                >
                    <Text style={[styles.segmentText, formData.meetupType === 'one-time' && styles.segmentTextActive]}>
                        한 번만 만나요
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, formData.meetupType === 'recurring' && styles.segmentActive]}
                    onPress={() => updateField('meetupType', 'recurring')}
                >
                    <Text style={[styles.segmentText, formData.meetupType === 'recurring' && styles.segmentTextActive]}>
                        정기 모임
                    </Text>
                </TouchableOpacity>
            </View>

            {formData.meetupType === 'one-time' ? (
                <View style={[styles.dateBox, { marginTop: 12 }]}>
                    <Calendar size={18} color="#C3B1E1" />
                    <TextInput
                        style={styles.dateInput}
                        placeholder="날짜 입력 (예: 2026-03-15)"
                        placeholderTextColor="#C0C0C0"
                        value={formData.date}
                        onChangeText={(v) => updateField('date', v)}
                    />
                </View>
            ) : (
                <View style={{ marginTop: 12 }}>
                    <View style={styles.daysRow}>
                        {WEEK_DAYS.map(day => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayChip, formData.repeatDays.includes(day) && styles.dayChipActiveMeetup]}
                                onPress={() => toggleRepeatDay(day)}
                            >
                                <Text style={[styles.dayChipText, formData.repeatDays.includes(day) && styles.dayChipTextActive]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.segmentRow, { marginTop: 12 }]}>
                        {REPEAT_CYCLES.map(cycle => (
                            <TouchableOpacity
                                key={cycle}
                                style={[styles.segment, formData.repeatCycle === cycle && styles.segmentActive]}
                                onPress={() => updateField('repeatCycle', cycle)}
                            >
                                <Text style={[styles.segmentText, formData.repeatCycle === cycle && styles.segmentTextActive]}>
                                    {cycle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View style={[styles.timeRow, { marginTop: 16 }]}>
                <View style={styles.timeBox}>
                    <Clock size={16} color="#C3B1E1" />
                    <TextInput
                        style={styles.timeInput}
                        placeholder="시작 (예: 14:00)"
                        placeholderTextColor="#C0C0C0"
                        value={formData.startTime}
                        onChangeText={(v) => updateField('startTime', v)}
                    />
                </View>
                <Text style={styles.tilde}>~</Text>
                <View style={styles.timeBox}>
                    <Clock size={16} color="#C3B1E1" />
                    <TextInput
                        style={styles.timeInput}
                        placeholder="종료 (예: 17:00)"
                        placeholderTextColor="#C0C0C0"
                        value={formData.endTime}
                        onChangeText={(v) => updateField('endTime', v)}
                    />
                </View>
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>모임 방식</Text>
            <View style={styles.segmentRow}>
                <TouchableOpacity
                    style={[styles.segment, formData.onOffline === 'offline' && styles.segmentActive]}
                    onPress={() => updateField('onOffline', 'offline')}
                >
                    <View style={styles.segmentInner}>
                        <Globe size={16} color={formData.onOffline === 'offline' ? '#4A4A4A' : '#9B9B9B'} />
                        <Text style={[styles.segmentText, formData.onOffline === 'offline' && styles.segmentTextActive]}>
                            오프라인
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, formData.onOffline === 'online' && styles.segmentActive]}
                    onPress={() => {
                        updateField('onOffline', 'online');
                        updateField('location', '온라인 (상세 내용 참고)');
                    }}
                >
                    <View style={styles.segmentInner}>
                        <Monitor size={16} color={formData.onOffline === 'online' ? '#4A4A4A' : '#9B9B9B'} />
                        <Text style={[styles.segmentText, formData.onOffline === 'online' && styles.segmentTextActive]}>
                            온라인
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>
                {formData.onOffline === 'offline' ? '모임 장소' : '온라인 링크 또는 참여 방법'}
            </Text>
            {formData.onOffline === 'offline' ? (
                <TouchableOpacity style={styles.locationBtn} onPress={() => setShowLocationPicker(true)}>
                    <MapPin size={18} color="#C3B1E1" />
                    <Text style={[styles.locationText, !formData.location && { color: '#C0C0C0' }]}>
                        {formData.location || '모임 장소를 선택해주세요'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TextInput
                    style={styles.input}
                    placeholder="구글 미트 링크, 줌 회의 ID 등을 입력해주세요"
                    placeholderTextColor="#C0C0C0"
                    value={formData.location === '온라인 (상세 내용 참고)' ? '' : formData.location}
                    onChangeText={(v) => updateField('location', v)}
                />
            )}
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text style={styles.label}>모집 인원</Text>
            <View style={styles.dateBox}>
                <Users size={18} color="#C3B1E1" />
                <TextInput
                    style={styles.dateInput}
                    placeholder="최대 참여 가능 인원 (숫자)"
                    placeholderTextColor="#C0C0C0"
                    value={formData.members}
                    onChangeText={(v) => updateField('members', v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                />
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>참가비</Text>
            <View style={styles.segmentRow}>
                <TouchableOpacity
                    style={[styles.segment, formData.isFree && styles.segmentActive]}
                    onPress={() => { updateField('isFree', true); updateField('fee', ''); }}
                >
                    <Text style={[styles.segmentText, formData.isFree && styles.segmentTextActive]}>무료</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, !formData.isFree && styles.segmentActive]}
                    onPress={() => updateField('isFree', false)}
                >
                    <Text style={[styles.segmentText, !formData.isFree && styles.segmentTextActive]}>유료 (회비 있음)</Text>
                </TouchableOpacity>
            </View>
            {!formData.isFree && (
                <View style={[styles.priceRow, { marginTop: 12 }]}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="금액 입력"
                        placeholderTextColor="#C0C0C0"
                        value={formData.fee}
                        onChangeText={handleFeeChange}
                        keyboardType="number-pad"
                    />
                    <View style={styles.currencyBadge}>
                        <Text style={styles.currencyText}>{currency}</Text>
                    </View>
                </View>
            )}

            <Text style={[styles.label, { marginTop: 20 }]}>참여 승인 방식</Text>
            <View style={styles.segmentRow}>
                <TouchableOpacity
                    style={[styles.segment, formData.approvalType === 'first-come' && styles.segmentActive]}
                    onPress={() => updateField('approvalType', 'first-come')}
                >
                    <Text style={[styles.segmentText, formData.approvalType === 'first-come' && styles.segmentTextActive]}>
                        선착순 마감
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, formData.approvalType === 'approval' && styles.segmentActive]}
                    onPress={() => updateField('approvalType', 'approval')}
                >
                    <Text style={[styles.segmentText, formData.approvalType === 'approval' && styles.segmentTextActive]}>
                        호스트 승인제
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.infoBox}>
                <CheckCircle size={16} color="#C3B1E1" />
                <Text style={styles.infoText}>
                    {formData.approvalType === 'first-come'
                        ? '신청 즉시 바로 참여가 확정됩니다.'
                        : '호스트가 신청서 확인 후 수락해야 참여가 확정됩니다.'}
                </Text>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>모임 상세 내용</Text>
            <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="어떤 모임인가요? 준비물이나 상세 일정이 있다면 적어주세요!"
                placeholderTextColor="#C0C0C0"
                value={formData.description}
                onChangeText={(v) => updateField('description', v)}
                multiline
                textAlignVertical="top"
                maxLength={2000}
            />
        </View>
    );

    const isNextDisabled = (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={prevStep} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>모임 글쓰기</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.stepInfo}>
                    <Text style={styles.currentStep}>{step}/{TOTAL_STEPS} 단계</Text>
                    <Text style={styles.stepLabel}>{STEP_LABELS[step - 1]}</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomBar}>
                {step < TOTAL_STEPS ? (
                    <TouchableOpacity
                        style={[styles.submitBtn, styles.meetupBtn, isNextDisabled && styles.submitBtnDisabled]}
                        onPress={nextStep}
                        disabled={isNextDisabled}
                    >
                        <Text style={styles.submitBtnText}>다음으로 ({step}/{TOTAL_STEPS})</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.submitBtn, styles.meetupBtn, (!isSubmitValid || isSubmitting) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!isSubmitValid || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>모임 만들기</Text>
                        )}
                    </TouchableOpacity>
                )}
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
                title="모임 생성 완료!"
                message={`새로운 모임이\n성공적으로 만들어졌습니다!`}
                Icon={Users}
                iconColor="#C3B1E1"
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
    progressContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    stepInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    currentStep: { fontSize: 13, fontWeight: '700', color: '#C3B1E1' },
    stepLabel: { fontSize: 13, color: '#9B9B9B' },
    progressBarBg: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: '#C3B1E1', borderRadius: 2 },
    content: { flex: 1, padding: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#4A4A4A', marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#4A4A4A',
    },
    textarea: { height: 180, textAlignVertical: 'top' },
    tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
        backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0',
    },
    tagChipActive: { backgroundColor: '#C3B1E1', borderColor: '#C3B1E1' },
    tagChipText: { fontSize: 13, color: '#9B9B9B', fontWeight: '600' },
    tagChipTextActive: { color: '#fff' },
    segmentRow: { flexDirection: 'row', gap: 8, backgroundColor: '#F8F8F8', borderRadius: 14, padding: 4 },
    segment: {
        flex: 1, paddingVertical: 12, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    segmentActive: {
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    segmentInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    segmentText: { fontSize: 13, fontWeight: '600', color: '#9B9B9B' },
    segmentTextActive: { color: '#4A4A4A' },
    dateBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    },
    dateInput: { flex: 1, fontSize: 15, color: '#4A4A4A' },
    daysRow: { flexDirection: 'row', gap: 6 },
    dayChip: {
        flex: 1, paddingVertical: 10, borderRadius: 12,
        backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0',
        justifyContent: 'center', alignItems: 'center',
    },
    dayChipActiveMeetup: { backgroundColor: '#C3B1E1', borderColor: '#C3B1E1' },
    dayChipText: { fontSize: 13, color: '#9B9B9B', fontWeight: '600' },
    dayChipTextActive: { color: '#fff' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    timeBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12,
    },
    timeInput: { flex: 1, fontSize: 14, color: '#4A4A4A' },
    tilde: { fontSize: 16, color: '#9B9B9B' },
    locationBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    },
    locationText: { fontSize: 15, color: '#4A4A4A', flex: 1 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    currencyBadge: {
        backgroundColor: '#C3B1E115', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14,
    },
    currencyText: { fontSize: 15, fontWeight: '700', color: '#C3B1E1' },
    infoBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#C3B1E110', borderRadius: 12, padding: 12, marginTop: 12,
    },
    infoText: { fontSize: 12, color: '#8B6FB5', fontWeight: '500', flex: 1 },
    bottomBar: {
        padding: 16, paddingBottom: 30,
        borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff',
    },
    submitBtn: {
        height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    },
    meetupBtn: { backgroundColor: '#C3B1E1' },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default WriteMeetupScreen;
