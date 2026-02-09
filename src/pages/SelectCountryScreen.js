import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Globe } from 'lucide-react-native';
import { SUPPORTED_COUNTRIES, useCountry } from '../contexts/CountryContext';

const TYPE_LABELS = {
    used: '중고거래',
    job: '구인구직',
    tutoring: '과외/레슨',
    meetup: '모임',
};

const TYPE_WRITE_ROUTE = {
    used: 'WriteUsed',
    job: 'WriteJob',
    tutoring: 'WriteTutoring',
    meetup: 'WriteMeetup',
};

const SelectCountryScreen = ({ navigation, route }) => {
    const type = route?.params?.type || 'used';
    const { setSelectedCountry } = useCountry();
    const displayType = TYPE_LABELS[type] || '게시글';

    const countries = useMemo(
        () => SUPPORTED_COUNTRIES.filter((country) => country.code !== 'ALL'),
        []
    );

    const handleSelectCountry = async (country) => {
        await setSelectedCountry(country);
        const targetRoute = TYPE_WRITE_ROUTE[type] || 'WriteUsed';
        navigation.replace(targetRoute, { category: type });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>지역 선택</Text>
                <View style={styles.backBtn} />
            </View>

            <View style={styles.content}>
                <View style={styles.intro}>
                    <View style={styles.globeCircle}>
                        <Globe size={34} color="#FF9E98" />
                    </View>
                    <Text style={styles.introTitle}>{displayType} 글을 올릴 국가를 선택해주세요</Text>
                    <Text style={styles.introDesc}>선택한 국가 기준으로 위치/화폐가 자동 적용됩니다.</Text>
                </View>

                <FlatList
                    data={countries}
                    numColumns={3}
                    keyExtractor={(item) => item.code}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.columnWrap}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.countryCard}
                            onPress={() => handleSelectCountry(item)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.flag}>{item.flag}</Text>
                            <Text style={styles.countryName} numberOfLines={1}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFDF5',
    },
    header: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    backBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#4A4A4A',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    intro: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    globeCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FFF2F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 8,
    },
    introDesc: {
        fontSize: 13,
        color: '#8A8A8A',
        textAlign: 'center',
    },
    grid: {
        paddingBottom: 30,
    },
    columnWrap: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    countryCard: {
        width: '31.5%',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 6,
    },
    flag: {
        fontSize: 28,
        marginBottom: 6,
    },
    countryName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A4A4A',
    },
});

export default SelectCountryScreen;
