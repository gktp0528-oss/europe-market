import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Clock, Heart, Eye } from 'lucide-react-native';
import { getPostTimeLabel } from '../utils/dateUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // 2열 배치 기준

const ProductCard = ({ item, onPress, variant = 'grid' }) => {
    const priceLabel = item.price ? String(item.price) : '가격 협의';
    const isList = variant === 'list';

    return (
        <TouchableOpacity style={[styles.card, isList && styles.cardList]} onPress={onPress}>
            {/* Product Image */}
            <View style={[styles.imageWrapper, isList && styles.imageWrapperList]}>
                {item.image_urls && item.image_urls.length > 0 ? (
                    <Image source={{ uri: item.image_urls[0] }} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: item.color || '#F5F5F5' }]} />
                )}
            </View>

            {/* Product Info */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <MapPin size={12} color="#9B9B9B" />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location || '위치 미정'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={12} color="#9B9B9B" />
                        <Text style={styles.metaText}>{getPostTimeLabel(item)}</Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.price}>{priceLabel}</Text>
                    <View style={styles.interactions}>
                        <View style={styles.interactionItem}>
                            <Eye size={12} color="#9B9B9B" />
                            <Text style={styles.interactionText}>{item.views || 0}</Text>
                        </View>
                        <View style={styles.interactionItem}>
                            <Heart size={12} color="#FFB7B2" />
                            <Text style={styles.interactionText}>{item.likes || 0}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardList: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 12,
        gap: 16,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
    },
    imageWrapperList: {
        width: 90,
        height: 90,
        borderRadius: 12,
        overflow: 'hidden',
        flexShrink: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
    },
    info: {
        padding: 12,
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A4A4A',
        marginBottom: 8,
        height: 38,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'nowrap',
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    metaText: {
        fontSize: 10,
        color: '#9B9B9B',
        marginLeft: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFB7B2',
    },
    interactions: {
        flexDirection: 'row',
        gap: 8,
    },
    interactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interactionText: {
        fontSize: 10,
        color: '#9B9B9B',
        marginLeft: 4,
    },
});

export default ProductCard;
