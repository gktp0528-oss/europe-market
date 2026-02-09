import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const ADS = [
    {
        id: 1,
        badge: '스폰서',
        title: '유럽 한인 국제택배 48시간 특가',
        subtitle: '부다페스트·프라하·베를린 픽업 무료',
        cta: '지금 예약',
        colors: ['#FF7A7A', '#FFB29F'],
    },
    {
        id: 2,
        badge: '프로모션',
        title: '한인 민박 봄 시즌 최대 22% 할인',
        subtitle: '입력코드: EUROKOREA22',
        cta: '객실 보기',
        colors: ['#6DA8FF', '#93C8FF'],
    },
    {
        id: 3,
        badge: '신규',
        title: '독일어/프랑스어 과외 매칭 오픈',
        subtitle: '첫 수업 무료 체험 + 1:1 레벨 진단',
        cta: '튜터 찾기',
        colors: ['#7ED6A4', '#9DE3C8'],
    },
    {
        id: 4,
        badge: '주말추천',
        title: '베를린 벼룩시장 셀러 모집',
        subtitle: '자리비 선착순 30팀 · 안전결제 지원',
        cta: '참가 신청',
        colors: ['#F2B86B', '#F6D38E'],
    },
    {
        id: 5,
        badge: '인기',
        title: '유럽 현지 통번역 알바 긴급 채용',
        subtitle: '시급 €18부터 · 주 2회 가능',
        cta: '공고 보기',
        colors: ['#9D86E9', '#C2A9FF'],
    },
];
const BANNER_ASPECT_RATIO = 16 / 7;

const AdBanner = () => {
    const scrollRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { width } = useWindowDimensions();
    const cardWidth = Math.max(280, width - 32);
    const bannerHeight = Math.round(cardWidth / BANNER_ASPECT_RATIO);

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
        <View style={[styles.container, { height: bannerHeight }]}>
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
                    <View key={ad.id} style={[styles.slide, { backgroundColor: ad.colors[0], width: cardWidth, height: bannerHeight }]}>
                        <View style={[styles.overlay, { backgroundColor: ad.colors[1] }]} />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{ad.badge}</Text>
                        </View>
                        <Text style={styles.title} numberOfLines={1}>{ad.title}</Text>
                        <Text style={styles.subtitle} numberOfLines={1}>{ad.subtitle}</Text>
                        <View style={styles.ctaPill}>
                            <Text style={styles.ctaText}>{ad.cta}</Text>
                        </View>
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
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 20,
    },
    slide: {
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.35,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.28)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 11,
    },
    title: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 17,
        lineHeight: 22,
        marginBottom: 2,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
        fontSize: 13,
        lineHeight: 18,
    },
    ctaPill: {
        position: 'absolute',
        right: 14,
        bottom: 12,
        backgroundColor: 'rgba(255,255,255,0.26)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    ctaText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
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
