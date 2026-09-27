import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { PrimaryButton, Screen, SectionTitle, Surface } from '@/components/AppPrimitives';

function SettingStepper({ label, value, unit, min, max, onChange }: { label: string; value: number; unit: string; min: number; max: number; onChange: (value: number) => void }) {
  const colors = useColors();
  return <View style={styles.stepperRow}><View style={styles.stepperCopy}><Text style={[styles.stepperLabel, { color: colors.foreground }]}>{label}</Text><Text style={[styles.stepperValue, { color: colors.primary }]}>{value} {unit}</Text></View><View style={styles.stepperControls}><Pressable onPress={() => onChange(Math.max(min, value - 1))} style={[styles.stepperButton, { backgroundColor: colors.secondary }]}><Ionicons name="remove" size={17} color={colors.secondaryForeground} /></Pressable><Pressable onPress={() => onChange(Math.min(max, value + 1))} style={[styles.stepperButton, { backgroundColor: colors.secondary }]}><Ionicons name="add" size={17} color={colors.secondaryForeground} /></Pressable></View></View>;
}

function ToggleRow({ label, caption, value, onChange }: { label: string; caption: string; value: boolean; onChange: () => void }) {
  const colors = useColors();
  return <View style={styles.toggleRow}><View style={styles.toggleCopy}><Text style={[styles.toggleTitle, { color: colors.foreground }]}>{label}</Text><Text style={[styles.toggleCaption, { color: colors.mutedForeground }]}>{caption}</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onChange} style={[styles.toggle, { backgroundColor: value ? colors.primary : colors.muted }]}><View style={[styles.toggleKnob, { transform: [{ translateX: value ? 20 : 2 }] }]} /></Pressable></View>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings, connection, reconnect, user } = useApp();
  const reset = () => void updateSettings({ hrLow: 45, hrHigh: 130, spo2Low: 90, coAlarm: 300, confirmationSeconds: 10 });
  const toggleNotifications = async () => {
    if (!settings.localNotifications) {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Bildirim izni gerekli', 'Uyarıları alabilmek için cihaz ayarlarından bildirim izni vermelisin.');
        return;
      }
    }
    await updateSettings({ localNotifications: !settings.localNotifications });
  };
  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Text style={[styles.eyebrow, { color: colors.primary }]}>KONTROL MERKEZİ</Text><Text style={[styles.title, { color: colors.foreground }]}>Ayarlar</Text><SectionTitle title="BLE bağlantısı" /><Surface><View style={styles.deviceRow}><View style={[styles.deviceIcon, { backgroundColor: colors.secondary }]}><Ionicons name="bluetooth" size={22} color={colors.primary} /></View><View style={styles.deviceCopy}><Text style={[styles.deviceName, { color: colors.foreground }]}>{user.deviceName || 'LifeBlackBox'}</Text><Text style={[styles.deviceStatus, { color: colors.mutedForeground }]}>{connection === 'connected' ? 'Bağlı · Demo veri akışı aktif' : connection === 'connecting' ? 'Bağlanıyor…' : 'Bağlantı bekleniyor'}</Text></View><View style={[styles.connectionDot, { backgroundColor: connection === 'connected' ? colors.primary : colors.destructive }]} /></View><PrimaryButton label="Cihazı yeniden tara" icon="refresh" onPress={reconnect} variant="ghost" /></Surface><SectionTitle title="Uyarı eşikleri" action="Varsayılana dön" onAction={reset} /><Surface><SettingStepper label="Kalp atışı alt sınırı" value={settings.hrLow} unit="bpm" min={30} max={80} onChange={(value) => void updateSettings({ hrLow: value })} /><SettingStepper label="Kalp atışı üst sınırı" value={settings.hrHigh} unit="bpm" min={100} max={180} onChange={(value) => void updateSettings({ hrHigh: value })} /><SettingStepper label="SpO2 alt sınırı" value={settings.spo2Low} unit="%" min={80} max={98} onChange={(value) => void updateSettings({ spo2Low: value })} /><SettingStepper label="CO alarm değeri" value={settings.coAlarm} unit="ADC" min={100} max={600} onChange={(value) => void updateSettings({ coAlarm: value })} /><SettingStepper label="Onay süresi" value={settings.confirmationSeconds} unit="saniye" min={5} max={30} onChange={(value) => void updateSettings({ confirmationSeconds: value })} /></Surface><SectionTitle title="Bildirimler" /><Surface><ToggleRow label="Yerel bildirimler" caption="Risk algılandığında bildirim göster" value={settings.localNotifications} onChange={() => void toggleNotifications()} /><ToggleRow label="Titreşim uyarısı" caption="Acil durumda titreşim kullan" value={settings.vibration} onChange={() => void updateSettings({ vibration: !settings.vibration })} /><ToggleRow label="Sesli alarm" caption="Türkçe ilk yardım yönlendirmesi oynat" value={settings.sound} onChange={() => void updateSettings({ sound: !settings.sound })} /></Surface><SectionTitle title="Uygulama" /><Surface><Text style={[styles.optionLabel, { color: colors.mutedForeground }]}>Tema</Text><View style={styles.themeRow}>{(['dark', 'light', 'auto'] as const).map((theme) => <Pressable key={theme} onPress={() => void updateSettings({ theme })} style={[styles.themeOption, { backgroundColor: settings.theme === theme ? colors.primary : colors.secondary }]}><Text style={{ color: settings.theme === theme ? colors.primaryForeground : colors.secondaryForeground, fontSize: 12, fontWeight: '700' }}>{theme === 'dark' ? 'Koyu' : theme === 'light' ? 'Açık' : 'Otomatik'}</Text></Pressable>)}</View><View style={[styles.versionRow, { borderTopColor: colors.border }]}><Text style={[styles.optionLabel, { color: colors.mutedForeground }]}>Versiyon</Text><Text style={[styles.version, { color: colors.foreground }]}>1.0.0 · Demo modu</Text></View></Surface><Pressable onPress={() => Alert.alert('Life Black Box', 'Sağlık güvenliği için tasarlanmış kişisel acil durum yardımcı uygulaması.')} style={styles.about}><Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} /><Text style={[styles.aboutText, { color: colors.mutedForeground }]}>Life Black Box hakkında</Text></Pressable><View style={{ height: 30 }} /></ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 45 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.7, marginTop: 5 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  deviceIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  deviceCopy: { flex: 1, marginLeft: 11 },
  deviceName: { fontSize: 15, fontWeight: '800' },
  deviceStatus: { fontSize: 11, marginTop: 4 },
  connectionDot: { width: 9, height: 9, borderRadius: 5 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2A3438' },
  stepperCopy: { flex: 1 },
  stepperLabel: { fontSize: 13, fontWeight: '600' },
  stepperValue: { fontSize: 12, fontWeight: '800', marginTop: 3 },
  stepperControls: { flexDirection: 'row', gap: 8 },
  stepperButton: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleCopy: { flex: 1, paddingRight: 15 },
  toggleTitle: { fontSize: 14, fontWeight: '700' },
  toggleCaption: { fontSize: 11, marginTop: 3 },
  toggle: { width: 46, height: 27, borderRadius: 16, justifyContent: 'center' },
  toggleKnob: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#FFFFFF' },
  optionLabel: { fontSize: 12, fontWeight: '700' },
  themeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  themeOption: { flex: 1, minHeight: 39, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, marginTop: 17, paddingTop: 15 },
  version: { fontSize: 12, fontWeight: '700' },
  about: { alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 18 },
  aboutText: { fontSize: 12, fontWeight: '600' },
});