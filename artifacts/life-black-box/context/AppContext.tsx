import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Appearance } from 'react-native';
import type { AppSettings, ConnectionState, EmergencyContact, EmergencyEvent, SensorSnapshot, SystemState, UserProfile } from '@/types';
import { connectToWearable, packetToSnapshot, cancelDeviceAlert } from '@/services/bleService';
import { getRiskReasons } from '@/services/alertService';
import { defaultSettings, loadContacts, loadEvents, loadSettings, loadUser, saveContacts, saveEvents, saveSettings, saveUser } from '@/services/storageService';

type EmergencyTrigger = { reason: string; snapshot: SensorSnapshot };

type AppContextValue = {
  hydrated: boolean;
  snapshot: SensorSnapshot;
  heartRateHistory: number[];
  connection: ConnectionState;
  events: EmergencyEvent[];
  contacts: EmergencyContact[];
  settings: AppSettings;
  user: UserProfile;
  emergency: EmergencyTrigger | null;
  systemState: SystemState;
  setEmergency: (trigger: EmergencyTrigger | null) => void;
  addContact: (contact: EmergencyContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  updateUser: (patch: Partial<UserProfile>) => Promise<void>;
  addEvent: (event: EmergencyEvent) => Promise<void>;
  clearEvents: () => Promise<void>;
  triggerEmergency: (reason?: string) => void;
  dismissEmergency: () => Promise<void>;
  reconnect: () => void;
};

const initialSnapshot: SensorSnapshot = {
  hr: null, spo2: null, acc: null, temp: null, hum: null, co: null, fall: false, state: 0, timestamp: new Date().toISOString(),
};

const AppContext = createContext<AppContextValue | null>(null);

function applyColorScheme(theme: AppSettings['theme']) {
  (Appearance.setColorScheme as unknown as (scheme: 'light' | 'dark' | null) => void)(theme === 'auto' ? null : theme);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<SensorSnapshot>(initialSnapshot);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [user, setUser] = useState<UserProfile>({ name: '', deviceName: 'LifeBlackBox', deviceId: '' });
  const [emergency, setEmergency] = useState<EmergencyTrigger | null>(null);
  const [stopStream, setStopStream] = useState<(() => void) | null>(null);

  const handlePacket = useCallback((packet: Parameters<typeof packetToSnapshot>[0]) => {
    const next = packetToSnapshot(packet);
    setSnapshot(next);
    if (next.hr !== null) setHeartRateHistory((current) => [...current, next.hr as number].slice(-60));
    if (packet.ALARM === 'ACIL_SOS') {
      setEmergency({ reason: 'Cihazdan acil SOS sinyali alındı', snapshot: next });
    } else if (next.state === 1 && !settings.demoMode) {
      const reasons = getRiskReasons(next, settings);
      setEmergency({ reason: reasons.join(' + ') || 'Cihaz risk algıladı', snapshot: next });
    }
  }, [settings]);

  const connect = useCallback(() => {
    if (stopStream) stopStream();
    void connectToWearable({ onData: handlePacket, onStatus: setConnection }).then(setStopStream);
  }, [handlePacket, stopStream]);

  useEffect(() => {
    let active = true;
    void Promise.all([loadContacts(), loadEvents(), loadSettings(), loadUser()]).then(([loadedContacts, loadedEvents, loadedSettings, loadedUser]) => {
      if (!active) return;
      setContacts(loadedContacts);
      setEvents(loadedEvents);
      setSettings({ ...defaultSettings, ...loadedSettings });
      applyColorScheme(loadedSettings.theme);
      setUser(loadedUser);
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    connect();
    return () => { stopStream?.(); };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || connection !== 'disconnected') return;
    const timer = setInterval(connect, 5000);
    return () => clearInterval(timer);
  }, [connection, connect, hydrated]);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (patch.theme) applyColorScheme(patch.theme);
    await saveSettings(next);
  };

  const updateUser = async (patch: Partial<UserProfile>) => {
    const next = { ...user, ...patch };
    setUser(next);
    await saveUser(next);
  };

  const addContact = async (contact: EmergencyContact) => {
    if (contacts.length >= 5) {
      Alert.alert('Limit doldu', 'En fazla 5 acil kişi ekleyebilirsiniz.');
      return;
    }
    const next = [...contacts, contact];
    setContacts(next);
    await saveContacts(next);
  };

  const deleteContact = async (id: string) => {
    const next = contacts.filter((contact) => contact.id !== id);
    setContacts(next);
    await saveContacts(next);
  };

  const addEvent = async (event: EmergencyEvent) => {
    const next = [event, ...events].slice(0, 200);
    setEvents(next);
    await saveEvents(next);
  };

  const clearEvents = async () => {
    setEvents([]);
    await saveEvents([]);
  };

  const triggerEmergency = (reason = 'Kullanıcı manuel SOS başlattı') => {
    setEmergency({ reason, snapshot });
  };

  const dismissEmergency = async () => {
    await cancelDeviceAlert();
    setEmergency(null);
  };

  const value = useMemo(() => ({
    hydrated, snapshot, heartRateHistory, connection, events, contacts, settings, user, emergency, systemState: emergency ? 1 : snapshot.state,
    setEmergency, addContact, deleteContact, updateSettings, updateUser, addEvent, clearEvents, triggerEmergency, dismissEmergency, reconnect: connect,
  }), [hydrated, snapshot, heartRateHistory, connection, events, contacts, settings, user, emergency, connect]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}