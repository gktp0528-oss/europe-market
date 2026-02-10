import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AlarmScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { refreshNotifications, setIsAlarmActive, markAllAsRead } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [approvingRequestId, setApprovingRequestId] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }
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
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // 실시간 알림 목록 구독 복구
        const channel = supabase
            .channel(`alarm_screen_list_${user.id}`)
            .on('postgres_changes', {
                event: '*', // INSERT, UPDATE, DELETE 모두 감지
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                // 데이터 변경 시 목록 다시 가져오기 (가장 정확한 방법)
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    useFocusEffect(
        useCallback(() => {
            if (!user) return undefined;

            setIsAlarmActive(true);

            const syncOnFocus = async () => {
                await markAllAsRead();
                await fetchNotifications();
                await refreshNotifications();
            };
            syncOnFocus();

            return () => {
                setIsAlarmActive(false);
            };
        }, [user, setIsAlarmActive, markAllAsRead, fetchNotifications, refreshNotifications])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const handleNotificationClick = async (item) => {
        // 읽음 처리
        if (!item.is_read) {
            try {
                const { error } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', item.id);

                if (!error) {
                    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
                    // 뱃지 숫자 즉시 동기화
                    await refreshNotifications();
                }
            } catch (err) {
                console.error('Error marking as read:', err);
            }
        }

        // 페이지 이동
        if (item.type === 'transaction') {
            if (item.title === '이용 완료 확정') {
                navigation.navigate('Rating', { transactionId: item.link_id });
                return;
            }
            if (item.title === '이용 완료 요청') {
                navigation.navigate('ChatRoom', { conversationId: item.link_id });
                return;
            }
            if (item.title === '모임 승인 완료') {
                navigation.navigate('Home', {
                    screen: 'MeetupDetail',
                    params: { postId: Number(item.link_id) },
                });
                return;
            }
            if (item.title === '모임 승인 요청') {
                try {
                    const { data } = await supabase
                        .from('meetup_join_requests')
                        .select('post_id')
                        .eq('id', item.link_id)
                        .single();
                    if (data?.post_id) {
                        navigation.navigate('Home', {
                            screen: 'MeetupDetail',
                            params: { postId: Number(data.post_id) },
                        });
                    }
                } catch (err) {
                    console.error('Fetch meetup request detail error:', err);
                }
                return;
            }
        }

        if (item.type === 'message') {
            navigation.navigate('ChatRoom', { conversationId: item.link_id });
            return;
        }

        if (item.type === 'like') {
            try {
                const postId = Number(item.link_id);
                const { data: post } = await supabase
                    .from('posts')
                    .select('category')
                    .eq('id', postId)
                    .single();

                const screenMap = {
                    'used': 'ProductDetail',
                    'job': 'JobDetail',
                    'tutoring': 'TutoringDetail',
                    'meetup': 'MeetupDetail'
                };

                // [희은] Home 탭 스택 안의 화면으로 안전하게 navigate! 🏠✨
                navigation.navigate('Home', {
                    screen: screenMap[post?.category] || 'ProductDetail',
                    params: { postId }
                });
            } catch (err) {
                console.error('Navigation error:', err);
                navigation.navigate('Home', { screen: 'ProductDetail', params: { postId: Number(item.link_id) } });
            }
        }
    };

    const handleApproveMeetupRequest = async (item) => {
        if (!item?.link_id) return;
        setApprovingRequestId(item.id);
        try {
            const { error } = await supabase.rpc('approve_meetup_approval', {
                p_request_id: item.link_id,
            });
            if (error) throw error;

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', item.id);

            setNotifications((prev) => prev.map((n) => (
                n.id === item.id
                    ? { ...n, is_read: true, title: '모임 승인 처리 완료' }
                    : n
            )));
            await refreshNotifications();
            Alert.alert('완료', '모임 참가 요청을 승인했습니다.');
        } catch (error) {
            console.error('Approve meetup request error:', error);
            Alert.alert('오류', error?.message || '승인 처리 중 문제가 발생했습니다.');
        } finally {
            setApprovingRequestId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (notifications.length === 0) return;

        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length === 0) return;

            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            await refreshNotifications();
            Alert.alert('알림', '모든 알림을 읽음 처리했어요! ✨');
        } catch (error) {
            console.error('Error marking all as read:', error);
            Alert.alert('오류', '전체 읽음 처리 중 문제가 발생했어요.');
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
            refreshNotifications();
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
                    {item.type === 'transaction' && item.title === '모임 승인 요청' && !item.is_read ? (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.approveBtn}
                                onPress={() => handleApproveMeetupRequest(item)}
                                disabled={approvingRequestId === item.id}
                            >
                                <Text style={styles.approveBtnText}>
                                    {approvingRequestId === item.id ? '처리 중...' : '승인'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
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
                {notifications.some(n => !n.is_read) && (
                    <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.readAllBtn}>
                        <Text style={styles.readAllText}>전체 읽음</Text>
                    </TouchableOpacity>
                )}
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
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#FF6347" />
                    }
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2D3436',
    },
    readAllBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F1F2F6',
    },
    readAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#636E72',
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
    actionRow: {
        marginTop: 8,
    },
    approveBtn: {
        alignSelf: 'flex-start',
        backgroundColor: '#EAF8F2',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    approveBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2F9D6A',
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
