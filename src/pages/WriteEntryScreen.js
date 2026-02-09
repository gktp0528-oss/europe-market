import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Briefcase, GraduationCap, Users, X } from 'lucide-react-native';

const OPTIONS = [
    { type: 'used', label: '중고거래', Icon: ShoppingBag },
    { type: 'job', label: '알바', Icon: Briefcase },
    { type: 'tutoring', label: '과외/레슨', Icon: GraduationCap },
    { type: 'meetup', label: '모임', Icon: Users },
];

const WriteEntryScreen = ({ navigation }) => {
    const close = () => navigation.goBack();

    const openSelectCountry = (type) => {
        navigation.navigate('SelectCountry', { type });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>글쓰기</Text>
                    <TouchableOpacity onPress={close} hitSlop={12}>
                        <X size={24} color="#2D3436" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>어떤 글을 올릴지 선택해주세요</Text>
            </View>

            <View style={styles.grid}>
                {OPTIONS.map(({ type, label, Icon }) => (
                    <TouchableOpacity
                        key={type}
                        style={styles.card}
                        activeOpacity={0.85}
                        onPress={() => openSelectCountry(type)}
                    >
                        <View style={styles.iconWrap}>
                            <Icon size={24} color="#FF9E98" />
                        </View>
                        <Text style={styles.cardText}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 8,
        paddingBottom: 18,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2D3436',
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: '#7A7A7A',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48.5%',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFB7B222',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4A4A4A',
    },
});

export default WriteEntryScreen;
