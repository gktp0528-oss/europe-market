import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useCountry } from '../contexts/CountryContext';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

const ITEMS_PER_PAGE = 10;

const CategoryTutoringScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { selectedCountry } = useCountry();
    const nowTick = useMinuteTicker();

    const fetchPosts = useCallback(async (pageNum = 0, isRefreshing = false) => {
        try {
            if (pageNum === 0 && !isRefreshing) setLoading(true);

            let query = supabase
                .from('posts')
                .select('*')
                .eq('category', 'tutoring')
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
                setItems(prev => [...prev, ...(data || [])]);
            }

            setHasMore(data && data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Error fetching tutoring posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCountry]);

    useEffect(() => {
        setPage(0);
        fetchPosts(0);
    }, [fetchPosts]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(0);
        fetchPosts(0, true);
    };

    const loadMore = () => {
        if (hasMore && !loading && !refreshing) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    };

    if (loading && items.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Header showCategoryTabs activeCategory="CategoryTutoring" />
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#FFB7B2" />
                    <Text style={styles.loadingText}>과외/레슨을 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header showCategoryTabs activeCategory="CategoryTutoring" />
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <ProductCard
                        item={item}
                        variant="list"
                        priceFallback="수업료 협의"
                        placeholderColor="#F5F5F5"
                        placeholderIcon={<GraduationCap size={40} color="#666" style={{ opacity: 0.3 }} />}
                        onPress={() => navigation.navigate('TutoringDetail', { postId: item.id })}
                    />
                )}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={hasMore ? (
                    <View style={styles.footerLoader}><ActivityIndicator color="#FFB7B2" /></View>
                ) : null}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB7B2" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>등록된 과외/레슨이 없어요</Text>
                    </View>
                }
                extraData={nowTick}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#9B9B9B' },
    listContent: { padding: 20, paddingBottom: 100 },
    itemSeparator: { height: 16 },
    footerLoader: { marginVertical: 20, alignItems: 'center' },
    emptyContainer: { paddingTop: 100, alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#9B9B9B' },
});

export default CategoryTutoringScreen;
