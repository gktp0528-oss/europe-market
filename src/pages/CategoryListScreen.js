import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, GraduationCap, Users } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useCountry } from '../contexts/CountryContext';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

const ITEMS_PER_PAGE = 10;

const CATEGORY_MAP = {
    CategoryClothes: {
        key: 'used',
        emptyText: '등록된 상품이 없어요',
        loadingText: '상품을 불러오는 중...',
        detailRoute: 'ProductDetail',
        priceFallback: '가격 협의',
        placeholderIcon: null,
    },
    CategoryJobs: {
        key: 'job',
        emptyText: '등록된 알바가 없어요',
        loadingText: '알바 정보를 불러오는 중...',
        detailRoute: 'JobDetail',
        priceFallback: '급여 협의',
        placeholderIcon: <Briefcase size={40} color="#666" style={{ opacity: 0.3 }} />,
    },
    CategoryTutoring: {
        key: 'tutoring',
        emptyText: '등록된 과외/레슨이 없어요',
        loadingText: '과외/레슨을 불러오는 중...',
        detailRoute: 'TutoringDetail',
        priceFallback: '수업료 협의',
        placeholderIcon: <GraduationCap size={40} color="#666" style={{ opacity: 0.3 }} />,
    },
    CategoryMeetups: {
        key: 'meetup',
        emptyText: '등록된 모임이 없어요',
        loadingText: '모임을 불러오는 중...',
        detailRoute: 'MeetupDetail',
        priceFallback: '가격 협의',
        placeholderIcon: <Users size={40} color="#666" style={{ opacity: 0.3 }} />,
    },
};

const DEFAULT_TAB = 'CategoryClothes';
const TAB_ORDER = ['CategoryClothes', 'CategoryJobs', 'CategoryTutoring', 'CategoryMeetups'];

const CategoryListScreen = ({ navigation, route }) => {
    const initialTab = route?.params?.initialCategory || route?.name || DEFAULT_TAB;

    const [activeTab, setActiveTab] = useState(CATEGORY_MAP[initialTab] ? initialTab : DEFAULT_TAB);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [previousTab, setPreviousTab] = useState(activeTab);

    const { selectedCountry } = useCountry();
    const nowTick = useMinuteTicker();
    const listOpacity = useRef(new Animated.Value(1)).current;
    const listShiftX = useRef(new Animated.Value(0)).current;

    const tabConfig = useMemo(() => CATEGORY_MAP[activeTab] || CATEGORY_MAP[DEFAULT_TAB], [activeTab]);

    const fetchPosts = useCallback(async (targetTab, pageNum = 0, isRefreshing = false) => {
        const target = CATEGORY_MAP[targetTab] || CATEGORY_MAP[DEFAULT_TAB];

        try {
            if (pageNum === 0 && !isRefreshing) setLoading(true);

            let query = supabase
                .from('posts')
                .select('*')
                .eq('category', target.key)
                .order('created_at', { ascending: false })
                .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

            if (selectedCountry.code !== 'ALL') {
                query = query.eq('country_code', selectedCountry.code);
            }

            const { data, error } = await query;
            if (error) throw error;

            if (pageNum === 0) {
                setItems(data || []);
            } else {
                setItems((prev) => [...prev, ...(data || [])]);
            }

            setHasMore(!!data && data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Error fetching category posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCountry]);

    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchPosts(activeTab, 0);
    }, [activeTab, fetchPosts]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(0);
        fetchPosts(activeTab, 0, true);
    };

    const loadMore = () => {
        if (hasMore && !loading && !refreshing) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(activeTab, nextPage);
        }
    };

    const handleTabPress = (nextTab) => {
        if (nextTab === activeTab) return;
        const currentIndex = TAB_ORDER.indexOf(activeTab);
        const nextIndex = TAB_ORDER.indexOf(nextTab);
        const direction = nextIndex >= currentIndex ? 1 : -1;

        listOpacity.stopAnimation();
        listShiftX.stopAnimation();

        Animated.parallel([
            Animated.timing(listOpacity, {
                toValue: 0.72,
                duration: 90,
                useNativeDriver: true,
            }),
            Animated.timing(listShiftX, {
                toValue: -6 * direction,
                duration: 90,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPreviousTab(activeTab);
            setActiveTab(nextTab);

            listShiftX.setValue(8 * direction);
            Animated.parallel([
                Animated.timing(listOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(listShiftX, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    if (loading && items.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <Header
                    showCategoryTabs
                    activeCategory={activeTab}
                    onCategoryTabPress={handleTabPress}
                />
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#FFB7B2" />
                    <Text style={styles.loadingText}>{tabConfig.loadingText}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <Header
                showCategoryTabs
                activeCategory={activeTab}
                onCategoryTabPress={handleTabPress}
            />
            <Animated.View style={{ flex: 1, opacity: listOpacity, transform: [{ translateX: listShiftX }] }}>
                <FlatList
                    data={items}
                    renderItem={({ item }) => (
                        <ProductCard
                            item={item}
                            variant="list"
                            priceFallback={tabConfig.priceFallback}
                            placeholderColor="#F5F5F5"
                            placeholderIcon={tabConfig.placeholderIcon}
                            onPress={() => navigation.navigate(tabConfig.detailRoute, { postId: item.id })}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ItemSeparatorComponent={null}
                    ListFooterComponent={hasMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator color="#FFB7B2" />
                        </View>
                    ) : null}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB7B2" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{tabConfig.emptyText}</Text>
                        </View>
                    }
                    extraData={`${nowTick}_${activeTab}_${previousTab}`}
                />
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9B9B9B',
    },
    listContent: {
        paddingBottom: 100,
    },
    footerLoader: {
        marginVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9B9B9B',
    },
});

export default CategoryListScreen;
