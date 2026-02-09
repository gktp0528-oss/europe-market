import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useCountry, SUPPORTED_COUNTRIES } from '../contexts/CountryContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 80) / 3;

const CountryModal = ({ visible, onClose }) => {
    const { selectedCountry, setSelectedCountry } = useCountry();

    const handleSelect = (country) => {
        setSelectedCountry(country);
        onClose();
    };

    const renderItem = ({ item }) => {
        const isActive = selectedCountry.code === item.code;
        return (
            <TouchableOpacity
                style={[styles.countryItem, isActive && styles.countryItemActive]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={[styles.countryName, isActive && styles.countryNameActive]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.content} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>국가 선택</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color="#4A4A4A" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.desc}>
                        원하시는 국가를 선택해주세요.{'\n'}해당 국가의 게시물만 보여집니다.
                    </Text>

                    <FlatList
                        data={SUPPORTED_COUNTRIES}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.code}
                        numColumns={3}
                        contentContainerStyle={styles.grid}
                        scrollEnabled={false}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: width - 40,
        maxWidth: 400,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4A4A4A',
    },
    closeBtn: {
        padding: 4,
    },
    desc: {
        fontSize: 13,
        color: '#9B9B9B',
        lineHeight: 20,
        marginBottom: 20,
    },
    grid: {
        alignItems: 'center',
    },
    countryItem: {
        width: ITEM_SIZE,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    countryItemActive: {
        backgroundColor: '#FFB7B220',
    },
    countryFlag: {
        fontSize: 28,
        marginBottom: 6,
    },
    countryName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    countryNameActive: {
        color: '#FFB7B2',
        fontWeight: '700',
    },
});

export default CountryModal;
