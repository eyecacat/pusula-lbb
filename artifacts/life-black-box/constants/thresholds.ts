export const DEFAULT_THRESHOLDS = {
  hrLow: 45,
  hrHigh: 130,
  spo2Low: 90,
  coAlarm: 300,
  confirmationSeconds: 10,
} as const;

export type ThresholdSettings = {
  hrLow: number;
  hrHigh: number;
  spo2Low: number;
  coAlarm: number;
  confirmationSeconds: number;
};

export type RiskTone = 'normal' | 'warning' | 'danger' | 'critical';

export function getHeartRateTone(value: number | null, thresholds: ThresholdSettings): RiskTone {
  if (value === null || !Number.isFinite(value)) return 'normal';
  if (value < thresholds.hrLow || value > thresholds.hrHigh) return 'danger';
  if (value < thresholds.hrLow + 10 || value > thresholds.hrHigh - 20) return 'warning';
  return 'normal';
}

export function getSpo2Tone(value: number | null, thresholds: ThresholdSettings): RiskTone {
  if (value === null || !Number.isFinite(value)) return 'normal';
  if (value < thresholds.spo2Low) return 'danger';
  if (value < thresholds.spo2Low + 4) return 'warning';
  return 'normal';
}

export function getCoTone(value: number | null, thresholds: ThresholdSettings): RiskTone {
  if (value === null || !Number.isFinite(value)) return 'normal';
  if (value > thresholds.coAlarm) return 'danger';
  if (value > thresholds.coAlarm - 100) return 'warning';
  return 'normal';
}

export function getAccelerationTone(value: number | null): RiskTone {
  if (value === null || !Number.isFinite(value)) return 'normal';
  return value > 2.5 ? 'critical' : 'normal';
}