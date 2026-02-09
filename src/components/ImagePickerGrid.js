import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import { pickImages } from '../utils/imageUpload';

const ImagePickerGrid = ({ images, setImages, maxCount = 10 }) => {
    const handlePick = async () => {
        try {
            const picked = await pickImages(images.length);
            if (picked.length > 0) {
                setImages(prev => [...prev, ...picked]);
            }
        } catch (error) {
            Alert.alert('알림', error.message);
        }
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
            <TouchableOpacity style={styles.addBtn} onPress={handlePick}>
                <Camera size={24} color="#9B9B9B" />
                <Text style={styles.countText}>{images.length}/{maxCount}</Text>
            </TouchableOpacity>
            {images.map((img) => (
                <View key={img.id} style={styles.imageItem}>
                    <Image source={{ uri: img.uri }} style={styles.image} />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(img.id)}>
                        <X size={12} color="#fff" />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    addBtn: {
        width: 80, height: 80, borderRadius: 14, borderWidth: 1.5,
        borderColor: '#E0E0E0', borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    countText: { fontSize: 12, color: '#9B9B9B', marginTop: 4 },
    imageItem: { width: 80, height: 80, borderRadius: 14, marginRight: 10, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    removeBtn: {
        position: 'absolute', top: 4, right: 4, width: 20, height: 20,
        borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
});

export default ImagePickerGrid;
