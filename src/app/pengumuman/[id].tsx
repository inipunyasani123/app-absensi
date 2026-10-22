import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Chip, Kartu, Kerangka, Layar, Tautan, Teks } from '@/components/ui';
import { PENGUMUMAN_META, daftarPengumuman } from '@/lib/data';
import { FOTO_ROTI } from '@/lib/foto';
import { meta } from '@/lib/meta';
import { useLocalSearchParams } from '@/lib/nav';
import { useGilir } from '@/lib/store';
import { NAMA_BULAN, geserBulan, tanggalPanjang } from '@/lib/waktu';
import { W } from '@/theme';

export function generateStaticParams() {
  return Object.keys(PENGUMUMAN_META).map((id) => ({ id }));
}

export function generateMetadata(_: unknown, params: { id: string }) {
  const m = PENGUMUMAN_META[params.id] ?? ['Pengumuman', 'Pengumuman HR di demo Gilir.'];
  return meta(`/pengumuman/${params.id}`, `${m[0]} · Gilir`, m[1]);
}

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const m = PENGUMUMAN_META[id ?? ''];
  return (
    <Layar kembali="/pengumuman" kecil sub="Pengumuman HR" judul={m ? m[0] : 'Pengumuman tidak ditemukan'}>
      <Isi id={id ?? ''} />
    </Layar>
  );
}

function Isi({ id }: { id: string }) {
  const ctx = useGilir();
  const { siap, tandaiDibaca } = ctx;
  useEffect(() => {
    if (siap && PENGUMUMAN_META[id]) tandaiDibaca(id);
  }, [siap, id, tandaiDibaca]);
  if (!siap) return <Kerangka tinggi={200} lebar="100%" />;
  const lalu = NAMA_BULAN[geserBulan(ctx.hariIni.y, ctx.hariIni.m, -1).m - 1];
  const p = daftarPengumuman(ctx.hariIni, lalu).find((x) => x.id === id);
  if (!p) {
    return (
      <Kartu style={{ gap: 8 }}>
        <Teks>Pengumuman ini sudah tidak tersedia.</Teks>
        <Tautan href="/pengumuman" label="Kembali ke daftar pengumuman" style={st.tautan}>
          <Teks v="subjudul">Lihat semua pengumuman</Teks>
        </Tautan>
      </Kartu>
    );
  }
  return (
    <>
      <View style={st.meta}>
        <Chip teks={p.kategori} nada={p.penting ? 'stempel' : 'kertas'} />
        <Teks v="monoKecil" warna={W.tinta2}>{tanggalPanjang(p.tanggal)}</Teks>
      </View>
      {p.id === 'slip-gaji-terbit' && <Teks v="subjudul">Slip gaji {lalu} sudah terbit</Teks>}
      {p.foto && (
        <View style={st.foto}>
          <Image
            source={FOTO_ROTI}
            style={{ width: '100%', aspectRatio: 3 / 2 }}
            accessibilityLabel="Rak kayu berisi roti tawar yang baru dipanggang"
            resizeMode="cover"
          />
        </View>
      )}
      <Kartu style={{ gap: 10 }}>
        {p.isi.map((par, i) => (
          <Teks key={i}>{par}</Teks>
        ))}
        <Teks v="kecil" warna={W.tinta2}>— Bagian HR {`Roti Lintang Pagi`}</Teks>
      </Kartu>
    </>
  );
}

const st = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  foto: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: W.garis, backgroundColor: W.kertas2 },
  tautan: { paddingVertical: 8 },
});
