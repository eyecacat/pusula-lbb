import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function EmergencyCountdown({ seconds, total }: { seconds: number; total: number }) {
  const colors = useColors();
  const progress = useSharedValue(1);
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  useEffect(() => { progress.value = withTiming(seconds / total, { duration: 850 }); }, [progress, seconds, total]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progress.value) }));
  return <View style={styles.container}><Svg width={204} height={204} viewBox="0 0 204 204"><Circle cx="102" cy="102" r={radius} stroke="#5B2026" strokeWidth="12" fill="none" /><AnimatedCircle cx="102" cy="102" r={radius} stroke={colors.destructive} strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} animatedProps={animatedProps} transform="rotate(-90 102 102)" /></Svg><View style={styles.center}><Text style={styles.number}>{seconds}</Text><Text style={styles.label}>saniye</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { width: 204, height: 204, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  number: { color: '#FFFFFF', fontSize: 58, fontWeight: '800', letterSpacing: -2 },
  label: { color: '#FFB4B4', fontSize: 13, fontWeight: '600', marginTop: -5 },
});