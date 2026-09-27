import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as SMS from 'expo-sms';
import type { AppSettings, EmergencyContact, SensorSnapshot } from '@/types';
import { getAccelerationTone, getCoTone, getHeartRateTone, getSpo2Tone } from '@/constants/thresholds';

export function getRiskReasons(snapshot: SensorSnapshot, settings: AppSettings) {
  const reasons: string[] = [];
  if (snapshot.fall || getAccelerationTone(snapshot.acc) === 'critical') reasons.push('Düşme algılandı');
  if (getHeartRateTone(snapshot.hr, settings) === 'danger') reasons.push('Kalp atışı eşik dışında');
  if (getSpo2Tone(snapshot.spo2, settings) === 'danger') reasons.push('Düşük SpO2 tespit edildi');
  if (getCoTone(snapshot.co, settings) === 'danger') reasons.push('Karbonmonoksit seviyesi yüksek');
  return reasons;
}

export function formatEmergencyMessage(userName: string, timestamp: string) {
  const name = userName.trim() || 'Kullanıcı';
  return `ACİL: ${name} sağlık durumu kritik. Zaman: ${new Date(timestamp).toLocaleString('tr-TR')}. Life Black Box sistemi otomatik alarm verdi. Lütfen hemen arayın.`;
}

export async function sendEmergencySms(contacts: EmergencyContact[], message: string) {
  const numbers = contacts.map((contact) => contact.phone).filter(Boolean);
  if (numbers.length === 0) return { sent: false, fallback: false, reason: 'Acil kişi eklenmedi.' };
  if (Platform.OS === 'web') {
    await Clipboard.setStringAsync(message);
    return { sent: false, fallback: true, reason: 'Web önizlemesinde mesaj panoya kopyalandı.' };
  }
  try {
    const available = await SMS.isAvailableAsync();
    if (!available) {
      await Clipboard.setStringAsync(message);
      return { sent: false, fallback: true, reason: 'SMS kullanılamıyor; mesaj panoya kopyalandı.' };
    }
    await SMS.sendSMSAsync(numbers, message);
    return { sent: true, fallback: false, reason: 'Mesaj gönderildi.' };
  } catch {
    await Clipboard.setStringAsync(message);
    return { sent: false, fallback: true, reason: 'SMS açılamadı; mesaj panoya kopyalandı.' };
  }
}