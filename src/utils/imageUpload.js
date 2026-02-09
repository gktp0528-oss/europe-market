import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';

export const pickImages = async (existingCount = 0) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('사진 접근 권한이 필요합니다.');
    }

    const remaining = 10 - existingCount;
    if (remaining <= 0) {
        throw new Error('사진은 최대 10장까지 업로드할 수 있어요.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.8,
    });

    if (result.canceled) return [];

    return result.assets.map(asset => ({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
    }));
};

export const uploadImages = async (images, category) => {
    const urls = [];

    for (const img of images) {
        const compressed = await ImageManipulator.manipulateAsync(
            img.uri,
            [{ resize: { width: 1200 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const filePath = `${category}/${fileName}`;

        const response = await fetch(compressed.uri);
        const blob = await response.blob();

        const arrayBuffer = await new Response(blob).arrayBuffer();

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(data.path);

        urls.push(publicUrl);
    }

    return urls;
};
