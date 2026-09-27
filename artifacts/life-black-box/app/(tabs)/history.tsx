import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { MetricPill, Screen, SectionTitle, Surface } from '@/components/AppPrimitives';
import type { EmergencyEvent } from '@/types';

function eventMeta(type: EmergencyEvent['type']) {
  if (type === 'ALARM_GONDERILDI') return { label: 'Alarm gönderildi', icon: 'warning' as const, color: '#D94343' };
  if (type === 'KULLANICI_IPTAL') return { label: 'Kullanıcı iptal etti', icon: 'checkmark-circle' as const, color: '#D29922' };
  return { label: 'Risk algılandı', icon: 'alert-circle' as const, color: '#D29922' };
}

export default function HistoryScreen() {
  const colors = useColors();
  const { events, clearEvents } = useApp();
  const [selected, setSelected] = useState<EmergencyEvent | null>(null);
  const confirmClear = () => Alert.alert('Geçmişi temizle', 'Tüm olay kayıtları silinecek.', [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Temizle', style: 'destructive', onPress: clearEvents }]);
  const exportEvents = async () => {
    const text = events.map((event) => `${eventMeta(event.type).label} — ${new Date(event.timestamp).toLocaleString('tr-TR')}\n${event.reason}\nHR ${event.snapshot.hr ?? '--'} · SpO2 ${event.snapshot.spo2 ?? '--'} · İvme ${event.snapshot.acc ?? '--'} g`).join('\n\n');
    await Share.share({ title: 'Life Black Box geçmişi', message: text || 'Henüz kayıt yok.' });
  };
  return <Screen><View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>KAYITLAR</Text><Text style={[styles.title, { color: colors.foreground }]}>Olay geçmişi</Text></View><View style={styles.headerActions}><Pressable accessibilityLabel="Dışa aktar" onPress={exportEvents} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="share-outline" size={18} color={colors.foreground} /></Pressable><Pressable accessibilityLabel="Geçmişi temizle" onPress={confirmClear} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="trash-outline" size={18} color={colors.destructive} /></Pressable></View></View><SectionTitle title={`${events.length} kayıt`} /><FlatList data={events} keyExtractor={(item) => item.id} contentContainerStyle={events.length ? styles.list : styles.emptyList} scrollEnabled={events.length > 0} showsVerticalScrollIndicator={false} renderItem={({ item }) => { const meta = eventMeta(item.type); return <Surface onPress={() => setSelected(item)} style={styles.eventRow}><View style={[styles.eventAccent, { backgroundColor: meta.color }]} /><View style={[styles.eventIcon, { backgroundColor: `${meta.color}18` }]}><Ionicons name={meta.icon} size={19} color={meta.color} /></View><View style={styles.eventBody}><Text style={[styles.eventTitle, { color: colors.foreground }]}>{meta.label}</Text><Text style={[styles.eventReason, { color: colors.mutedForeground }]} numberOfLines={1}>{item.reason}</Text><Text style={[styles.eventTime, { color: colors.mutedForeground }]}>{new Date(item.timestamp).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text><View style={styles.metrics}><MetricPill label="HR" value={item.snapshot.hr === null ? '--' : `${item.snapshot.hr}`} /><MetricPill label="SpO2" value={item.snapshot.spo2 === null ? '--' : `${item.snapshot.spo2}%`} /><MetricPill label="İvme" value={item.snapshot.acc === null ? '--' : `${item.snapshot.acc}g`} /></View></View><Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /></Surface>; }} ListEmptyComponent={<View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Henüz olay yok</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Sistem önemli bir durum algıladığında kayıtlar burada görünecek.</Text></View>} /><Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View style={styles.modalBackdrop}><View style={[styles.detailModal, { backgroundColor: colors.card }]}><View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Olay detayı</Text><Pressable onPress={() => setSelected(null)}><Ionicons name="close" size={22} color={colors.foreground} /></Pressable></View>{selected && <><Text style={[styles.detailLabel, { color: colors.primary }]}>{eventMeta(selected.type).label.toUpperCase()}</Text><Text style={[styles.detailReason, { color: colors.foreground }]}>{selected.reason}</Text><Text style={[styles.detailTime, { color: colors.mutedForeground }]}>{new Date(selected.timestamp).toLocaleString('tr-TR')}</Text><View style={[styles.jsonBox, { backgroundColor: colors.background }]}><Text style={[styles.json, { color: colors.mutedForeground }]}>{JSON.stringify(selected.snapshot, null, 2)}</Text></View></>}</View></View></Modal></Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 18, marginBottom: 3 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.7, marginTop: 5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 105 },
  emptyList: { flexGrow: 1 },
  eventRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 13, overflow: 'hidden' },
  eventAccent: { width: 3, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0 },
  eventIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  eventBody: { flex: 1, marginLeft: 11 },
  eventTitle: { fontSize: 14, fontWeight: '800' },
  eventReason: { fontSize: 12, marginTop: 3 },
  eventTime: { fontSize: 11, marginTop: 7 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35 },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  detailModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, minHeight: 360 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 19, fontWeight: '800' },
  detailLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 25 },
  detailReason: { fontSize: 17, fontWeight: '700', marginTop: 8 },
  detailTime: { fontSize: 12, marginTop: 5 },
  jsonBox: { borderRadius: 14, padding: 13, marginTop: 20 },
  json: { fontFamily: 'monospace', fontSize: 11, lineHeight: 17 },
});