import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

const SuccessModal = ({
    visible,
    onClose,
    title,
    message,
    buttonText = '확인',
    Icon = CheckCircle,
    iconColor = '#FFB7B2',
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
                        <Icon size={30} color={iconColor} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 40,
    },
    content: {
        backgroundColor: '#fff', borderRadius: 24, padding: 32,
        alignItems: 'center', width: '100%', maxWidth: 320,
    },
    iconCircle: {
        width: 60, height: 60, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    title: { fontSize: 20, fontWeight: '800', color: '#4A4A4A', marginBottom: 8, textAlign: 'center' },
    message: { fontSize: 14, color: '#9B9B9B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    button: {
        backgroundColor: '#FFB7B2', paddingVertical: 14, paddingHorizontal: 32,
        borderRadius: 16, width: '100%', alignItems: 'center',
    },
    buttonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default SuccessModal;
