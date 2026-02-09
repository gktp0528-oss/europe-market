import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, ShoppingBag } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCountry, SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import ImagePickerGrid from '../components/ImagePickerGrid';
import LocationPicker from '../components/LocationPicker';
import SuccessModal from '../components/SuccessModal';
import { uploadImages } from '../utils/imageUpload';

const TRADE_TIMES = ['오전', '오후', '저녁', '주말', '무관'];

const WriteUsedScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { selectedCountry } = useCountry();
    const countryCode = selectedCountry?.code || 'FR';
    const countryInfo = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[1];
    const currency = countryInfo.currencySymbol;

    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        locationData: null,
        tradeTime: '',
        description: '',
    });

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handlePriceChange = (value) => {
        const num = value.replace(/[^0-9]/g, '');
        updateField('price', num);
    };

    const handleLocationSelect = (data) => {
        setFormData(prev => ({ ...prev, location: data.address, locationData: data }));
        setShowLocationPicker(false);
    };

    const isFormValid = formData.title && formData.price && formData.description && formData.location;

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;
        if (!user) { Alert.alert('알림', '로그인이 필요합니다.'); return; }

        setIsSubmitting(true);
        try {
            const uploadedUrls = images.length > 0 ? await uploadImages(images, 'used') : [];

            const displayPrice = Number(formData.price).toLocaleString();
            const { error } = await supabase.from('posts').insert({
                category: 'used',
                title: formData.title,
                price: `${displayPrice}${currency}`,
                location: formData.location,
                latitude: formData.locationData?.lat,
                longitude: formData.locationData?.lng,
                description: formData.description,
                trade_time: formData.tradeTime,
                country_code: countryCode,
                image_urls: uploadedUrls,
                views: 0, likes: 0,
                color: '#F5F5F5',
                user_id: user.id,
            });

            if (error) throw error;
            setShowSuccess(true);
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('오류', '등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
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
                <Text style={styles.headerTitle}>중고거래 글쓰기</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <ImagePickerGrid images={images} setImages={setImages} />

                    <Text style={styles.label}>제목</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="글 제목을 입력해주세요"
                        placeholderTextColor="#C0C0C0"
                        value={formData.title}
                        onChangeText={(v) => updateField('title', v)}
                        maxLength={100}
                    />

                    <Text style={styles.label}>가격</Text>
                    <View style={styles.priceRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="가격을 입력해주세요"
                            placeholderTextColor="#C0C0C0"
                            value={formData.price ? Number(formData.price).toLocaleString() : ''}
                            onChangeText={handlePriceChange}
                            keyboardType="number-pad"
                            maxLength={20}
                        />
                        <View style={styles.currencyBadge}>
                            <Text style={styles.currencyText}>{currency}</Text>
                        </View>
                    </View>

                    <Text style={styles.label}>거래 정보</Text>
                    <View style={styles.tradeCard}>
                        <TouchableOpacity
                            style={styles.locationRow}
                            onPress={() => setShowLocationPicker(true)}
                        >
                            <MapPin size={18} color="#FFB7B2" />
                            <Text style={[styles.locationText, !formData.location && { color: '#C0C0C0' }]}>
                                {formData.location || '거래 위치를 선택해주세요'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.tradeTimeDivider} />
                        <View style={styles.timeRow}>
                            <Clock size={18} color="#FFB7B2" />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                                <View style={styles.timeChips}>
                                    {TRADE_TIMES.map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[styles.chip, formData.tradeTime === time && styles.chipActive]}
                                            onPress={() => updateField('tradeTime', time)}
                                        >
                                            <Text style={[styles.chipText, formData.tradeTime === time && styles.chipTextActive]}>
                                                {time}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    <Text style={styles.label}>제품 내용</Text>
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="게시글 내용을 작성해주세요. (판매 금지 물품은 게시가 제한될 수 있어요)"
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
                        <Text style={styles.submitBtnText}>작성 완료</Text>
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
                message={`소중한 물건이\n성공적으로 등록되었습니다!`}
                Icon={ShoppingBag}
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
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    currencyBadge: {
        backgroundColor: '#FFB7B215', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14,
    },
    currencyText: { fontSize: 15, fontWeight: '700', color: '#FFB7B2' },
    tradeCard: {
        backgroundColor: '#F8F8F8', borderRadius: 14, overflow: 'hidden',
    },
    locationRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 14,
    },
    locationText: { fontSize: 15, color: '#4A4A4A', flex: 1 },
    tradeTimeDivider: { height: 1, backgroundColor: '#ECECEC', marginHorizontal: 16 },
    timeRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 12,
    },
    timeChips: { flexDirection: 'row', gap: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
    },
    chipActive: { backgroundColor: '#FFB7B2', borderColor: '#FFB7B2' },
    chipText: { fontSize: 13, color: '#9B9B9B', fontWeight: '600' },
    chipTextActive: { color: '#fff' },
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

export default WriteUsedScreen;
