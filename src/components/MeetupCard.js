import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Users, Calendar } from 'lucide-react-native';
import { getPostTimeLabel } from '../utils/dateUtils';

const MeetupCard = ({ item, onPress }) => {
    const metadata = item.metadata || {};
    const tags = metadata.tags || [];
    const members = metadata.members || '';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.topRow}>
                <View style={styles.iconWrap}>
                    <Users size={20} color="#C3B1E1" />
                </View>
                <View style={styles.titleArea}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    {tags.length > 0 && (
                        <View style={styles.tagRow}>
                            {tags.slice(0, 3).map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaArea}>
                {item.location ? (
                    <View style={styles.metaRow}>
                        <MapPin size={12} color="#9B9B9B" />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                    </View>
                ) : null}
                {members ? (
                    <View style={styles.metaRow}>
                        <Users size={12} color="#9B9B9B" />
                        <Text style={styles.metaText}>{members}명 모집</Text>
                    </View>
                ) : null}
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
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#C3B1E115',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    titleArea: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4A4A4A',
        marginBottom: 6,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        backgroundColor: '#C3B1E118',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8B6FB5',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    metaArea: {
        gap: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: '#9B9B9B',
        marginLeft: 6,
        flex: 1,
    },
});

export default React.memo(MeetupCard);
