import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AlarmScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // 실시간 알림 구독
        const subscription = supabase
            .channel('public:notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (item) => {
        // 읽음 처리
        if (!item.is_read) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', item.id);

            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        }

        // 페이지 이동
        if (item.type === 'transaction' && (item.title === '이용 완료 요청' || item.title === '이용 완료 확정' || item.type === 'message')) {
            // 메시지 알림은 이제 생성되지 않지만, 기존 데이터 호환을 위해 일단 유지하거나 수정 가능
            if (item.title === '이용 완료 확정') {
                navigation.navigate('Rating', { transactionId: item.link_id });
            } else {
                navigation.navigate('ChatRoom', { conversationId: item.link_id });
            }
        } else if (item.type === 'like') {
            try {
                const { data: post } = await supabase
                    .from('posts')
                    .select('category')
                    .eq('id', item.link_id)
                    .single();

                if (post) {
                    const screenMap = {
                        'used': 'ProductDetail',
                        'job': 'JobDetail',
                        'tutoring': 'TutoringDetail',
                        'meetup': 'MeetupDetail'
                    };
                    navigation.navigate(screenMap[post.category] || 'ProductDetail', { id: item.link_id });
                } else {
                    navigation.navigate('ProductDetail', { id: item.link_id });
                }
            } catch (err) {
                navigation.navigate('ProductDetail', { id: item.link_id });
            }
        }
    };

    const deleteNotification = async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
            Alert.alert('오류', '알림을 삭제하는 중 문제가 발생했어요.');
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.notificationWrapper, !item.is_read && styles.unreadWrapper]}>
            <TouchableOpacity
                style={styles.notificationCardContent}
                onPress={() => handleNotificationClick(item)}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>
                        {item.type === 'like' ? '❤️' : (item.type === 'message' ? '💬' : '🔔')}
                    </Text>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationContent} numberOfLines={2}>{item.content}</Text>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteNotification(item.id)}
            >
                <X size={16} color="#B2BEC3" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>알림 🔔</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#FF6347" />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.placeholderCard}>
                    <Text style={styles.placeholderText}>아직 알림이 없어요... 🚚🔔</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 24,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2D3436',
    },
    listContent: {
        padding: 16,
    },
    notificationWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        paddingRight: 8,
    },
    unreadWrapper: {
        backgroundColor: '#FFF9F8',
        borderWidth: 1,
        borderColor: '#FFEBEA',
    },
    notificationCardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingRight: 0,
    },
    deleteBtn: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F2F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 20,
    },
    contentContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 4,
    },
    notificationContent: {
        fontSize: 14,
        color: '#636E72',
        marginBottom: 6,
    },
    timeText: {
        fontSize: 11,
        color: '#B2BEC3',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF6347',
        marginLeft: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    placeholderText: {
        color: '#B2BEC3',
        fontSize: 15,
        textAlign: 'center',
    },
});

export default AlarmScreen;
