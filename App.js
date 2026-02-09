import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ShoppingBag, MessageCircle, Bell, User } from 'lucide-react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import HomeScreen from './src/pages/HomeScreen';
import MarketScreen from './src/pages/MarketScreen';
import ChatListScreen from './src/pages/ChatListScreen';
import AlarmScreen from './src/pages/AlarmScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import Login from './src/pages/Login';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 하단 탭 내비게이션
function MainTabs() {
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
          else if (route.name === 'Market') IconComponent = ShoppingBag;
          else if (route.name === 'Chat') IconComponent = MessageCircle;
          else if (route.name === 'Alarm') IconComponent = Bell;
          else if (route.name === 'Profile') IconComponent = User;

          return <IconComponent size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Market" component={MarketScreen} options={{ tabBarLabel: '마켓' }} />
      <Tab.Screen name="Chat" component={ChatListScreen} options={{ tabBarLabel: '채팅' }} />
      <Tab.Screen name="Alarm" component={AlarmScreen} options={{ tabBarLabel: '알림' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '마이' }} />
    </Tab.Navigator>
  );
}

// 전체 내비게이션 로직 (Auth 여부에 따라 화면 전환)
function AppNavigator() {
  const { user, loading } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
