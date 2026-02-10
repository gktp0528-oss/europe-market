import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import {
    ShoppingBag,
    Briefcase,
    GraduationCap,
    Users,
    MapPin,
    Clock,
    Heart,
    Eye,
} from 'lucide-react-native';
import { useCountry } from '../contexts/CountryContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import { getPostTimeLabel } from '../utils/dateUtils';

const CATEGORY_CARDS = [
    { key: 'CategoryClothes', label: '중고거래', Icon: ShoppingBag },
    { key: 'CategoryJobs', label: '알바', Icon: Briefcase },
    { key: 'CategoryTutoring', label: '과외/레슨', Icon: GraduationCap },
    { key: 'CategoryMeetups', label: '모임', Icon: Users },
];

const HomeScreen = ({ navigation }) => {
    const { selectedCountry } = useCountry();
    const [popularItems, setPopularItems] = useState([]);
    const nowTick = useMinuteTicker();

    const getFormatDate = (date) => date.toISOString().split('T')[0];

    const fetchTop10 = useCallback(async () => {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const todayStr = getFormatDate(today);
            const yesterdayStr = getFormatDate(yesterday);
            const targetCountry = selectedCountry?.code || 'ALL';

            const { data: todayData, error: todayError } = await supabase
                .from('popular_snapshots')
                .select('top_items')
                .eq('snapshot_date', todayStr)
                .eq('country_code', targetCountry)
                .maybeSingle();

            if (todayError) throw todayError;

            if (todayData?.top_items?.length) {
                setPopularItems(todayData.top_items);
                return;
            }

            const { data: yesterdayData, error: yesterdayError } = await supabase
                .from('popular_snapshots')
                .select('top_items')
                .eq('snapshot_date', yesterdayStr)
                .eq('country_code', targetCountry)
                .maybeSingle();

            if (yesterdayError) throw yesterdayError;
            setPopularItems(yesterdayData?.top_items || []);
        } catch (error) {
            console.error('Home TOP10 fetch error:', error);
            setPopularItems([]);
        }
    }, [selectedCountry?.code]);

    useEffect(() => {
        fetchTop10();
    }, [fetchTop10]);

    const openCategory = (categoryKey) => {
        navigation.navigate(categoryKey);
    };

    const openPopularItem = (item) => {
        if (!item?.id) return;

        if (item.category === 'job') {
            navigation.navigate('JobDetail', { postId: item.id });
            return;
        }
        if (item.category === 'tutoring') {
            navigation.navigate('TutoringDetail', { postId: item.id });
            return;
        }
        if (item.category === 'meetup') {
            navigation.navigate('MeetupDetail', { postId: item.id });
            return;
        }
        navigation.navigate('ProductDetail', { postId: item.id });
    };

    const countryLabel = useMemo(() => selectedCountry?.name || '전체', [selectedCountry?.name]);

    return (
        <View style={styles.container}>
            <Header showAlarm={false} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <AdBanner />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>카테고리</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORY_CARDS.map(({ key, label, Icon }) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.categoryCard}
                                activeOpacity={0.85}
                                onPress={() => openCategory(key)}
                            >
                                <View style={styles.categoryIcon}>
                                    <Icon size={22} color="#FF9E98" />
                                </View>
                                <Text style={styles.categoryText}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>오늘의 인기글 TOP 10</Text>
                        <Text style={styles.sectionCountry}>{countryLabel}</Text>
                    </View>

                    {popularItems.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>아직 인기글이 없어요</Text>
                        </View>
                    ) : (
                        <View style={styles.popularList}>
                            {popularItems.map((item, idx) => {
                                const showPrice = item.category !== 'job' && item.category !== 'tutoring';
                                const timeLabel = item.time || getPostTimeLabel(item, nowTick);

                                return (
                                    <TouchableOpacity
                                        key={`${item.id}_${idx}`}
                                        style={styles.popularCard}
                                        onPress={() => openPopularItem(item)}
                                        activeOpacity={0.85}
                                    >
                                        <View style={styles.popularLeft}>
                                            <View style={styles.rankBadge}>
                                                <Text style={styles.rankText}>{idx + 1}</Text>
                                            </View>
                                            <View style={[styles.thumb, { backgroundColor: item.color || '#F0F0F0' }]} />
                                        </View>

                                        <View style={styles.popularInfo}>
                                            <Text numberOfLines={1} style={styles.popularTitle}>{item.title}</Text>
                                            <View style={styles.metaRow}>
                                                <View style={styles.metaItem}>
                                                    <MapPin size={11} color="#9B9B9B" />
                                                    <Text style={styles.metaText} numberOfLines={1}>{item.location || '위치 미정'}</Text>
                                                </View>
                                                <View style={styles.metaItem}>
                                                    <Clock size={11} color="#9B9B9B" />
                                                    <Text style={styles.metaText}>{timeLabel}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.bottomRow}>
                                                {showPrice ? (
                                                    <Text style={styles.price}>{item.price || '가격 협의'}</Text>
                                                ) : (
                                                    <View />
                                                )}

                                                <View style={styles.interactions}>
                                                    <View style={styles.metaItem}>
                                                        <Eye size={11} color="#9B9B9B" />
                                                        <Text style={styles.metaText}>{item.views || 0}</Text>
                                                    </View>
                                                    <View style={styles.metaItem}>
                                                        <Heart size={11} color="#FF9E98" />
                                                        <Text style={[styles.metaText, { color: '#FF9E98' }]}>{item.likes || 0}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
    },
    sectionCountry: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8A8A8A',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '23.5%',
        backgroundColor: '#fff',
        borderRadius: 14,
        alignItems: 'center',
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#F1F1F1',
        marginBottom: 10,
    },
    categoryIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF2F1',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9B9B9B',
    },
    popularList: {
        gap: 10,
    },
    popularCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    popularLeft: {
        width: 82,
        height: 82,
        marginRight: 12,
        position: 'relative',
    },
    thumb: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    rankBadge: {
        position: 'absolute',
        left: -6,
        top: -6,
        zIndex: 2,
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: '#FF9E98',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    rankText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
    popularInfo: {
        flex: 1,
    },
    popularTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        maxWidth: 130,
    },
    metaText: {
        fontSize: 11,
        color: '#9B9B9B',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FF8F87',
    },
    interactions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

export default HomeScreen;
