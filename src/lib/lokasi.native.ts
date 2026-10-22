// Versi Android/iOS: memakai expo-location (izin "saat aplikasi dipakai").
import * as Location from 'expo-location';
export { jarakMeter } from './jarak';
export type Posisi = { lat: number; lng: number; akurasi: number };

export async function ambilPosisi(): Promise<Posisi> {
  const izin = await Location.requestForegroundPermissionsAsync();
  if (izin.status !== 'granted') throw new Error('Izin lokasi ditolak.');
  const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: p.coords.latitude, lng: p.coords.longitude, akurasi: p.coords.accuracy ?? 0 };
}
