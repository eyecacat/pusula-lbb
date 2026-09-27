import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import type { ConnectionState } from '@/types';
import type { RiskTone } from '@/constants/thresholds';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return <View style={[styles.screen, { backgroundColor: colors.background }, style]}>{children}</View>;
}

export function Surface({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const colors = useColors();
  const content = <View style={[styles.surface, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}>{content}</Pressable> : content;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionTitle}><Text style={[styles.sectionText, { color: colors.mutedForeground }]}>{title}</Text>{action && <Pressable onPress={onAction}><Text style={[styles.actionText, { color: colors.primary }]}>{action}</Text></Pressable>}</View>;
}

export function PrimaryButton({ label, icon, onPress, variant = 'primary', disabled = false }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void; variant?: 'primary' | 'danger' | 'ghost'; disabled?: boolean }) {
  const colors = useColors();
  const backgroundColor = variant === 'danger' ? colors.destructive : variant === 'ghost' ? colors.secondary : colors.primary;
  const foreground = variant === 'ghost' ? colors.secondaryForeground : colors.primaryForeground;
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }]}>{icon && <Ionicons name={icon} size={18} color={foreground} /> }<Text style={[styles.buttonText, { color: foreground }]}>{label}</Text></Pressable>;
}

export function MetricPill({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return <View style={[styles.metricPill, { backgroundColor: colors.secondary }]}><Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.metricValue, { color: colors.secondaryForeground }]}>{value}</Text></View>;
}

export function RiskDot({ tone }: { tone: RiskTone }) {
  const colors = useColors();
  const color = tone === 'danger' ? colors.destructive : tone === 'warning' ? '#D29922' : tone === 'critical' ? '#8957E5' : colors.primary;
  return <View style={[styles.riskDot, { backgroundColor: color }]} />;
}

export function ConnectionPill({ state, onPress }: { state: ConnectionState; onPress?: () => void }) {
  const colors = useColors();
  const connected = state === 'connected';
  const label = connected ? 'LifeBlackBox bağlı' : state === 'connecting' ? 'Bağlanıyor' : state === 'permission_denied' ? 'İzin gerekli' : 'Bağlantı yok';
  return <Pressable onPress={onPress} style={[styles.connectionPill, { backgroundColor: connected ? colors.secondary : '#3A2024' }]}><View style={[styles.statusDot, { backgroundColor: connected ? colors.primary : colors.destructive }]} /><Text style={[styles.connectionText, { color: connected ? colors.secondaryForeground : '#FFB4B4' }]}>{label}</Text>{!connected && <Ionicons name="refresh" size={14} color="#FFB4B4" />}</Pressable>;
}

export function PulsingIcon({ icon, color }: { icon: keyof typeof Ionicons.glyphMap; color: string }) {
  const pulse = useSharedValue(1);
  useEffect(() => { pulse.value = withRepeat(withTiming(1.14, { duration: 900 }), -1, true); }, [pulse]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return <Animated.View style={style}><Ionicons name={icon} size={34} color={color} /></Animated.View>;
}

export function LoadingState() {
  const colors = useColors();
  return <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={[styles.mutedText, { color: colors.mutedForeground }]}>Sistem hazırlanıyor…</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 18 },
  surface: { borderRadius: 18, borderWidth: 1, padding: 16 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 },
  sectionText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  actionText: { fontSize: 13, fontWeight: '700' },
  button: { minHeight: 48, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  metricPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  metricLabel: { fontSize: 10 },
  metricValue: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  connectionPill: { alignSelf: 'flex-start', minHeight: 32, flexDirection: 'row', gap: 7, alignItems: 'center', borderRadius: 20, paddingHorizontal: 11 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  connectionText: { fontSize: 12, fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mutedText: { fontSize: 14 },
});