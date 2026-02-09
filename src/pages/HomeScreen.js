import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MapPin } from 'lucide-react-native';

const HomeScreen = () => {
    const { user } = useAuth();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logoText}>유럽 중고거래 🎨</Text>
                <TouchableOpacity style={styles.countryBtn}>
                    <MapPin size={18} color="#FFB7B2" />
                    <Text style={styles.countryText}>프랑스</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>
                    {user ? `${user.email.split('@')[0]}님, 반가워요! 😍` : '하은 대표님~!! 😍'}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                    이사 온 기분 어떠세요? 🚚💨{"\n"}
                    여기서 마법 같은 거래가 시작될 거예요! ✨
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>추천 소식 🌟</Text>
                <View style={styles.placeholderCard}>
                    <Text style={styles.placeholderText}>데이터 이사 준비 중입니다... 🛠️</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFDF5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 0,
    },
    logoText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#4A4A4A',
    },
    countryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    countryText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    welcomeCard: {
        margin: 24,
        marginTop: 0,
        backgroundColor: '#FFB7B233',
        padding: 30,
        borderRadius: 30,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4A4A4A',
        opacity: 0.8,
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4A4A4A',
        marginBottom: 16,
    },
    placeholderCard: {
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#9B9B9B',
        fontSize: 14,
    },
});

export default HomeScreen;
