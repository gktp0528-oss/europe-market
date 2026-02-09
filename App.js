import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Home, MessageCircle, Bell, User, Pencil } from 'lucide-react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CountryProvider } from './src/contexts/CountryContext';
import { ChatUnreadProvider, useChatUnread } from './src/contexts/ChatUnreadContext';

// Pages
import HomeScreen from './src/pages/HomeScreen';
import ChatListScreen from './src/pages/ChatListScreen';
import AlarmScreen from './src/pages/AlarmScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import Login from './src/pages/Login';
import CategoryListScreen from './src/pages/CategoryListScreen';
import ProductDetailScreen from './src/pages/ProductDetailScreen';
import JobDetailScreen from './src/pages/JobDetailScreen';
import TutoringDetailScreen from './src/pages/TutoringDetailScreen';
import MeetupDetailScreen from './src/pages/MeetupDetailScreen';
import WriteUsedScreen from './src/pages/WriteUsedScreen';
import WriteJobScreen from './src/pages/WriteJobScreen';
import WriteTutoringScreen from './src/pages/WriteTutoringScreen';
import WriteMeetupScreen from './src/pages/WriteMeetupScreen';
import ChatRoomScreen from './src/pages/ChatRoomScreen';
import SearchScreen from './src/pages/SearchScreen';
import SignupScreen from './src/pages/SignupScreen';
import UserProfileScreen from './src/pages/UserProfileScreen';
import MyPostsScreen from './src/pages/MyPostsScreen';
import SelectCountryScreen from './src/pages/SelectCountryScreen';
import RatingScreen from './src/pages/RatingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 홈 탭 스택
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen
                name="CategoryClothes"
                component={CategoryListScreen}
                initialParams={{ initialCategory: 'CategoryClothes' }}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen
                name="CategoryJobs"
                component={CategoryListScreen}
                initialParams={{ initialCategory: 'CategoryJobs' }}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen
                name="CategoryTutoring"
                component={CategoryListScreen}
                initialParams={{ initialCategory: 'CategoryTutoring' }}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen
                name="CategoryMeetups"
                component={CategoryListScreen}
                initialParams={{ initialCategory: 'CategoryMeetups' }}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="TutoringDetail" component={TutoringDetailScreen} />
            <Stack.Screen name="MeetupDetail" component={MeetupDetailScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
        </Stack.Navigator>
    );
}

// 글쓰기 탭 – 더미 컴포넌트 (실제로는 모달로 열림)
function WritePlaceholder() {
    return null;
}

// 채팅 탭 스택
function ChatStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ChatListMain" component={ChatListScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        </Stack.Navigator>
    );
}

// 프로필 탭 스택
function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="MyPosts" component={MyPostsScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        </Stack.Navigator>
    );
}

// 글쓰기 팝업 메뉴 항목
const WRITE_OPTIONS = [
    { type: 'used', label: '중고거래' },
    { type: 'job', label: '알바' },
    { type: 'tutoring', label: '과외/레슨' },
    { type: 'meetup', label: '모임' },
];

// 하단 탭 내비게이션
function MainTabs({ navigation: rootNavigation }) {
    const { totalUnread } = useChatUnread();
    const [menuOpen, setMenuOpen] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const openMenu = () => {
        setMenuOpen(true);
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    };

    const closeMenu = (cb) => {
        Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setMenuOpen(false);
            cb?.();
        });
    };

    const handleSelect = (type) => {
        closeMenu(() => rootNavigation.navigate('SelectCountry', { type }));
    };

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: '#FFB7B2',
                    tabBarInactiveTintColor: '#9B9B9B',
                    tabBarStyle: {
                        backgroundColor: '#fff',
                        borderTopWidth: 0,
                        height: 90,
                        paddingBottom: 30,
                        paddingTop: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 10,
                    },
                    tabBarIcon: ({ color, size }) => {
                        let IconComponent;
                        if (route.name === 'Home') IconComponent = Home;
                        else if (route.name === 'Chat') IconComponent = MessageCircle;
                        else if (route.name === 'Write') IconComponent = Pencil;
                        else if (route.name === 'Alarm') IconComponent = Bell;
                        else if (route.name === 'Profile') IconComponent = User;

                        return <IconComponent size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: '홈' }} />
                <Tab.Screen
                    name="Chat"
                    component={ChatStack}
                    options={{
                        tabBarLabel: '채팅',
                        tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
                        tabBarBadgeStyle: { backgroundColor: '#FFB7B2', fontSize: 10 },
                    }}
                />
                <Tab.Screen
                    name="Write"
                    component={WritePlaceholder}
                    options={{ tabBarLabel: '글쓰기' }}
                    listeners={() => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            menuOpen ? closeMenu() : openMenu();
                        },
                    })}
                />
                <Tab.Screen name="Alarm" component={AlarmScreen} options={{ tabBarLabel: '알림' }} />
                <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: '마이' }} />
            </Tab.Navigator>

            {menuOpen && (
                <>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()} />
                    <Animated.View
                        style={[
                            popupStyles.menu,
                            {
                                opacity: anim,
                                transform: [
                                    { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                                    { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
                                ],
                            },
                        ]}
                    >
                        {WRITE_OPTIONS.map(({ type, label }, i) => (
                            <TouchableOpacity
                                key={type}
                                style={[popupStyles.item, i < WRITE_OPTIONS.length - 1 && popupStyles.itemBorder]}
                                activeOpacity={0.6}
                                onPress={() => handleSelect(type)}
                            >
                                <Text style={popupStyles.itemText}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </>
            )}
        </View>
    );
}

const popupStyles = StyleSheet.create({
    menu: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 4,
        paddingHorizontal: 4,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    item: {
        paddingVertical: 13,
        paddingHorizontal: 18,
    },
    itemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    itemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D3436',
        textAlign: 'center',
    },
});

// Auth 여부에 따라 화면 전환
function AppNavigator() {
    const { user } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="SelectCountry" component={SelectCountryScreen} />
                    <Stack.Screen name="WriteUsed" component={WriteUsedScreen} />
                    <Stack.Screen name="WriteJob" component={WriteJobScreen} />
                    <Stack.Screen name="WriteTutoring" component={WriteTutoringScreen} />
                    <Stack.Screen name="WriteMeetup" component={WriteMeetupScreen} />
                    <Stack.Screen name="Rating" component={RatingScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CountryProvider>
                <ChatUnreadProvider>
                    <NavigationContainer>
                        <StatusBar style="dark" hidden={false} />
                        <AppNavigator />
                    </NavigationContainer>
                </ChatUnreadProvider>
            </CountryProvider>
        </AuthProvider>
    );
}
