import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { ConnectionPill, LoadingState, PrimaryButton, Screen, SectionTitle, Surface } from '@/components/AppPrimitives';
import { VitalCard } from '@/components/VitalCard';
import { HeartRateChart } from '@/components/HeartRateChart';

export default function DashboardScreen() {
  useKeepAwake();
  const colors = useColors();
  const router = useRouter();
  const { hydrated, snapshot, settings, connection, contacts, user, systemState, heartRateHistory, reconnect, triggerEmergency } = useApp();
  if (!hydrated) return <Screen><LoadingState /></Screen>;
  const stateCopy = systemState === 2 ? { label: 'ACİL DURUM', icon: 'warning' as const, color: colors.destructive } : systemState === 1 ? { label: 'ONAY BEKLENİYOR', icon: 'alert-circle' as const, color: '#D29922' } : { label: 'SİSTEM NORMAL', icon: 'checkmark-circle' as const, color: colors.primary };
  const firstName = user.name.trim().split(' ')[0] || 'Merhaba';
  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>LIFE BLACK BOX</Text><Text style={[styles.greeting, { color: colors.foreground }]}>{firstName}, güvendesin.</Text></View><Pressable onPress={() => router.push('/settings')} style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="settings-outline" size={19} color={colors.foreground} /></Pressable></View><ConnectionPill state={connection} onPress={reconnect} /><View style={[styles.monitorBanner, { backgroundColor: colors.secondary, borderColor: colors.border }]}><View style={[styles.monitorIcon, { backgroundColor: colors.primary }]}><Ionicons name="shield-checkmark" size={19} color={colors.primaryForeground} /></View><View style={styles.bannerText}><Text style={[styles.bannerTitle, { color: colors.foreground }]}>Koruma aktif</Text><Text style={[styles.bannerCaption, { color: colors.mutedForeground }]}>Cihaz verileri her saniye güncelleniyor</Text></View><View style={styles.battery}><Ionicons name="battery-half" size={17} color={colors.primary} /><Text style={[styles.batteryText, { color: colors.primary }]}>82%</Text></View></View><SectionTitle title="Anlık değerler" action={settings.demoMode ? 'DEMO' : undefined} /><View style={styles.grid}><View style={styles.row}><VitalCard vital="hr" value={snapshot.hr} settings={settings} /><VitalCard vital="spo2" value={snapshot.spo2} settings={settings} /></View><View style={styles.row}><VitalCard vital="acc" value={snapshot.acc} settings={settings} /><VitalCard vital="temp" value={snapshot.temp} settings={settings} /></View><View style={styles.row}><VitalCard vital="hum" value={snapshot.hum} settings={settings} /><VitalCard vital="co" value={snapshot.co} settings={settings} /></View></View><HeartRateChart readings={heartRateHistory} /><Surface style={styles.statusCard}><View style={[styles.statusIcon, { backgroundColor: `${stateCopy.color}18` }]}><Ionicons name={stateCopy.icon} size={23} color={stateCopy.color} /></View><View style={styles.statusCopy}><Text style={[styles.statusTitle, { color: colors.foreground }]}>{stateCopy.label}</Text><Text style={[styles.statusCaption, { color: colors.mutedForeground }]}>{systemState === 0 ? 'Tüm sensörler normal aralıkta' : 'Güvenliğin için yanındayız'}</Text></View><View style={[styles.statusLine, { backgroundColor: stateCopy.color }]} /></Surface><View style={styles.sosBlock}><Text style={[styles.sosHint, { color: colors.mutedForeground }]}>Yardıma ihtiyacın varsa</Text><Pressable testID="sos-button" onPress={() => { if (!contacts.length) { router.push('/contacts'); return; } triggerEmergency('Kullanıcı manuel SOS başlattı'); router.push('/emergency'); }} style={({ pressed }) => [styles.sosButton, { backgroundColor: colors.destructive, transform: [{ scale: pressed ? 0.96 : 1 }] }]}><Ionicons name="warning" size={27} color="#FFFFFF" /><Text style={styles.sosText}>ACİL SOS</Text></Pressable><Text style={[styles.sosFootnote, { color: colors.mutedForeground }]}>{contacts.length ? `${contacts.length} acil kişi bilgilendirilmeye hazır` : 'Önce acil kişi eklemelisin'}</Text></View><View style={{ height: 30 }} /></ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  greeting: { fontSize: 25, fontWeight: '800', letterSpacing: -0.8, marginTop: 5 },
  headerButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  monitorBanner: { marginTop: 18, borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center' },
  monitorIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, marginLeft: 10 },
  bannerTitle: { fontWeight: '800', fontSize: 14 },
  bannerCaption: { fontSize: 11, marginTop: 3 },
  battery: { alignItems: 'center', gap: 2 },
  batteryText: { fontSize: 10, fontWeight: '800' },
  grid: { marginHorizontal: -4 },
  row: { flexDirection: 'row' },
  statusCard: { marginTop: 18, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  statusIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statusCopy: { flex: 1, marginLeft: 12 },
  statusTitle: { fontSize: 14, fontWeight: '800' },
  statusCaption: { fontSize: 12, marginTop: 4 },
  statusLine: { width: 4, height: 50, borderRadius: 4, marginLeft: 8 },
  sosBlock: { alignItems: 'center', marginTop: 26 },
  sosHint: { fontSize: 12, marginBottom: 10 },
  sosButton: { width: 150, height: 64, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, shadowColor: '#D94343', shadowOpacity: 0.3, shadowRadius: 14, elevation: 5 },
  sosText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  sosFootnote: { fontSize: 11, marginTop: 9 },
});