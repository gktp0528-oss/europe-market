import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search as SearchIcon, MessageCircle, Bell, User } from 'lucide-react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CountryProvider } from './src/contexts/CountryContext';
import { ChatUnreadProvider, useChatUnread } from './src/contexts/ChatUnreadContext';

// Pages
import HomeScreen from './src/pages/HomeScreen';
import ChatListScreen from './src/pages/ChatListScreen';
import AlarmScreen from './src/pages/AlarmScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import Login from './src/pages/Login';
import CategoryClothesScreen from './src/pages/CategoryClothesScreen';
import CategoryJobsScreen from './src/pages/CategoryJobsScreen';
import CategoryTutoringScreen from './src/pages/CategoryTutoringScreen';
import CategoryMeetupsScreen from './src/pages/CategoryMeetupsScreen';
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 홈 탭 스택
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="CategoryClothes" component={CategoryClothesScreen} />
            <Stack.Screen name="CategoryJobs" component={CategoryJobsScreen} />
            <Stack.Screen name="CategoryTutoring" component={CategoryTutoringScreen} />
            <Stack.Screen name="CategoryMeetups" component={CategoryMeetupsScreen} />
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

// 검색 탭 스택
function SearchStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SearchMain" component={SearchScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="TutoringDetail" component={TutoringDetailScreen} />
            <Stack.Screen name="MeetupDetail" component={MeetupDetailScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        </Stack.Navigator>
    );
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

// 하단 탭 내비게이션
function MainTabs() {
    const { totalUnread } = useChatUnread();

    return (
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
                    else if (route.name === 'Search') IconComponent = SearchIcon;
                    else if (route.name === 'Chat') IconComponent = MessageCircle;
                    else if (route.name === 'Alarm') IconComponent = Bell;
                    else if (route.name === 'Profile') IconComponent = User;

                    return <IconComponent size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: '홈' }} />
            <Tab.Screen name="Search" component={SearchStack} options={{ tabBarLabel: '검색' }} />
            <Tab.Screen
                name="Chat"
                component={ChatStack}
                options={{
                    tabBarLabel: '채팅',
                    tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
                    tabBarBadgeStyle: { backgroundColor: '#FFB7B2', fontSize: 10 },
                }}
            />
            <Tab.Screen name="Alarm" component={AlarmScreen} options={{ tabBarLabel: '알림' }} />
            <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: '마이' }} />
        </Tab.Navigator>
    );
}

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
                        <AppNavigator />
                    </NavigationContainer>
                </ChatUnreadProvider>
            </CountryProvider>
        </AuthProvider>
    );
}
