import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

const ITEMS_PER_PAGE = 10;

const MarketScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (pageNum = 0, isRefreshing = false) => {
        try {
            if (pageNum === 0 && !isRefreshing) setLoading(true);

            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('category', 'used')
                .order('created_at', { ascending: false })
                .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

            if (error) throw error;

            if (pageNum === 0) {
                setItems(data || []);
            } else {
                setItems(prev => [...prev, ...(data || [])]);
            }

            setHasMore(data && data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Error fetching market posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
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

    const renderFooter = () => {
        if (!hasMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color="#FFB7B2" />
            </View>
        );
    };

    if (loading && items.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFB7B2" />
                <Text style={styles.loadingText}>상품을 불러오는 중... 🎨✨</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>중고거래 🛍️</Text>
            </View>

            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <ProductCard
                        item={item}
                        variant="list"
                        onPress={() => navigation.navigate('ProductDetail', { postId: item.id })}
                    />
                )}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB7B2" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>등록된 상품이 없어요 🥲</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4A4A4A',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9B9B9B',
    },
    footerLoader: {
        marginVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9B9B9B',
    },
});

export default MarketScreen;
