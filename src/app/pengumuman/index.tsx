import { StyleSheet, View } from 'react-native';
import { Chip, Kerangka, Layar, Stempel, Tautan, Teks, Tombol } from '@/components/ui';
import { daftarPengumuman } from '@/lib/data';
import { meta } from '@/lib/meta';
import { useGilir } from '@/lib/store';
import { NAMA_BULAN, Tgl, banding, geserBulan, relatif, tanggalPendek } from '@/lib/waktu';
import { W } from '@/theme';

export function generateMetadata() {
  return meta('/pengumuman', 'Pengumuman HR untuk Karyawan · Gilir', 'Papan pengumuman HR di aplikasi karyawan: pelatihan, aturan kehadiran, slip gaji terbit, dan kegiatan tim. Demo aplikasi Gilir dari PintuWeb.');
}

export default function Pengumuman() {
  const ctx = useGilir();
  return (
    <Layar kembali sub="Dari bagian HR" judul="Pengumuman">
      <Teks v="isi" warna={W.tinta2}>
        Kabar dari bagian HR Roti Lintang Pagi untuk semua gerai: pelatihan, aturan kerja, jadwal libur, dan gaji. Kabar wajib selalu di atas.
      </Teks>
      {ctx.siap ? <Daftar /> : <Kerangka tinggi={300} lebar="100%" />}
    </Layar>
  );
}

function Daftar() {
  const ctx = useGilir();
  const lalu = NAMA_BULAN[geserBulan(ctx.hariIni.y, ctx.hariIni.m, -1).m - 1];
  const umur = (p: { tanggal: Tgl }) => banding(ctx.hariIni, p.tanggal);
  const semua = daftarPengumuman(ctx.hariIni, lalu).sort((x, y) => umur(x) - umur(y));
  // Kabar wajib disematkan di atas; sisanya urut terbaru.
  const daftar = [...semua.filter((p) => p.penting), ...semua.filter((p) => !p.penting)];
  const dibaca = (id: string) => ctx.simpanan.dibaca.includes(id);
  const baru = daftar.filter((p) => !dibaca(p.id) && umur(p) <= 3);
  return (
    <>
      <View style={st.atas}>
        <Teks v="kecil" warna={W.tinta2}>{baru.length ? `${baru.length} kabar baru · 3 hari terakhir` : 'Tidak ada kabar baru'}</Teks>
        {daftar.some((p) => !dibaca(p.id)) && <Tombol varian="teks" label="Tandai semua dibaca" onPress={() => daftar.forEach((p) => ctx.tandaiDibaca(p.id))} />}
      </View>
      <View style={{ gap: 10 }} {...({ role: 'list' } as object)}>
        {daftar.map((p) => {
          const sudah = dibaca(p.id);
          const isBaru = !sudah && umur(p) <= 3;
          return (
            <View key={p.id} {...({ role: 'listitem' } as object)}>
              <Tautan href={`/pengumuman/${p.id}`} style={[st.item, p.penting && st.penting, sudah && st.sudah]}>
                <View style={st.baris}>
                  <Teks v="label" warna={p.penting ? W.stempel : W.tinta2}>
                    {p.kategori} · {tanggalPendek(p.tanggal)} · {relatif(p.tanggal, ctx.hariIni)}
                  </Teks>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {isBaru && <Chip teks="Baru" nada="kunyit" />}
                    {p.penting && <Stempel teks="Wajib" kecil miring={4} />}
                  </View>
                </View>
                <Teks v="subjudul">{p.judul}</Teks>
                <Teks v="kecil" warna={W.tinta2}>{p.ringkas}</Teks>
                {sudah && <Teks v="monoKecil" warna={W.tinta2}>sudah dibaca</Teks>}
              </Tautan>
            </View>
          );
        })}
      </View>
    </>
  );
}

const st = StyleSheet.create({
  atas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 },
  item: { backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 4 },
  penting: { borderLeftWidth: 5, borderLeftColor: W.stempel },
  sudah: { backgroundColor: W.kertas2, borderColor: W.garis },
  baris: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
