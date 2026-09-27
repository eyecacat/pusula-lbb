import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const colors = useColors();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.mutedForeground, tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: Platform.OS === 'web' ? 84 : 70, paddingTop: 8, paddingBottom: Platform.OS === 'web' ? 30 : 10 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: 'Ana Sayfa', tabBarIcon: ({ color, size }) => <Ionicons name="pulse" color={color} size={size} /> }} />
    <Tabs.Screen name="history" options={{ title: 'Geçmiş', tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="contacts" options={{ title: 'Acil Kişiler', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="settings" options={{ title: 'Ayarlar', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
  </Tabs>;
}