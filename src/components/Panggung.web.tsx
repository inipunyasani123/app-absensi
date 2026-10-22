import { ReactNode } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Link } from '@/lib/nav';
import { APLIKASI, PERUSAHAAN } from '@/lib/data';
import { H, W } from '@/theme';
import { Logo } from './Logo';

const FITUR = [
  ['Absen tanpa swafoto', 'Masuk & pulang dicek radius gerai, bukti berupa catatan tugas.'],
  ['Shift bergilir', 'Jadwal pekanan per cabang, lengkap dengan rekan satu shift.'],
  ['Cuti, izin, lembur', 'Ajukan dari HP, kepala gerai menyetujui di mode atasan.'],
  ['Rekap & slip gaji', 'Telat, alpa, lembur, dan rincian gaji yang mudah dibaca.'],
];

/**
 * Web: di layar ≥768px aplikasi tampil di bingkai ponsel + panel keterangan (diatur lewat CSS di +html.tsx).
 * Di HP, bingkai lebur menjadi layar penuh dan panel disembunyikan.
 */
export function Panggung({ children }: { children: ReactNode }) {
  return (
    <View nativeID="panggung" style={st.panggung}>
      <View nativeID="layar" style={st.layar}>
        {children}
      </View>
      <View nativeID="panel" style={st.panel} {...({ role: 'complementary', 'aria-label': 'Tentang demo Gilir' } as object)}>
        <View style={st.merek}>
          <Logo ukuran={52} />
          <View>
            <Text style={st.nama}>{APLIKASI.nama}</Text>
            <Text style={st.jenis}>Demo aplikasi Android · iOS · web</Text>
          </View>
        </View>
        <Text style={st.tagline} {...({ role: 'heading', 'aria-level': 2 } as object)}>{APLIKASI.tagline}</Text>
        <Text style={st.konteks}>
          Aplikasi karyawan untuk {PERUSAHAAN.nama}, {PERUSAHAAN.bidang.toLowerCase()} dengan tiga gerai dan satu dapur pusat di {PERUSAHAAN.kota}.
        </Text>
        <View style={st.fitur} {...({ role: 'list' } as object)}>
          {FITUR.map(([j, d], i) => (
            <View key={j} style={st.fiturItem} {...({ role: 'listitem' } as object)}>
              <Text style={st.fiturNo}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={st.fiturJudul}>{j}</Text>
                <Text style={st.fiturIsi}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={st.qrBaris}>
          <Image source={{ uri: '/qr.svg' }} style={st.qr} accessibilityLabel="Kode QR untuk membuka app-absensi.pintuweb.id di HP" />
          <Text style={st.qrTeks}>Pindai untuk mencoba di HP. Dari peramban HP, pilih “Tambahkan ke layar utama” agar terpasang seperti aplikasi.</Text>
        </View>
        <Link href={APLIKASI.kontak} style={st.cta}>Pesan aplikasi seperti ini</Link>
        <Text style={st.kecil}>Nama usaha, karyawan, dan angka di demo ini rekaan. Data yang kamu isi hanya tersimpan di peramban ini.</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  panggung: { flex: 1 },
  layar: { flex: 1, backgroundColor: W.manila, position: 'relative' },
  panel: { width: 340, gap: 18, display: Platform.OS === 'web' ? 'none' : 'flex' },
  merek: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nama: { ...H.display, fontSize: 44, lineHeight: 44, color: W.tinta, textTransform: 'uppercase', letterSpacing: 1 },
  jenis: { ...H.monoTebal, fontSize: 12, letterSpacing: 1, color: W.tinta2, textTransform: 'uppercase' },
  tagline: { ...H.display, fontSize: 30, lineHeight: 32, color: W.tinta, textTransform: 'uppercase' },
  konteks: { ...H.isi, fontSize: 15, lineHeight: 22, color: W.tinta2 },
  fitur: { borderTopWidth: 2, borderColor: W.tinta },
  fiturItem: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: W.garisTegas },
  fiturNo: { ...H.monoTebal, fontSize: 13, color: W.stempel, paddingTop: 2 },
  fiturJudul: { ...H.isiTebal, fontSize: 15, color: W.tinta },
  fiturIsi: { ...H.isi, fontSize: 13.5, lineHeight: 19, color: W.tinta2 },
  qrBaris: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: W.kertas, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: W.garis },
  qr: { width: 104, height: 104 },
  qrTeks: { ...H.isi, flex: 1, fontSize: 13, lineHeight: 18, color: W.tinta },
  cta: {
    ...H.isiTebal, fontSize: 16, color: '#FFF8EE', backgroundColor: W.stempel, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 18, textAlign: 'center', borderWidth: 1.5, borderColor: W.stempelTua,
  },
  kecil: { ...H.isi, fontSize: 12.5, lineHeight: 18, color: W.tinta2 },
});
