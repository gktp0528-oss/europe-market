import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, MapPin, Clock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useCountry } from '../contexts/CountryContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';

const CATEGORY_OPTIONS = [
    { value: 'all', label: '전체' },
    { value: 'used', label: '중고거래' },
    { value: 'job', label: '알바' },
    { value: 'tutoring', label: '과외/레슨' },
    { value: 'meetup', label: '모임' },
];

const CATEGORY_LABELS = {
    used: '중고거래',
    job: '알바',
    tutoring: '과외/레슨',
    meetup: '모임',
};

const CATEGORY_ROUTE_MAP = {
    used: 'ProductDetail',
    job: 'JobDetail',
    tutoring: 'TutoringDetail',
    meetup: 'MeetupDetail',
};

const SearchScreen = ({ navigation, route }) => {
    const { selectedCountry } = useCountry();
    const initialCategory = route?.params?.category || 'all';
    const initialCountryCode = route?.params?.country || selectedCountry?.code || 'ALL';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedCountryCode, setSelectedCountryCode] = useState(initialCountryCode);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const nowTick = useMinuteTicker();

    const countryLabel = useMemo(() => {
        if (selectedCountryCode === 'ALL') return '전체 국가';
        if (selectedCountryCode === selectedCountry?.code) return selectedCountry?.name || selectedCountryCode;
        return selectedCountryCode;
    }, [selectedCountry?.code, selectedCountry?.name, selectedCountryCode]);

    const fetchSearchResults = useCallback(async (query, category, countryCode) => {
        setLoading(true);
        try {
            let request = supabase
                .from('posts')
                .select('id, title, description, price, location, category, created_at')
                .order('created_at', { ascending: false })
                .limit(40);

            if (category !== 'all') {
                request = request.eq('category', category);
            }

            if (countryCode && countryCode !== 'ALL') {
                request = request.eq('country_code', countryCode);
            }

            const trimmedQuery = query.trim();
            if (trimmedQuery) {
                const safeQuery = trimmedQuery.replace(/[,%_]/g, '');
                request = request.or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,location.ilike.%${safeQuery}%`);
            }

            const { data, error } = await request;
            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error('Search query failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (route?.params?.country) {
            setSelectedCountryCode(route.params.country);
        }
    }, [route?.params?.country]);

    useEffect(() => {
        if (route?.params?.category) {
            setSelectedCategory(route.params.category);
        }
    }, [route?.params?.category]);

    useEffect(() => {
        const debounceId = setTimeout(() => {
            fetchSearchResults(searchQuery, selectedCategory, selectedCountryCode);
        }, 300);
        return () => clearTimeout(debounceId);
    }, [searchQuery, selectedCategory, selectedCountryCode, fetchSearchResults]);

    const openDetail = (post) => {
        const detailRoute = CATEGORY_ROUTE_MAP[post.category];
        if (!detailRoute) return;
        navigation.navigate(detailRoute, { postId: post.id });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.resultCard} onPress={() => openDetail(item)}>
            <View style={styles.resultTop}>
                <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{CATEGORY_LABELS[item.category] || item.category}</Text>
                </View>
            </View>

            <Text style={styles.priceText}>{item.price || '가격 협의'}</Text>

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <MapPin size={12} color="#9B9B9B" />
                    <Text style={styles.metaText}>{item.location || '위치 미정'}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Clock size={12} color="#9B9B9B" />
                    <Text style={styles.metaText}>{getPostTimeLabel(item, nowTick)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.searchHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <View style={styles.inputWrap}>
                    <TextInput
                        style={styles.input}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="검색어를 입력하세요"
                        placeholderTextColor="#9B9B9B"
                        autoFocus
                        returnKeyType="search"
                    />
                    <Search size={18} color="#9B9B9B" />
                </View>
            </View>

            <View style={styles.filterRow}>
                <View style={styles.countryChip}>
                    <Text style={styles.countryChipText}>국가: {countryLabel}</Text>
                </View>
                {CATEGORY_OPTIONS.map((option) => {
                    const active = option.value === selectedCategory;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.filterChip, active && styles.filterChipActive]}
                            onPress={() => setSelectedCategory(option.value)}
                        >
                            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#FFB7B2" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerState}>
                            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    backBtn: { padding: 4 },
    inputWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        height: 44,
        fontSize: 15,
        color: '#4A4A4A',
        marginRight: 8,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    countryChip: {
        backgroundColor: '#F5F6F8',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    countryChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4F5561',
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    filterChipActive: {
        borderColor: '#2D3436',
        backgroundColor: '#2D3436',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    resultTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    resultTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    categoryBadge: {
        backgroundColor: '#FFB7B222',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    categoryBadgeText: {
        color: '#FF9E98',
        fontSize: 11,
        fontWeight: '700',
    },
    priceText: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: '800',
        color: '#FF8F87',
    },
    metaRow: {
        marginTop: 8,
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#9B9B9B',
    },
    centerState: {
        paddingTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9B9B9B',
        fontSize: 14,
    },
});

export default SearchScreen;
