import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Clock, Briefcase, DollarSign } from 'lucide-react-native';
import { getPostTimeLabel } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const JobCard = ({ item, onPress }) => {
    const payInfo = item.price ? String(item.price) : '급여 협의';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.iconWrap}>
                <Briefcase size={24} color="#FFB7B2" />
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <DollarSign size={12} color="#FFB7B2" />
                    <Text style={styles.payText}>{payInfo}</Text>
                </View>
                <View style={styles.metaRow}>
                    <MapPin size={12} color="#9B9B9B" />
                    <Text style={styles.metaText} numberOfLines={1}>{item.location || '위치 미정'}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Clock size={12} color="#9B9B9B" />
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
        backgroundColor: '#FFB7B215',
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
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    payText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFB7B2',
        marginLeft: 6,
    },
    metaText: {
        fontSize: 12,
        color: '#9B9B9B',
        marginLeft: 6,
        flex: 1,
    },
});

export default React.memo(JobCard);
