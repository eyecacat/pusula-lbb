import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { PrimaryButton, Screen, SectionTitle, Surface } from '@/components/AppPrimitives';
import type { EmergencyContact } from '@/types';

const relationships: EmergencyContact['relationship'][] = ['Eş', 'Çocuk', 'Bakıcı', 'Diğer'];

export default function ContactsScreen() {
  const colors = useColors();
  const { contacts, addContact, deleteContact, user, updateUser, settings, updateSettings } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<EmergencyContact['relationship']>('Eş');
  const inputStyle = [styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }];
  const save = async () => {
    if (!name.trim() || !phone.trim()) { Alert.alert('Eksik bilgi', 'Ad soyad ve telefon alanlarını doldur.'); return; }
    await addContact({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), phone: phone.trim(), relationship });
    setName(''); setPhone(''); setRelationship('Eş'); setModalVisible(false);
  };
  const testSms = async (contact: EmergencyContact) => {
    try {
      if (await SMS.isAvailableAsync()) await SMS.sendSMSAsync([contact.phone], 'Life Black Box test mesajı: Acil bildirimler bu numaraya gönderilecek.');
      else Alert.alert('SMS kullanılamıyor', 'Bu cihazda SMS gönderimi kullanılamıyor.');
    } catch { Alert.alert('SMS gönderilemedi', 'Lütfen daha sonra tekrar dene.'); }
  };
  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>GÜVENLİK AĞI</Text><Text style={[styles.title, { color: colors.foreground }]}>Acil kişiler</Text></View><Pressable onPress={() => setModalVisible(true)} style={[styles.addButton, { backgroundColor: colors.primary }]}><Ionicons name="add" size={22} color={colors.primaryForeground} /></Pressable></View><Text style={[styles.intro, { color: colors.mutedForeground }]}>Alarm anında mesaj gönderilecek kişileri seç. En fazla 5 kişi ekleyebilirsin.</Text><SectionTitle title={`${contacts.length}/5 kayıtlı kişi`} />{contacts.length === 0 ? <Surface style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Ionicons name="people-outline" size={28} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Henüz acil kişi yok</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>SOS gönderebilmek için en az bir kişi eklemelisin.</Text><PrimaryButton label="İlk kişiyi ekle" icon="add" onPress={() => setModalVisible(true)} /></Surface> : contacts.map((contact) => <Surface key={contact.id} style={styles.contactCard}><View style={[styles.avatar, { backgroundColor: colors.secondary }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{contact.name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.contactInfo}><Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text><Text style={[styles.contactPhone, { color: colors.mutedForeground }]}>{contact.phone} · {contact.relationship}</Text><Pressable onPress={() => void testSms(contact)} style={styles.testButton}><Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary} /><Text style={[styles.testText, { color: colors.primary }]}>Test mesajı gönder</Text></Pressable></View><Pressable accessibilityLabel={`${contact.name} kişisini sil`} onPress={() => Alert.alert('Kişiyi sil', `${contact.name} silinsin mi?`, [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => void deleteContact(contact.id) }])}><Ionicons name="trash-outline" size={18} color={colors.mutedForeground} /></Pressable></Surface>)}<SectionTitle title="Kullanıcı bilgileri" /><Surface><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Varsayılan kullanıcı adı</Text><TextInput value={user.name} onChangeText={(value) => void updateUser({ name: value })} placeholder="Örn. Deniz Yılmaz" placeholderTextColor={colors.mutedForeground} style={inputStyle} /><View style={styles.toggleRow}><View style={styles.toggleCopy}><Text style={[styles.toggleTitle, { color: colors.foreground }]}>112'yi de bildir</Text><Text style={[styles.toggleSubtitle, { color: colors.mutedForeground }]}>Alarm sonrası telefon arama ekranını aç</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: settings.notify112 }} onPress={() => void updateSettings({ notify112: !settings.notify112 })} style={[styles.toggle, { backgroundColor: settings.notify112 ? colors.primary : colors.muted }]}><View style={[styles.toggleKnob, { backgroundColor: '#FFFFFF', transform: [{ translateX: settings.notify112 ? 20 : 2 }] }]} /></Pressable></View></Surface><View style={{ height: 30 }} /></ScrollView><Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.backdrop}><View style={[styles.sheet, { backgroundColor: colors.card }]}><View style={styles.sheetHeader}><View><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Acil kişi ekle</Text><Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>Alarm anında bilgilendirilecek</Text></View><Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.foreground} /></Pressable></View><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Ad soyad</Text><TextInput value={name} onChangeText={setName} style={inputStyle} placeholder="Örn. Ayşe Yılmaz" placeholderTextColor={colors.mutedForeground} /><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Telefon</Text><TextInput value={phone} onChangeText={setPhone} style={inputStyle} keyboardType="phone-pad" placeholder="+90 5XX XXX XX XX" placeholderTextColor={colors.mutedForeground} /><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Yakınlık</Text><View style={styles.relationships}>{relationships.map((item) => <Pressable key={item} onPress={() => setRelationship(item)} style={[styles.relationship, { backgroundColor: relationship === item ? colors.primary : colors.secondary }]}><Text style={{ color: relationship === item ? colors.primaryForeground : colors.secondaryForeground, fontWeight: '700', fontSize: 12 }}>{item}</Text></Pressable>)}</View><PrimaryButton label="Kişiyi kaydet" icon="checkmark" onPress={() => void save()} /></View></View></Modal></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 45 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.7, marginTop: 5 },
  addButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  intro: { fontSize: 13, lineHeight: 19, marginTop: 12 },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 7, marginBottom: 19 },
  contactCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 19, fontWeight: '800' },
  contactInfo: { flex: 1, marginLeft: 12 },
  contactName: { fontSize: 15, fontWeight: '800' },
  contactPhone: { fontSize: 12, marginTop: 4 },
  testButton: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  testText: { fontSize: 12, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  input: { minHeight: 46, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, fontSize: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 },
  toggleCopy: { flex: 1, paddingRight: 15 },
  toggleTitle: { fontSize: 14, fontWeight: '700' },
  toggleSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  toggle: { width: 46, height: 27, borderRadius: 16, justifyContent: 'center' },
  toggleKnob: { width: 23, height: 23, borderRadius: 12 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 34 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { fontSize: 12, marginTop: 4 },
  relationships: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  relationship: { borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9 },
});