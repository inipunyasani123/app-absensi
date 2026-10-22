import { TidakDitemukan } from '@/components/TidakDitemukan';
import { meta } from '@/lib/meta';

export function generateMetadata() {
  return meta('/404', 'Halaman Tidak Ditemukan · Gilir', 'Alamat ini tidak ada di demo aplikasi absensi Gilir. Kembali ke halaman absen atau jadwal shift.', true);
}

export default function NotFound() {
  return <TidakDitemukan />;
}
