import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ikon, NamaIkon } from '@/components/Ikon';
import { KartuPengajuan } from '@/components/KartuPengajuan';
import { Kartu, Kerangka, Layar, Segmen, Tautan, Teks } from '@/components/ui';
import { ATURAN, JenisPengajuan, NAMA_JENIS, ORANG, SAYA_ID, StatusPengajuan } from '@/lib/data';
import { meta } from '@/lib/meta';
import { useLocalSearchParams } from '@/lib/nav';
import { sisaCuti } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { W } from '@/theme';

export function generateMetadata() {
  return meta('/pengajuan', 'Cuti, Izin, Sakit & Lembur · Gilir', 'Ajukan cuti tahunan, izin, sakit, atau lembur dari HP, pantau status persetujuan kepala gerai, dan lihat sisa cuti. Demo aplikasi Gilir.');
}

const JENIS: { j: JenisPengajuan; ikon: NamaIkon; ket: string }[] = [
  { j: 'cuti', ikon: 'kalender', ket: 'potong jatah tahunan' },
  { j: 'izin', ikon: 'catatan', ket: 'keperluan pribadi' },
  { j: 'sakit', ikon: 'tameng', ket: 'surat dokter bila perlu' },
  { j: 'lembur', ikon: 'jam', ket: 'setelah jam shift' },
];

export default function HalamanPengajuan() {
  const { siap } = useGilir();
  return (
    <Layar tab sub="Cuti · izin · sakit · lembur" judul="Pengajuan">
      {siap ? <Isi /> : <><Kerangka tinggi={150} lebar="100%" /><Kerangka tinggi={220} lebar="100%" /></>}
    </Layar>
  );
}

function Isi() {
  const ctx = useGilir();
  const { terkirim } = useLocalSearchParams<{ terkirim?: string }>();
  const [filter, setFilter] = useState<'semua' | StatusPengajuan>('semua');
  const cuti = sisaCuti(ctx);
  const milikku = ctx.pengajuan.filter((p) => p.orang === SAYA_ID);
  const tampil = milikku.filter((p) => filter === 'semua' || p.status === filter);
  const menunggu = milikku.filter((p) => p.status === 'menunggu').length;
  const baru = terkirim ? milikku.find((p) => p.id === terkirim) : undefined;

  return (
    <>
      {baru && (
        <View style={st.terkirim} aria-live="polite">
          <Ikon nama="centang" warna={W.hijauTua} />
          <Teks v="kecil" warna={W.hijauTua} style={{ flex: 1 }}>
            {NAMA_JENIS[baru.jenis]} terkirim ke {ORANG.bayu.nama}. Coba setujui lewat mode atasan.
          </Teks>
        </View>
      )}

      <View style={st.bento}>
        <View style={[st.ubin, st.ubinCuti]} accessible accessibilityLabel={`Sisa cuti ${cuti.sisa} dari ${cuti.jatah} hari, terpakai ${cuti.terpakai}, menunggu ${cuti.menunggu}`}>
          <Teks v="label">Sisa cuti {ctx.hariIni.y}</Teks>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            <Teks v="raksasa" style={{ fontSize: 76, lineHeight: 74 }}>{cuti.sisa}</Teks>
            <Teks v="subjudul" style={{ marginBottom: 10 }}>/ {cuti.jatah} hari</Teks>
          </View>
          <View style={st.petak} aria-hidden>
            {Array.from({ length: cuti.jatah }, (_, i) => (
              <View
                key={i}
                style={[st.petakItem, i < cuti.terpakai && { backgroundColor: W.tinta }, i >= cuti.terpakai && i < cuti.terpakai + cuti.menunggu && { backgroundColor: W.stempel, borderColor: W.stempel }]}
              />
            ))}
          </View>
          <Teks v="kecil">{cuti.terpakai} terpakai{cuti.menunggu ? ` · ${cuti.menunggu} menunggu` : ''}</Teks>
        </View>
        <View style={{ width: 118, gap: 10 }}>
          <View style={[st.ubin, st.ubinMerah]}>
            <Teks v="label" warna={W.stempelTua}>Menunggu</Teks>
            <Teks v="angka" warna={W.stempelTua}>{menunggu}</Teks>
          </View>
          <View style={[st.ubin, st.ubinKertas]}>
            <Teks v="label" warna={W.tinta2}>Total</Teks>
            <Teks v="angka">{milikku.length}</Teks>
          </View>
        </View>
      </View>

      <Teks v="judul" tingkat={2} style={{ marginTop: 4 }}>Ajukan baru</Teks>
      <View style={st.kisi}>
        {JENIS.map((x) => (
          <Tautan key={x.j} href={`/pengajuan/baru?jenis=${x.j}`} style={st.jenis}>
            <View style={st.jenisIkon}><Ikon nama={x.ikon} warna={W.diJelaga} /></View>
            <Teks v="subjudul" style={{ fontSize: 15 }}>{NAMA_JENIS[x.j]}</Teks>
            <Teks v="kecil" warna={W.tinta2}>{x.ket}</Teks>
          </Tautan>
        ))}
      </View>

      <Teks v="judul" tingkat={2} style={{ marginTop: 4 }}>Riwayat pengajuanku</Teks>
      <Segmen
        label="Saring status pengajuan"
        nilai={filter}
        ubah={setFilter}
        pilihan={[
          { nilai: 'semua', label: 'Semua' },
          { nilai: 'menunggu', label: 'Menunggu' },
          { nilai: 'disetujui', label: 'Disetujui' },
          { nilai: 'ditolak', label: 'Ditolak' },
        ]}
      />
      <View style={{ gap: 10 }} {...({ role: 'list' } as object)}>
        {tampil.length === 0 && <Teks v="kecil" warna={W.tinta2}>Belum ada pengajuan dengan status ini.</Teks>}
        {tampil.map((p) => (
          <View key={p.id} {...({ role: 'listitem' } as object)}>
            <KartuPengajuan p={p} />
          </View>
        ))}
      </View>

      <Kartu nada="polos" style={{ gap: 4 }}>
        <Teks v="subjudul">Aturan singkat</Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Jatah cuti {ATURAN.jatahCuti} hari per tahun untuk karyawan yang sudah bekerja 12 bulan. Hari libur shift tidak memotong cuti. Ajukan cuti paling lambat 3 hari sebelumnya; sakit lebih dari 1 hari sertakan surat dokter.
        </Teks>
      </Kartu>
    </>
  );
}

const st = StyleSheet.create({
  terkirim: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: W.hijauMuda, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#BBD3B0' },
  bento: { flexDirection: 'row', gap: 10 },
  ubin: { borderRadius: 22, padding: 14, borderWidth: 1 },
  ubinCuti: { flex: 1, backgroundColor: W.kunyit, borderColor: '#D9AE34', gap: 6 },
  ubinMerah: { flex: 1, backgroundColor: W.stempelMuda, borderColor: '#E8B9AA', justifyContent: 'space-between' },
  ubinKertas: { flex: 1, backgroundColor: W.kertas, borderColor: W.garis, justifyContent: 'space-between' },
  petak: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  petakItem: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5, borderColor: W.tinta },
  kisi: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  jenis: { flexBasis: '47%', flexGrow: 1, backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1, borderColor: W.garis, padding: 12, gap: 4 },
  jenisIkon: { width: 40, height: 40, borderRadius: 12, backgroundColor: W.jelaga, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
