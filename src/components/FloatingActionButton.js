import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Briefcase, GraduationCap, Users, Pencil, X } from 'lucide-react-native';

const OPTIONS = [
    { icon: ShoppingBag, label: '중고거래', type: 'used' },
    { icon: Briefcase, label: '알바', type: 'job' },
    { icon: GraduationCap, label: '과외/레슨', type: 'tutoring' },
    { icon: Users, label: '모임', type: 'meetup' },
];

const FloatingActionButton = () => {
    const navigation = useNavigation();
    const [expanded, setExpanded] = useState(false);

    const handleOptionPress = (option) => {
        setExpanded(false);
        const parent = navigation.getParent();
        const root = parent?.getParent();

        if (root) {
            root.navigate('SelectCountry', { type: option.type });
            return;
        }
        if (parent) {
            parent.navigate('SelectCountry', { type: option.type });
            return;
        }
        navigation.navigate('SelectCountry', { type: option.type });
    };

    return (
        <>
            {expanded && (
                <Pressable style={styles.overlay} onPress={() => setExpanded(false)} />
            )}

            <View style={styles.container} pointerEvents="box-none">
                {expanded && (
                    <View style={styles.options}>
                        {OPTIONS.map((option, index) => {
                            const IconComponent = option.icon;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionBtn}
                                    onPress={() => handleOptionPress(option)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.optionIcon}>
                                        <IconComponent size={18} color="#fff" />
                                    </View>
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.fab, expanded && styles.fabActive]}
                    onPress={() => setExpanded(!expanded)}
                    activeOpacity={0.8}
                >
                    {expanded ? (
                        <X size={24} color="#fff" />
                    ) : (
                        <Pencil size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 998,
    },
    container: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 999,
    },
    options: {
        marginBottom: 12,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    optionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFB7B2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFB7B2',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFB7B2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabActive: {
        backgroundColor: '#4A4A4A',
    },
});

export default FloatingActionButton;
