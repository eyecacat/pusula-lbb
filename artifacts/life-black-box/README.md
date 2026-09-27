# Life Black Box

Life Black Box is a Turkish-language Expo companion app for the Deneyap Kart 1A health emergency wearable.

## Run

```bash
pnpm install
pnpm --filter @workspace/life-black-box run dev
```

Open the Expo preview on a phone with Expo Go. Demo mode is enabled by default, so the dashboard shows a realistic telemetry stream without hardware.

## BLE protocol

- Device name: `LifeBlackBox`
- Nordic UART Service: `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
- Notify characteristic: `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`
- Write characteristic: `6E400002-B5A3-F393-E0A9-E50E24DCCA9E`
- Incoming JSON: `hr`, `spo2`, `acc`, `temp`, `hum`, `co`, `fall`, `state`
- Emergency packet: `{ "ALARM": "ACIL_SOS" }`
- Cancel command: single byte `C`

Native BLE scanning is isolated in `services/bleService.ts`. Hardware builds can turn off `DEMO_MODE` and use the same Nordic UART UUIDs.

## Local persistence

AsyncStorage keys:

- `lbb_contacts`
- `lbb_events` (maximum 200 records)
- `lbb_settings`
- `lbb_user`

All user-facing copy is Turkish. SMS, clipboard fallback, local event history, first-aid speech guidance, and the 112 action are wired into the emergency flow.