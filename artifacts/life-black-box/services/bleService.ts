import { Platform, PermissionsAndroid } from 'react-native';
import type { BlePacket, ConnectionState, SensorSnapshot } from '@/types';

export const NUS_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
export const NUS_NOTIFY_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
export const NUS_WRITE_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
export const DEVICE_NAME = 'LifeBlackBox';
export const DEMO_MODE = true;

type StreamHandlers = {
  onData: (packet: BlePacket) => void;
  onStatus: (status: ConnectionState) => void;
};

let device: { writeCharacteristicWithResponseForService?: (service: string, characteristic: string, value: string) => Promise<unknown> } | null = null;

function demoPacket(tick: number): BlePacket {
  const phase = tick / 7;
  const hr = Math.round(72 + Math.sin(phase) * 4 + Math.sin(phase / 2) * 2);
  return {
    hr,
    spo2: Math.round(98 - Math.max(0, Math.sin(phase / 2)) * 1),
    acc: Number((1.01 + Math.abs(Math.sin(phase * 1.4)) * 0.08).toFixed(2)),
    temp: Number((36.5 + Math.sin(phase / 3) * 0.2).toFixed(1)),
    hum: Math.round(45 + Math.sin(phase / 4) * 3),
    co: Math.round(118 + Math.abs(Math.sin(phase / 2)) * 20),
    fall: false,
    state: 0,
  };
}

export function startDemoStream({ onData, onStatus }: StreamHandlers) {
  onStatus('connected');
  let tick = 0;
  onData(demoPacket(tick));
  const timer = setInterval(() => onData(demoPacket(++tick)), 1000);
  return () => {
    clearInterval(timer);
    onStatus('disconnected');
  };
}

export async function requestBlePermissions() {
  if (Platform.OS !== 'android' || Platform.Version < 31) return true;
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  ]);
  return Object.values(result).every((value) => value === PermissionsAndroid.RESULTS.GRANTED);
}

export async function connectToWearable({ onData, onStatus }: StreamHandlers) {
  if (DEMO_MODE) return startDemoStream({ onData, onStatus });
  const permitted = await requestBlePermissions();
  if (!permitted) {
    onStatus('permission_denied');
    return () => undefined;
  }
  try {
    // Kept lazy so Expo Go and web previews can use demo mode without loading
    // the native BLE module. Hardware builds can disable DEMO_MODE and use NUS.
    const { BleManager } = require('react-native-ble-plx') as typeof import('react-native-ble-plx');
    const manager = new BleManager();
    onStatus('connecting');
    manager.startDeviceScan(null, null, async (_error, scannedDevice) => {
      if (!scannedDevice || scannedDevice.name !== DEVICE_NAME) return;
      manager.stopDeviceScan();
      try {
        const connected = await scannedDevice.connect();
        await connected.discoverAllServicesAndCharacteristics();
        device = connected as typeof device;
        onStatus('connected');
        connected.monitorCharacteristicForService(NUS_SERVICE_UUID, NUS_NOTIFY_UUID, (error, characteristic) => {
          if (error || !characteristic?.value) return;
          try {
            const decoded = atob(characteristic.value);
            onData(JSON.parse(decoded) as BlePacket);
          } catch {
            // Ignore a partial BLE packet and wait for the next notification.
          }
        });
      } catch {
        onStatus('disconnected');
      }
    });
    return () => {
      manager.stopDeviceScan();
      void manager.destroy();
      device = null;
      onStatus('disconnected');
    };
  } catch {
    onStatus('disconnected');
    return () => undefined;
  }
}

export async function cancelDeviceAlert() {
  if (!device?.writeCharacteristicWithResponseForService) return;
  try {
    const encoded = btoa('C');
    await device.writeCharacteristicWithResponseForService(NUS_SERVICE_UUID, NUS_WRITE_UUID, encoded);
  } catch {
    // Device may already be disconnected; the local alert still gets recorded.
  }
}

export function packetToSnapshot(packet: BlePacket): SensorSnapshot {
  return {
    hr: Number.isFinite(packet.hr) ? packet.hr : null,
    spo2: Number.isFinite(packet.spo2) ? packet.spo2 : null,
    acc: Number.isFinite(packet.acc) ? packet.acc : null,
    temp: Number.isFinite(packet.temp) ? packet.temp : null,
    hum: Number.isFinite(packet.hum) ? packet.hum : null,
    co: Number.isFinite(packet.co) ? packet.co : null,
    fall: Boolean(packet.fall),
    state: packet.state === 1 || packet.state === 2 ? packet.state : 0,
    timestamp: new Date().toISOString(),
  };
}