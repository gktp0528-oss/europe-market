import React, { useState, useRef } from 'react';
import { StyleSheet, View, Image, Dimensions, ScrollView } from 'react-native';
import { ImageIcon } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ImageCarousel = ({ images = [], height = 300 }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setActiveIndex(index);
    };

    if (!images || images.length === 0) {
        return (
            <View style={[styles.placeholder, { height }]}>
                <ImageIcon size={48} color="#ddd" />
            </View>
        );
    }

    return (
        <View style={{ height }}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {images.map((uri, index) => (
                    <Image
                        key={index}
                        source={{ uri }}
                        style={[styles.image, { width: SCREEN_WIDTH, height }]}
                    />
                ))}
            </ScrollView>

            {images.length > 1 && (
                <View style={styles.dots}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[styles.dot, activeIndex === index && styles.dotActive]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        resizeMode: 'cover',
    },
    dots: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 18,
    },
});

export default ImageCarousel;
