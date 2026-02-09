import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MapPin, Clock, GraduationCap, BookOpen } from 'lucide-react-native';
import { getPostTimeLabel } from '../utils/dateUtils';

const TutoringCard = ({ item, onPress }) => {
    const subject = item.metadata?.subject || '';
    const level = item.metadata?.level || '';
    const priceLabel = item.price ? String(item.price) : '협의';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.iconWrap}>
                <GraduationCap size={24} color="#B5EAD7" />
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                {subject ? (
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <BookOpen size={10} color="#B5EAD7" />
                            <Text style={styles.badgeText}>{subject}</Text>
                        </View>
                        {level ? (
                            <View style={[styles.badge, { backgroundColor: '#E8E8E8' }]}>
                                <Text style={[styles.badgeText, { color: '#6a6a6a' }]}>{level}</Text>
                            </View>
                        ) : null}
                    </View>
                ) : null}
                <View style={styles.bottomRow}>
                    <Text style={styles.price}>{priceLabel}</Text>
                    <View style={styles.metaRow}>
                        <MapPin size={11} color="#9B9B9B" />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location || '위치 미정'}</Text>
                    </View>
                </View>
                <View style={styles.metaRow}>
                    <Clock size={11} color="#9B9B9B" />
                    <Text style={styles.metaText}>{getPostTimeLabel(item)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#B5EAD715',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4A4A4A',
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#B5EAD720',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4A9E7E',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '800',
        color: '#B5EAD7',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    metaText: {
        fontSize: 11,
        color: '#9B9B9B',
        marginLeft: 4,
    },
});

export default React.memo(TutoringCard);
