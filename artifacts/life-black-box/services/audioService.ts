import * as Speech from 'expo-speech';
import type { SensorSnapshot } from '@/types';

export async function playFirstAidGuidance(snapshot: SensorSnapshot) {
  const text = snapshot.fall
    ? 'Düşme algılandı. Hareket etmeyin ve yardımın gelmesini bekleyin.'
    : snapshot.co && snapshot.co > 300
      ? 'Karbonmonoksit uyarısı. Hemen temiz havaya çıkın ve yardım çağırın.'
      : 'Sağlık uyarısı. Sakin kalın, oturun ve yardımın gelmesini bekleyin.';
  try {
    Speech.stop();
    Speech.speak(text, { language: 'tr-TR', rate: 0.9 });
    return true;
  } catch {
    return false;
  }
}