// Versi web: memakai Geolocation API peramban (opsional; ada tombol simulasi).
export type Posisi = { lat: number; lng: number; akurasi: number };

export function ambilPosisi(): Promise<Posisi> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Peramban ini tidak menyediakan lokasi.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, akurasi: p.coords.accuracy }),
      (e) => reject(new Error(e.code === 1 ? 'Izin lokasi ditolak.' : 'Lokasi belum bisa dibaca.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

export { jarakMeter } from './jarak';
