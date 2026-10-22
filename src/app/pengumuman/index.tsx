import { StyleSheet, View } from 'react-native';
import { Chip, Kerangka, Layar, Tautan, Teks, Tombol } from '@/components/ui';
import { daftarPengumuman } from '@/lib/data';
import { meta } from '@/lib/meta';
import { useGilir } from '@/lib/store';
import { NAMA_BULAN, geserBulan, relatif, tanggalPendek } from '@/lib/waktu';
import { W } from '@/theme';

export function generateMetadata() {
  return meta('/pengumuman', 'Pengumuman HR untuk Karyawan · Gilir', 'Papan pengumuman HR di aplikasi karyawan: pelatihan, aturan kehadiran, slip gaji terbit, dan kegiatan tim. Demo aplikasi Gilir dari PintuWeb.');
}

export default function Pengumuman() {
  const ctx = useGilir();
  return (
    <Layar kembali sub="Dari bagian HR" judul="Pengumuman">
      {ctx.siap ? <Daftar /> : <Kerangka tinggi={300} lebar="100%" />}
    </Layar>
  );
}

function Daftar() {
  const ctx = useGilir();
  const lalu = NAMA_BULAN[geserBulan(ctx.hariIni.y, ctx.hariIni.m, -1).m - 1];
  const daftar = daftarPengumuman(ctx.hariIni, lalu).sort((a, b) => (a.tanggal.y * 400 + a.tanggal.m * 32 + a.tanggal.d < b.tanggal.y * 400 + b.tanggal.m * 32 + b.tanggal.d ? 1 : -1));
  const belum = daftar.filter((p) => !ctx.simpanan.dibaca.includes(p.id));
  return (
    <>
      <View style={st.atas}>
        <Teks v="kecil" warna={W.tinta2}>{belum.length ? `${belum.length} belum dibaca` : 'Semua sudah dibaca'}</Teks>
        {belum.length > 0 && <Tombol varian="teks" label="Tandai semua dibaca" onPress={() => belum.forEach((p) => ctx.tandaiDibaca(p.id))} />}
      </View>
      <View style={{ gap: 10 }} {...({ role: 'list' } as object)}>
        {daftar.map((p) => {
          const baru = !ctx.simpanan.dibaca.includes(p.id);
          return (
            <View key={p.id} {...({ role: 'listitem' } as object)}>
              <Tautan href={`/pengumuman/${p.id}`} style={[st.item, p.penting && st.penting]}>
                <View style={st.baris}>
                  <Teks v="label" warna={p.penting ? W.stempel : W.tinta2}>{p.kategori} · {tanggalPendek(p.tanggal)} · {relatif(p.tanggal, ctx.hariIni)}</Teks>
                  {baru && <Chip teks="Baru" nada="stempel" />}
                </View>
                <Teks v="subjudul">{p.judul}</Teks>
                <Teks v="kecil" warna={W.tinta2}>{p.ringkas}</Teks>
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
  baris: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
