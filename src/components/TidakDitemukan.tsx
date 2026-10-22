import { StyleSheet, View } from 'react-native';
import { Kartu, Layar, Stempel, Tautan, Teks } from './ui';
import { Ikon } from './Ikon';
import { W } from '@/theme';

/** Halaman 404 bergaya kartu absen yang tertolak. */
export function TidakDitemukan() {
  return (
    <Layar sub="Kode 404" judul="Kartu tidak dikenal">
      <Kartu lubang style={{ gap: 14, alignItems: 'center', paddingVertical: 28 }}>
        <Stempel teks="Tidak terdaftar" sub="halaman ini tidak ada" miring={-7} />
        <Teks style={{ textAlign: 'center' }}>
          Mesin absen tidak mengenali alamat ini. Mungkin tautannya salah ketik atau halamannya sudah dipindah.
        </Teks>
      </Kartu>
      <View style={st.kisi}>
        <Tautan href="/" label="Ke halaman absen" style={st.tautan}>
          <Ikon nama="jam" />
          <Teks v="subjudul">Ke halaman absen</Teks>
        </Tautan>
        <Tautan href="/jadwal" label="Lihat jadwal shift" style={st.tautan}>
          <Ikon nama="kalender" />
          <Teks v="subjudul">Lihat jadwal shift</Teks>
        </Tautan>
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  kisi: { gap: 10 },
  tautan: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1.5, borderColor: W.tinta, backgroundColor: W.kertas },
});
