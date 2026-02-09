import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react-native';

const ProfileScreen = () => {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>내 프로필 👤</Text>

            {user ? (
                <View style={styles.profileCard}>
                    <View style={styles.avatarPlaceholder} />
                    <Text style={styles.emailText}>{user.email}</Text>
                    <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                        <LogOut size={18} color="#FFB7B2" />
                        <Text style={styles.logoutText}>로그아웃</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.placeholderCard}>
                    <Text style={styles.placeholderText}>로그인이 필요합니다. ✨</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFDF5',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4A4A4A',
        marginBottom: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE5E5',
        marginBottom: 16,
    },
    emailText: {
        fontSize: 16,
        color: '#4A4A4A',
        fontWeight: '600',
        marginBottom: 20,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    logoutText: {
        marginLeft: 8,
        color: '#FFB7B2',
        fontWeight: '700',
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

export default ProfileScreen;
