import type { ThresholdSettings } from '@/constants/thresholds';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'permission_denied';
export type SystemState = 0 | 1 | 2;
export type EventType = 'RISK_ALGILANDI' | 'KULLANICI_IPTAL' | 'ALARM_GONDERILDI';

export type SensorSnapshot = {
  hr: number | null;
  spo2: number | null;
  acc: number | null;
  temp: number | null;
  hum: number | null;
  co: number | null;
  fall: boolean;
  state: SystemState;
  timestamp: string;
};

export type BlePacket = Omit<SensorSnapshot, 'timestamp'> & { timestamp?: string; ALARM?: string };

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: 'Eş' | 'Çocuk' | 'Bakıcı' | 'Diğer';
};

export type EmergencyEvent = {
  id: string;
  type: EventType;
  timestamp: string;
  reason: string;
  snapshot: SensorSnapshot;
};

export type AppSettings = ThresholdSettings & {
  localNotifications: boolean;
  vibration: boolean;
  sound: boolean;
  notify112: boolean;
  theme: 'light' | 'dark' | 'auto';
  demoMode: boolean;
};

export type UserProfile = {
  name: string;
  deviceName: string;
  deviceId: string;
};