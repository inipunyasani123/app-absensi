import { StyleSheet, Text, View } from 'react-native';
import { ORANG, SAYA_ID, SHIFT } from '@/lib/data';
import { Hari, hari } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { HARI_PENDEK, awalPekan, jam, sama, tambahHari } from '@/lib/waktu';
import { H, W } from '@/theme';
import { Kartu, Teks } from './ui';

function sel(h: Hari, jenis: 'masuk' | 'pulang') {
  if (h.status === 'libur') return jenis === 'masuk' ? 'LIBUR' : '';
  if (h.status === 'cuti' || h.status === 'izin' || h.status === 'sakit') return jenis === 'masuk' ? h.status.toUpperCase() : '';
  if (h.status === 'alpa') return jenis === 'masuk' ? 'ALPA' : '';
  const v = jenis === 'masuk' ? h.masuk : h.pulang;
  return v != null ? jam(v) : '· · ·';
}

/** Kartu absen pekan ini, digambar seperti kartu jam pons. */
export function KartuPekan() {
  const ctx = useGilir();
  const senin = awalPekan(ctx.hariIni);
  const daftar = Array.from({ length: 7 }, (_, i) => hari(SAYA_ID, tambahHari(senin, i), ctx));
  return (
    <Kartu lubang label="Kartu absen pekan ini" style={{ paddingTop: 14 }}>
      <View style={st.kepala}>
        <Teks v="judul" tingkat={2}>Kartu pekan ini</Teks>
        <Teks v="monoKecil" warna={W.tinta2}>No. {ORANG[SAYA_ID].nik}</Teks>
      </View>
      <View style={st.tabel} accessibilityRole="none">
        <View style={[st.baris, st.barisKepala]}>
          <Text style={[st.kol1, st.th]}>Hari</Text>
          <Text style={[st.kol2, st.th]}>Shift</Text>
          <Text style={[st.kol3, st.th]}>Masuk</Text>
          <Text style={[st.kol3, st.th]}>Pulang</Text>
        </View>
        {daftar.map((h, i) => {
          const hariIni = sama(h.tgl, ctx.hariIni);
          const telat = !!h.telatMenit;
          const label = `${HARI_PENDEK[i]} ${h.tgl.d}: ${h.shift === 'libur' ? 'libur' : `shift ${SHIFT[h.shift].nama}`}, masuk ${sel(h, 'masuk')}${h.pulang != null ? `, pulang ${jam(h.pulang)}` : ''}${telat ? `, telat ${h.telatMenit} menit` : ''}`;
          return (
            <View key={h.kunci} style={[st.baris, hariIni && st.barisHariIni]} accessible accessibilityLabel={label}>
              <Text style={[st.kol1, st.td, st.tebal]}>
                {HARI_PENDEK[i]} <Text style={st.redup}>{h.tgl.d}</Text>
              </Text>
              <Text style={[st.kol2, st.td]}>{h.shift === 'libur' ? '—' : SHIFT[h.shift].nama}</Text>
              <Text style={[st.kol3, st.td, st.mono, telat && { color: W.stempel }, h.status === 'libur' && { color: W.tinta2 }]}>
                {sel(h, 'masuk')}
              </Text>
              <Text style={[st.kol3, st.td, st.mono]}>{sel(h, 'pulang')}</Text>
            </View>
          );
        })}
      </View>
      <Teks v="kecil" warna={W.tinta2} style={{ marginTop: 8 }}>
        Jam merah berarti telat lebih dari 5 menit.
      </Teks>
    </Kartu>
  );
}

const st = StyleSheet.create({
  kepala: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  tabel: { borderTopWidth: 2, borderColor: W.tinta },
  baris: { flexDirection: 'row', alignItems: 'center', minHeight: 34, borderBottomWidth: 1, borderColor: W.garis, paddingHorizontal: 4 },
  barisKepala: { minHeight: 28 },
  barisHariIni: { backgroundColor: W.kunyitMuda },
  th: { ...H.monoTebal, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: W.tinta2 },
  td: { ...H.isi, fontSize: 14, color: W.tinta },
  tebal: { ...H.isiTebal },
  redup: { ...H.isi, color: W.tinta2 },
  mono: { ...H.monoTebal, fontSize: 13.5 },
  kol1: { width: 64 },
  kol2: { flex: 1 },
  kol3: { width: 66, textAlign: 'right' },
});
