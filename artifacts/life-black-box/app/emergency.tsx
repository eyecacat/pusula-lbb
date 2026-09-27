import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { EmergencyCountdown } from '@/components/EmergencyCountdown';
import { PrimaryButton, Surface } from '@/components/AppPrimitives';
import { formatEmergencyMessage, sendEmergencySms } from '@/services/alertService';
import { playFirstAidGuidance } from '@/services/audioService';
import type { EmergencyEvent } from '@/types';

export default function EmergencyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { emergency, settings, contacts, user, addEvent, dismissEmergency } = useApp();
  const [seconds, setSeconds] = useState(settings.confirmationSeconds);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  useEffect(() => {
    if (!emergency || sent) return;
    if (seconds <= 0) { void sendHelp(); return; }
    const timer = setInterval(() => { setSeconds((current) => current - 1); if (settings.vibration && seconds % 2 === 0) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }, 1000);
    return () => clearInterval(timer);
  }, [seconds, emergency, sent, settings.vibration]);
  useEffect(() => { if (!emergency) router.back(); }, [emergency, router]);
  if (!emergency) return null;
  async function sendHelp() {
    if (sent || sending || !emergency) return;
    const currentEmergency = emergency;
    if (!contacts.length) {
      Alert.alert('Acil kişi eklenmedi', 'Alarm göndermek için önce en az bir acil kişi eklemelisin.', [{ text: 'Kişilere git', onPress: () => { router.replace('/contacts'); } }, { text: 'Kapat', style: 'cancel', onPress: () => void dismissEmergency() }]);
      return;
    }
    setSending(true);
    const message = formatEmergencyMessage(user.name, currentEmergency.snapshot.timestamp);
    const result = await sendEmergencySms(contacts, message);
    if (settings.localNotifications) {
      await Notifications.scheduleNotificationAsync({ content: { title: 'ACİL DURUM', body: currentEmergency.reason }, trigger: null });
    }
    const event: EmergencyEvent = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: 'ALARM_GONDERILDI', timestamp: new Date().toISOString(), reason: currentEmergency.reason, snapshot: currentEmergency.snapshot };
    await addEvent(event);
    if (settings.sound) await playFirstAidGuidance(currentEmergency.snapshot);
    setResultMessage(result.reason);
    setSent(true);
    setSending(false);
    if (settings.notify112) await Linking.openURL('tel:112').catch(() => undefined);
  }
  const cancel = async () => {
    await addEvent({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: 'KULLANICI_IPTAL', timestamp: new Date().toISOString(), reason: emergency.reason, snapshot: emergency.snapshot });
    await dismissEmergency();
    router.back();
  };
  return <View style={styles.container}><View style={styles.glow} /><View style={styles.header}><View style={styles.alertMark}><Ionicons name="warning" size={30} color="#FFFFFF" /></View><Text style={styles.headerLabel}>LIFE BLACK BOX</Text></View>{sent ? <View style={styles.sentContent}><View style={styles.sentIcon}><Ionicons name="checkmark" size={39} color="#FFFFFF" /></View><Text style={styles.title}>Mesaj gönderildi</Text><Text style={styles.subtitle}>{resultMessage}</Text><Surface style={styles.summary}><Text style={styles.summaryLabel}>OLAY ÖZETİ</Text><Text style={styles.summaryText}>{emergency.reason}</Text><View style={styles.summaryMetrics}><Text style={styles.metric}>HR  {emergency.snapshot.hr ?? '--'}</Text><Text style={styles.metric}>SpO2  {emergency.snapshot.spo2 ?? '--'}%</Text><Text style={styles.metric}>İvme  {emergency.snapshot.acc ?? '--'}g</Text></View></Surface><PrimaryButton label="Ambulans çağır · 112" icon="call" onPress={() => void Linking.openURL('tel:112')} variant="danger" /><Pressable onPress={() => { void dismissEmergency(); router.back(); }} style={styles.done}><Text style={styles.doneText}>Kapat</Text></Pressable></View> : <View style={styles.activeContent}><Text style={styles.title}>ACİL DURUM ALGILANDI</Text><Text style={styles.subtitle}>{emergency.reason}</Text><EmergencyCountdown seconds={seconds} total={settings.confirmationSeconds} /><Text style={styles.question}>İyi misin?</Text><Text style={styles.explanation}>Yanlış alarm ise süre dolmadan iptal edebilirsin.</Text><View style={styles.actions}><Pressable onPress={() => void cancel()} style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.75 : 1 }]}><Ionicons name="checkmark-circle-outline" size={21} color="#FFFFFF" /><Text style={styles.cancelText}>Ben iyiyim</Text></Pressable><Pressable disabled={sending} onPress={() => void sendHelp()} style={({ pressed }) => [styles.helpButton, { opacity: sending ? 0.6 : pressed ? 0.8 : 1 }]}><Ionicons name="call" size={20} color="#FFFFFF" /><Text style={styles.helpText}>{sending ? 'Gönderiliyor…' : 'Yardım çağır'}</Text></Pressable></View></View>}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#250E13', paddingHorizontal: 22, paddingTop: 58 },
  glow: { position: 'absolute', width: 330, height: 330, borderRadius: 180, backgroundColor: '#681F2A', opacity: 0.48, top: -130, alignSelf: 'center' },
  header: { alignItems: 'center', gap: 10 },
  alertMark: { width: 62, height: 62, borderRadius: 24, backgroundColor: '#D94343', alignItems: 'center', justifyContent: 'center', shadowColor: '#D94343', shadowOpacity: 0.45, shadowRadius: 24, elevation: 6 },
  headerLabel: { color: '#FFB4B4', fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },
  activeContent: { flex: 1, alignItems: 'center', paddingTop: 35 },
  sentContent: { flex: 1, alignItems: 'center', paddingTop: 42 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: '#FFB4B4', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 10, maxWidth: 315 },
  question: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 19 },
  explanation: { color: '#D9989B', fontSize: 12, marginTop: 6 },
  actions: { width: '100%', gap: 11, marginTop: 24 },
  cancelButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#56343A', flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  helpButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#D94343', flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  helpText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  sentIcon: { width: 75, height: 75, borderRadius: 28, backgroundColor: '#13795B', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  summary: { width: '100%', marginVertical: 22, backgroundColor: '#32181D', borderColor: '#633039' },
  summaryLabel: { color: '#D9989B', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  summaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 8, lineHeight: 21 },
  summaryMetrics: { flexDirection: 'row', gap: 13, marginTop: 17 },
  metric: { color: '#FFB4B4', fontSize: 11, fontWeight: '700' },
  done: { paddingVertical: 18 },
  doneText: { color: '#FFB4B4', fontWeight: '700' },
});