import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

export function HeartRateChart({ readings }: { readings: number[] }) {
  const colors = useColors();
  const values = readings.length ? readings : [68, 72, 70, 74, 71, 73, 72];
  const min = 40;
  const max = 140;
  const width = 320;
  const height = 118;
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((Math.min(max, Math.max(min, value)) - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');
  const thresholdY = (value: number) => height - ((value - min) / (max - min)) * height;
  return <View style={[styles.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.chartHeader}><View><Text style={[styles.title, { color: colors.foreground }]}>Kalp atışı trendi</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>Son 60 ölçüm · bpm</Text></View><View style={[styles.livePill, { backgroundColor: colors.secondary }]}><View style={[styles.liveDot, { backgroundColor: colors.primary }]} /><Text style={[styles.liveText, { color: colors.secondaryForeground }]}>CANLI</Text></View></View><Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}><Line x1="0" x2={width} y1={thresholdY(130)} y2={thresholdY(130)} stroke={colors.destructive} strokeDasharray="5 5" opacity={0.75} /><Line x1="0" x2={width} y1={thresholdY(45)} y2={thresholdY(45)} stroke={colors.destructive} strokeDasharray="5 5" opacity={0.75} /><Polyline points={points} fill="none" stroke={colors.primary} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></Svg><View style={styles.axis}><Text style={[styles.axisText, { color: colors.mutedForeground }]}>130</Text><Text style={[styles.axisText, { color: colors.mutedForeground }]}>45</Text></View></View>;
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 8 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '800' },
  caption: { fontSize: 12, marginTop: 3 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  axis: { position: 'absolute', right: 16, top: 57, bottom: 16, justifyContent: 'space-between' },
  axisText: { fontSize: 9 },
});