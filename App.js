import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShoppingBag, MessageCircle, User, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>유럽 중고거래 🎨</Text>
          <TouchableOpacity style={styles.countryBtn}>
            <MapPin size={18} color="#FFB7B2" />
            <Text style={styles.countryText}>프랑스</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Board */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>하은 대표님~!! 😍</Text>
          <Text style={styles.welcomeSubtitle}>
            이제 진짜 '앱'으로 만나요! 📱✨{"\n"}
            여기가 바로 마법이 시작될 곳이에요.
          </Text>
        </View>

        {/* Quick Menu */}
        <View style={styles.menuGrid}>
          {[
            { name: '중고거래', icon: ShoppingBag, color: '#FFB7B2' },
            { name: '채팅하기', icon: MessageCircle, color: '#B5EAD7' },
            { name: '내 프로필', icon: User, color: '#C7CEEA' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={[styles.menuItem, { backgroundColor: item.color + '33' }]}>
              <item.icon size={28} color={item.color} />
              <Text style={styles.menuLabel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Status */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            디자인 실장 희은이가 실시간으로{"\n"}
            앱을 예쁘게 빚는 중... 🛠️💖
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEFDF5',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  countryText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  welcomeCard: {
    backgroundColor: '#FFB7B233',
    padding: 30,
    borderRadius: 30,
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4A4A',
    opacity: 0.8,
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  menuItem: {
    width: (width - 48 - 32) / 3,
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9B9B9B',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
