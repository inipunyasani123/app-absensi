import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CABANG, ORANG, SAYA_ID } from '@/lib/data';
import { ambilPosisi, jarakMeter } from '@/lib/lokasi';
import { useGilir } from '@/lib/store';
import { W } from '@/theme';
import { Radar } from './Radar';
import { Teks, Tombol } from './ui';

export function formatJarak(m: number) {
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return `${km < 100 ? km.toFixed(1).replace('.', ',') : Math.round(km).toLocaleString('id-ID')} km`;
}

/** Status lokasi hari ini terhadap radius gerai. */
export function useLokasiHariIni() {
  const { simpanan, kunciHariIni } = useGilir();
  const cabang = CABANG[ORANG[SAYA_ID].cabang];
  const l = simpanan.lokasi && simpanan.lokasi.kunci === kunciHariIni ? simpanan.lokasi : null;
  return { cabang, lokasi: l, dalam: !!l && l.jarak <= cabang.radius };
}

export function LokasiPanel({ ringkas }: { ringkas?: boolean }) {
  const { setLokasi, kunciHariIni } = useGilir();
  const { cabang, lokasi, dalam } = useLokasiHariIni();
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function cek() {
    setSibuk(true);
    setGalat(null);
    try {
      const p = await ambilPosisi();
      const jarak = jarakMeter(p, cabang);
      setLokasi({ kunci: kunciHariIni, jarak, sumber: 'perangkat', akurasi: p.akurasi });
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Lokasi belum bisa dibaca.');
    } finally {
      setSibuk(false);
    }
  }

  function simulasi() {
    setGalat(null);
    setLokasi({ kunci: kunciHariIni, jarak: 18 + Math.round(Math.random() * 30), sumber: 'simulasi' });
  }

  const judul = lokasi
    ? dalam
      ? `Di dalam radius ${cabang.nama}`
      : `Di luar radius ${cabang.nama}`
    : `Belum cek lokasi`;
  const rinci = lokasi
    ? `${formatJarak(lokasi.jarak)} dari titik gerai · batas ${cabang.radius} m${lokasi.sumber === 'simulasi' ? ' · simulasi' : ''}`
    : `Absen hanya bisa dalam radius ${cabang.radius} m dari ${cabang.nama}.`;

  return (
    <View style={st.wadah}>
      <View style={st.atas}>
        <Radar jarak={lokasi?.jarak ?? null} radius={cabang.radius} ukuran={ringkas ? 96 : 116} />
        <View style={{ flex: 1, gap: 4 }} aria-live="polite">
          <Teks v="label" warna={dalam ? W.hijau : W.tinta2}>Lokasi</Teks>
          <Teks v="subjudul">{judul}</Teks>
          <Teks v="kecil" warna={W.tinta2}>{rinci}</Teks>
        </View>
      </View>
      {galat ? (
        <Teks v="kecil" warna={W.stempelTua} style={{ marginTop: 6 }}>
          {galat} Kamu tetap bisa mencoba dengan tombol simulasi.
        </Teks>
      ) : null}
      {!dalam && (
        <View style={st.tombol}>
          <Tombol label="Simulasikan di gerai" ikon="target" varian="utama" onPress={simulasi} />
          <Tombol label={sibuk ? 'Membaca lokasi…' : 'Cek lokasi asli (opsional)'} ikon="pin" varian="garis" onPress={cek} disabled={sibuk} />
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  wadah: { gap: 8 },
  atas: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tombol: { gap: 8, marginTop: 4 },
});
