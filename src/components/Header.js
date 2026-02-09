import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCountry } from '../contexts/CountryContext';
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

const Header = ({ title, showBack = false, showSearch = true, showCategoryTabs = false, activeCategory }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { selectedCountry } = useCountry();
    const [showCountryModal, setShowCountryModal] = useState(false);

    if (showCategoryTabs) {
        return (
            <View style={[styles.categoryContainer, { paddingTop: insets.top }]}>
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
                        <Text style={styles.countryName}>{selectedCountry.name}</Text>
                        <ChevronDown size={12} color="#2D3436" />
                    </TouchableOpacity>

                    {showSearch && (
                        <TouchableOpacity
                            style={styles.searchBtn}
                            onPress={() => navigation.navigate('Search', {
                                category: SEARCH_CATEGORY_MAP[activeCategory] || 'all',
                                country: selectedCountry.code,
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
                                style={[styles.tab, isActive && styles.tabActive]}
                                onPress={() => navigation.navigate(tab.key)}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <CountryModal visible={showCountryModal} onClose={() => setShowCountryModal(false)} />
            </View>
        );
    }

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
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
                        <Text style={styles.logoText}>{selectedCountry.name}</Text>
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
    },
    logoText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
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
    },
    tab: {
        flex: 1,
        minWidth: 80,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#2D3436',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6a6a6a',
    },
    tabTextActive: {
        color: '#2D3436',
    },
});

export default Header;
