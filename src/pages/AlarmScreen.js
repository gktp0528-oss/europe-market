import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AlarmScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.title}>알림 🔔</Text>
            <View style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>알림 서비스 이사 중입니다... 🚚🔔</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 20,
    },
    placeholderCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#9B9B9B',
        fontSize: 14,
    },
});

export default AlarmScreen;
