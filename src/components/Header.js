import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCountry, SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import CountryModal from './CountryModal';

const CATEGORY_TABS = [
    { key: 'CategoryClothes', label: '중고거래' },
    { key: 'CategoryJobs', label: '알바' },
    { key: 'CategoryTutoring', label: '과외/레슨' },
    { key: 'CategoryMeetups', label: '모임' },
];

const SEARCH_CATEGORY_MAP = {
    CategoryClothes: 'used',
    CategoryJobs: 'job',
    CategoryTutoring: 'tutoring',
    CategoryMeetups: 'meetup',
};

const Header = ({ title, showBack = false, showSearch = true, showCategoryTabs = false, activeCategory, onCategoryTabPress }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { selectedCountry } = useCountry();
    const fallbackCountry = SUPPORTED_COUNTRIES.find((item) => item.code === selectedCountry?.code);
    const countryName = (selectedCountry?.name || fallbackCountry?.name || '전체').trim() || '전체';
    const countryCode = selectedCountry?.code || fallbackCountry?.code || 'ALL';
    const [showCountryModal, setShowCountryModal] = useState(false);
    const tabLayoutsRef = useRef({});
    const indicatorX = useRef(new Animated.Value(0)).current;
    const indicatorW = useRef(new Animated.Value(0)).current;
    const hasInit = useRef(false);

    const moveIndicator = useCallback((category, instant) => {
        const layout = tabLayoutsRef.current[category];
        if (!layout) return;

        if (instant) {
            indicatorX.setValue(layout.x);
            indicatorW.setValue(layout.width);
            return;
        }

        Animated.parallel([
            Animated.spring(indicatorX, {
                toValue: layout.x,
                useNativeDriver: false,
                tension: 120,
                friction: 14,
            }),
            Animated.spring(indicatorW, {
                toValue: layout.width,
                useNativeDriver: false,
                tension: 120,
                friction: 14,
            }),
        ]).start();
    }, [indicatorX, indicatorW]);

    useEffect(() => {
        if (!showCategoryTabs || !activeCategory) return;
        if (!hasInit.current) return;
        moveIndicator(activeCategory, false);
    }, [activeCategory, showCategoryTabs, moveIndicator]);

    if (showCategoryTabs) {
        return (
            <View style={styles.categoryContainer}>
                <View style={styles.categoryTopRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} color="#2D3436" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.countryBtn}
                        onPress={() => setShowCountryModal(true)}
                    >
                        <Text style={styles.countryName}>{countryName}</Text>
                        <ChevronDown size={12} color="#2D3436" />
                    </TouchableOpacity>

                    {showSearch && (
                        <TouchableOpacity
                            style={styles.searchBtn}
                            onPress={() => navigation.navigate('Search', {
                                category: SEARCH_CATEGORY_MAP[activeCategory] || 'all',
                                country: countryCode,
                            })}
                        >
                            <Search size={22} color="#2D3436" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsBar}
                    contentContainerStyle={styles.tabsContent}
                >
                    {CATEGORY_TABS.map((tab) => {
                        const isActive = activeCategory === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={styles.tab}
                                onLayout={(event) => {
                                    const { x, width } = event.nativeEvent.layout;
                                    tabLayoutsRef.current[tab.key] = { x, width };
                                    if (tab.key === activeCategory) {
                                        const instant = !hasInit.current;
                                        hasInit.current = true;
                                        moveIndicator(activeCategory, instant);
                                    }
                                }}
                                onPress={() => {
                                    if (isActive) return;
                                    if (typeof onCategoryTabPress === 'function') {
                                        onCategoryTabPress(tab.key);
                                        return;
                                    }
                                    if (typeof navigation.replace === 'function') {
                                        navigation.replace(tab.key);
                                        return;
                                    }
                                    navigation.navigate(tab.key);
                                }}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.tabIndicator,
                            {
                                transform: [{ translateX: indicatorX }],
                                width: indicatorW,
                            },
                        ]}
                    />
                </ScrollView>

                <CountryModal visible={showCountryModal} onClose={() => setShowCountryModal(false)} />
            </View>
        );
    }

    return (
        <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
            <View style={styles.headerLeft}>
                {showBack ? (
                    <View style={styles.backGroup}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft size={24} color="#2D3436" />
                        </TouchableOpacity>
                        {title && <Text style={styles.headerTitle}>{title}</Text>}
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.logoBtn}
                        onPress={() => setShowCountryModal(true)}
                    >
                        <Text style={styles.logoText}>{countryName}</Text>
                        <ChevronDown size={14} color="#2D3436" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.headerRight}>
                {showSearch && (
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Search size={22} color="#2D3436" />
                    </TouchableOpacity>
                )}
            </View>

            <CountryModal visible={showCountryModal} onClose={() => setShowCountryModal(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    // Standard Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
    },
    logoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
        maxWidth: '92%',
    },
    logoText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
        includeFontPadding: false,
        maxWidth: 170,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
    },

    // Category Header
    categoryContainer: {
        backgroundColor: '#fff',
    },
    categoryTopRow: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    },
    backBtn: {
        padding: 8,
        borderRadius: 10,
    },
    countryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    countryName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3436',
    },
    searchBtn: {
        padding: 8,
        borderRadius: 10,
    },
    tabsBar: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    },
    tabsContent: {
        flexDirection: 'row',
        position: 'relative',
    },
    tab: {
        minWidth: 80,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6a6a6a',
    },
    tabTextActive: {
        color: '#2D3436',
    },
    tabIndicator: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 2,
        backgroundColor: '#2D3436',
        borderRadius: 1,
    },
});

export default Header;
