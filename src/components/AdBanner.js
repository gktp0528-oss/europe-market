import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const ADS = [
    { id: 1, text: '유럽 전역 택배 대행 서비스 오픈! 📦', colors: ['#FF9A9E', '#FAD0C4'] },
    { id: 2, text: '한인 민박 할인 코드: KOREA2024 🏠', colors: ['#A1C4FD', '#C2E9FB'] },
    { id: 3, text: '파리 맛집 투어 선착순 모집 중 🍷', colors: ['#84FAB0', '#8FD3F4'] },
    { id: 4, text: '베를린 벼룩시장 이번 주말 개최! 🥨', colors: ['#F6D365', '#FDA085'] },
    { id: 5, text: '독일어/프랑스어 과외 매칭 서비스 🎓', colors: ['#A18CD1', '#FBC2EB'] },
];

const AdBanner = () => {
    const scrollRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { width } = useWindowDimensions();
    const cardWidth = Math.max(280, width - 48);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const next = (currentIndex + 1) % ADS.length;
            setCurrentIndex(next);
            scrollRef.current?.scrollTo({ x: next * cardWidth, animated: true });
        }, 4000);

        return () => clearInterval(intervalId);
    }, [currentIndex, cardWidth]);

    const moveTo = (idx) => {
        const safe = (idx + ADS.length) % ADS.length;
        setCurrentIndex(safe);
        scrollRef.current?.scrollTo({ x: safe * cardWidth, animated: true });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                    setCurrentIndex(index);
                }}
            >
                {ADS.map((ad) => (
                    <View key={ad.id} style={[styles.slide, { backgroundColor: ad.colors[0], width: cardWidth }]}>
                        <View style={[styles.overlay, { backgroundColor: ad.colors[1] }]} />
                        <Text style={styles.text} numberOfLines={2}>{ad.text}</Text>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={[styles.navBtn, styles.leftBtn]} onPress={() => moveTo(currentIndex - 1)}>
                <ChevronLeft size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, styles.rightBtn]} onPress={() => moveTo(currentIndex + 1)}>
                <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>

            <View style={styles.dots}>
                {ADS.map((_, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => moveTo(idx)}
                        style={[styles.dot, idx === currentIndex && styles.dotActive]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 110,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 20,
    },
    slide: {
        height: 110,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.35,
    },
    text: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
        lineHeight: 22,
    },
    navBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftBtn: {
        left: 10,
    },
    rightBtn: {
        right: 10,
    },
    dots: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
        width: 16,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
});

export default AdBanner;
