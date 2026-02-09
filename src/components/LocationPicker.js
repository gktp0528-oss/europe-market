import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    FlatList, Modal, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import Constants from 'expo-constants';

const COUNTRY_NAMES_EN = {
    ALL: '', DE: 'Germany', FR: 'France', GB: 'United Kingdom',
    IT: 'Italy', ES: 'Spain', AT: 'Austria', NL: 'Netherlands',
    HU: 'Hungary', CZ: 'Czech Republic', PL: 'Poland',
};

const LocationPicker = ({ countryCode, onSelect, onClose, visible }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef(null);
    const inputRef = useRef(null);

    const API_URL = Constants.expoConfig?.extra?.PHOTON_API_URL
        || process.env.EXPO_PUBLIC_PHOTON_API_URL
        || 'https://photon.komoot.io/api';

    useEffect(() => {
        if (visible) {
            setTimeout(() => inputRef.current?.focus(), 300);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [visible]);

    const searchPlaces = async (searchText) => {
        if (!searchText.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            let finalQuery = searchText;
            if (countryCode && countryCode !== 'ALL') {
                const en = COUNTRY_NAMES_EN[countryCode];
                if (en) finalQuery = `${searchText}, ${en}`;
            }

            const params = new URLSearchParams({ q: finalQuery, lang: 'en', limit: '15' });

            if (countryCode && countryCode !== 'ALL') {
                const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
                if (country) {
                    params.append('lat', country.lat);
                    params.append('lon', country.lng);
                    params.append('zoom', '5');
                }
            }

            const response = await fetch(`${API_URL}?${params}`);
            const data = await response.json();
            setResults(data.features || []);
        } catch (error) {
            console.error('Photon search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (val) => {
        setQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => searchPlaces(val), 300);
    };

    const handleSelect = (feature) => {
        const { properties, geometry } = feature;
        const name = properties.name;
        const city = properties.city || properties.town || properties.village;
        const country = properties.country;

        let fullAddress = name;
        if (city && city !== name) fullAddress += `, ${city}`;
        if (country) fullAddress += `, ${country}`;

        onSelect({
            address: fullAddress,
            name,
            lat: geometry.coordinates[1],
            lng: geometry.coordinates[0],
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <View style={styles.resultIcon}>
                <MapPin size={16} color="#FFB7B2" />
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.properties.name}</Text>
                <Text style={styles.resultDetails}>
                    {[item.properties.city, item.properties.state, item.properties.country]
                        .filter(Boolean).join(', ')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>지역 선택</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Search size={18} color="#9B9B9B" />
                    <TextInput
                        ref={inputRef}
                        style={styles.searchInput}
                        value={query}
                        onChangeText={handleInput}
                        placeholder={countryCode === 'ALL' ? '유럽 내 장소 검색' : `${countryCode} 내 장소 검색`}
                        placeholderTextColor="#9B9B9B"
                        returnKeyType="search"
                    />
                    {loading && <ActivityIndicator size="small" color="#FFB7B2" />}
                </View>

                <FlatList
                    data={results}
                    keyExtractor={(_, idx) => idx.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.resultsList}
                    ListEmptyComponent={
                        query && !loading ? (
                            <Text style={styles.noResults}>검색 결과가 없습니다.</Text>
                        ) : null
                    }
                    keyboardShouldPersistTaps="handled"
                />

                <View style={styles.hint}>
                    <MapPin size={14} color="#9B9B9B" />
                    <Text style={styles.hintText}>
                        {countryCode === 'ALL'
                            ? '유럽 전체 데이터 검색 중'
                            : `입력하신 국가(${countryCode}) 위주로 검색됩니다.`}
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#4A4A4A' },
    closeBtn: { padding: 4 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', margin: 16,
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#F8F8F8', borderRadius: 14, gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#4A4A4A' },
    resultsList: { paddingHorizontal: 16 },
    resultItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    resultIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFB7B215',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    resultInfo: { flex: 1 },
    resultName: { fontSize: 15, fontWeight: '600', color: '#4A4A4A', marginBottom: 2 },
    resultDetails: { fontSize: 13, color: '#9B9B9B' },
    noResults: { textAlign: 'center', color: '#9B9B9B', marginTop: 40, fontSize: 14 },
    hint: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        padding: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    hintText: { fontSize: 12, color: '#9B9B9B' },
});

export default LocationPicker;
