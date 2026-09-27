import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THRESHOLDS } from '@/constants/thresholds';
import type { AppSettings, EmergencyContact, EmergencyEvent, UserProfile } from '@/types';

export const STORAGE_KEYS = {
  contacts: 'lbb_contacts',
  events: 'lbb_events',
  settings: 'lbb_settings',
  user: 'lbb_user',
} as const;

export const defaultSettings: AppSettings = {
  ...DEFAULT_THRESHOLDS,
  localNotifications: false,
  vibration: true,
  sound: true,
  notify112: false,
  theme: 'dark',
  demoMode: true,
};

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadContacts() {
  return read<EmergencyContact[]>(STORAGE_KEYS.contacts, []);
}

export async function saveContacts(contacts: EmergencyContact[]) {
  await write(STORAGE_KEYS.contacts, contacts);
}

export async function loadEvents() {
  return read<EmergencyEvent[]>(STORAGE_KEYS.events, []);
}

export async function saveEvents(events: EmergencyEvent[]) {
  await write(STORAGE_KEYS.events, events.slice(0, 200));
}

export async function loadSettings() {
  return read<AppSettings>(STORAGE_KEYS.settings, defaultSettings);
}

export async function saveSettings(settings: AppSettings) {
  await write(STORAGE_KEYS.settings, settings);
}

export async function loadUser() {
  return read<UserProfile>(STORAGE_KEYS.user, { name: '', deviceName: 'LifeBlackBox', deviceId: '' });
}

export async function saveUser(user: UserProfile) {
  await write(STORAGE_KEYS.user, user);
}