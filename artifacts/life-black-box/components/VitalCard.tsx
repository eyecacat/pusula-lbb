import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { getAccelerationTone, getCoTone, getHeartRateTone, getSpo2Tone, type RiskTone } from '@/constants/thresholds';
import type { AppSettings, SensorSnapshot } from '@/types';
import { RiskDot } from '@/components/AppPrimitives';

type VitalKey = 'hr' | 'spo2' | 'acc' | 'temp' | 'hum' | 'co';

const meta: Record<VitalKey, { label: string; icon: keyof typeof Ionicons.glyphMap; unit: string }> = {
  hr: { label: 'Kalp atışı', icon: 'heart', unit: 'bpm' },
  spo2: { label: 'SpO2', icon: 'water', unit: '%' },
  acc: { label: 'İvme', icon: 'flash', unit: 'g' },
  temp: { label: 'Sıcaklık', icon: 'thermometer', unit: '°C' },
  hum: { label: 'Nem', icon: 'rainy', unit: '%' },
  co: { label: 'CO gazı', icon: 'cloud', unit: '' },
};

function toneFor(key: VitalKey, value: number | null, settings: AppSettings): RiskTone {
  if (key === 'hr') return getHeartRateTone(value, settings);
  if (key === 'spo2') return getSpo2Tone(value, settings);
  if (key === 'co') return getCoTone(value, settings);
  if (key === 'acc') return getAccelerationTone(value);
  return 'normal';
}

export function VitalCard({ value, vital, settings }: { value: number | null; vital: VitalKey; settings: AppSettings }) {
  const colors = useColors();
  const info = meta[vital];
  const tone = toneFor(vital, value, settings);
  const toneColor = tone === 'danger' ? colors.destructive : tone === 'warning' ? '#D29922' : tone === 'critical' ? '#8957E5' : colors.primary;
  const display = value === null || !Number.isFinite(value) ? '--' : vital === 'co' ? (value > settings.coAlarm ? 'Yüksek' : value < settings.coAlarm - 100 ? 'Düşük' : 'İzle') : `${value}`;
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: tone === 'normal' ? colors.border : toneColor }]}><View style={styles.top}><View style={[styles.iconWrap, { backgroundColor: `${toneColor}18` }]}><Ionicons name={info.icon} size={18} color={toneColor} /></View><RiskDot tone={tone} /></View><Text style={[styles.label, { color: colors.mutedForeground }]}>{info.label}</Text><View style={styles.valueRow}><Text style={[styles.value, { color: toneColor }]}>{display}</Text>{vital !== 'co' && <Text style={[styles.unit, { color: colors.mutedForeground }]}>{info.unit}</Text>}</View></View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 118, borderRadius: 18, borderWidth: 1, padding: 13, margin: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, marginBottom: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  value: { fontSize: 25, fontWeight: '800', letterSpacing: -0.8 },
  unit: { fontSize: 12, fontWeight: '600' },
});