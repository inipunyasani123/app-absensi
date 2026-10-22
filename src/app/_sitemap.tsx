import { TidakDitemukan } from '@/components/TidakDitemukan';
import { meta } from '@/lib/meta';

// Menggantikan peta rute bawaan Expo Router agar tidak tampil di produksi.
export function generateMetadata() {
  return meta('/404', 'Halaman Tidak Ditemukan · Gilir', 'Alamat ini tidak ada di demo aplikasi absensi Gilir. Kembali ke halaman absen atau jadwal shift.', true);
}

export default function Sitemap() {
  return <TidakDitemukan />;
}
