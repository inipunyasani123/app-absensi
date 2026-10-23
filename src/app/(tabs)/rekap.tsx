import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Kartu, Kerangka, Layar, Segmen, Teks } from '@/components/ui';
import { SAYA_ID, SHIFT } from '@/lib/data';
import { meta } from '@/lib/meta';
import { Hari, StatusHari, rekapBulan } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { BULAN_PENDEK, HARI_PENDEK, NAMA_BULAN, geserBulan, hariDalamPekan, jam, jamDesimal, sama, tanggalPendek } from '@/lib/waktu';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/rekap', 'Rekap Kehadiran Bulanan · Gilir', 'Rekap absensi bulanan: persentase hadir, telat, izin, sakit, cuti, alpa, dan jam lembur, lengkap dengan kalender kehadiran. Demo aplikasi Gilir.');
}

const KODE: Record<StatusHari, { huruf: string; nama: string; bg: string; fg: string; garis?: string }> = {
  hadir: { huruf: 'H', nama: 'Hadir', bg: W.hijauMuda, fg: W.hijauTua },
  luar: { huruf: 'H', nama: 'Hadir (di luar jam)', bg: W.hijauMuda, fg: W.hijauTua },
  telat: { huruf: 'T', nama: 'Telat', bg: W.stempelMuda, fg: W.stempelTua },
  izin: { huruf: 'I', nama: 'Izin', bg: W.unguMuda, fg: W.ungu },
  sakit: { huruf: 'S', nama: 'Sakit', bg: W.unguMuda, fg: W.ungu },
  cuti: { huruf: 'C', nama: 'Cuti', bg: W.kunyitMuda, fg: W.tinta },
  alpa: { huruf: 'A', nama: 'Alpa', bg: W.jelaga, fg: W.diJelaga },
  libur: { huruf: 'L', nama: 'Libur', bg: 'transparent', fg: W.tinta2, garis: W.garisTegas },
  nanti: { huruf: '·', nama: 'Belum lewat', bg: W.kertas2, fg: W.tinta2 },
  berjalan: { huruf: 'H', nama: 'Hadir, sedang bekerja', bg: W.hijauMuda, fg: W.hijauTua, garis: W.tinta },
  belum: { huruf: '?', nama: 'Belum absen', bg: W.kunyitMuda, fg: W.tinta, garis: W.tinta },
};

export default function Rekap() {
  const { siap } = useGilir();
  return (
    <Layar tab sub="Kehadiran Sekar Wulandari" judul="Rekap bulanan">
      <Isi />
    </Layar>
  );
}

function Isi() {
  const ctx = useGilir();
  const [geser, setGeser] = useState<'0' | '1' | '2'>('0');
  const bln = geserBulan(ctx.hariIni.y, ctx.hariIni.m, -Number(geser));
  // Sebelum data siap: kerangka berisi dengan struktur sama (tanpa nilai yang bergantung tanggal).
  const r = useMemo(() => (ctx.siap ? rekapBulan(SAYA_ID, bln.y, bln.m, ctx) : null), [bln.y, bln.m, ctx]);
  const pilihan = (['0', '1', '2'] as const).map((g) => {
    const b = geserBulan(ctx.hariIni.y, ctx.hariIni.m, -Number(g));
    return { nilai: g, label: ctx.siap ? `${BULAN_PENDEK[b.m - 1]} ${String(b.y).slice(2)}` : ['Bulan ini', 'Bulan lalu', '2 bln lalu'][Number(g)] };
  });
  const namaBulan = ctx.siap ? `${NAMA_BULAN[bln.m - 1]} ${bln.y}` : 'Bulan ini';
  const pertama = r?.hari[0]?.tgl;
  const kosong = pertama ? hariDalamPekan(pertama) : 0;
  const catatan = (r?.hari ?? []).filter((h) => h.telatMenit || h.status === 'alpa' || h.lemburMenit || h.lemburMenunggu || h.status === 'sakit' || h.status === 'izin' || h.status === 'cuti');

  return (
    <>
      <Segmen label="Pilih bulan" nilai={geser} ubah={setGeser} pilihan={pilihan} />

      <View style={st.bento}>
        <View style={st.persen} accessible accessibilityLabel={r ? `Kehadiran ${namaBulan}: ${r.persen ?? 0} persen, ${r.hadir} dari ${r.hariKerja} hari kerja` : 'Kehadiran bulan ini sedang dihitung'}>
          <Teks v="label" warna={W.diJelaga2}>Kehadiran {geser === '0' ? 's.d. hari ini' : NAMA_BULAN[bln.m - 1]}</Teks>
          <Teks v="raksasa" warna={W.diJelaga} style={{ fontSize: 76, lineHeight: 76 }}>
            {r ? r.persen ?? 0 : '––'}
            <Text style={{ fontSize: 36, color: W.oranyeTerang }}>%</Text>
          </Teks>
          <Teks v="kecil" warna={W.diJelaga}>{r ? `${r.hadir} dari ${r.hariKerja} hari kerja` : 'menghitung kartu absen…'}</Teks>
          <Teks v="monoKecil" warna={W.diJelaga2}>
            {!r ? 'rata-rata jam masuk' : r.rataSelisihMasuk == null ? 'belum ada data masuk' : r.rataSelisihMasuk <= 0 ? `rata-rata masuk ${-r.rataSelisihMasuk} mnt lebih awal` : `rata-rata masuk ${r.rataSelisihMasuk} mnt setelah shift`}
          </Teks>
        </View>
        <View style={st.kolomAngka}>
          <Angka label="Telat" nilai={r ? `${r.telat}×` : '–'} ket={!r ? 'bulan ini' : r.telat ? `total ${r.telatMenit} menit` : 'nihil'} nada="merah" />
          <Angka label="Alpa" nilai={r ? `${r.alpa}` : '–'} ket={!r ? 'bulan ini' : r.alpa ? 'hari tanpa kabar' : 'nihil'} nada={r?.alpa ? 'gelap' : 'kertas'} />
        </View>
      </View>
      <View style={st.barisAngka}>
        <Angka label="Izin" nilai={r ? `${r.izin}` : '–'} ket="hari" nada="ungu" />
        <Angka label="Sakit" nilai={r ? `${r.sakit}` : '–'} ket="hari" nada="ungu" />
        <Angka label="Cuti" nilai={r ? `${r.cuti}` : '–'} ket="hari" nada="kunyit" />
      </View>

      <Kartu style={st.lembur} label="Lembur">
        <View style={{ flex: 1 }}>
          <Teks v="label" warna={W.hijauTua}>Lembur disetujui</Teks>
          <Teks v="angka" warna={W.hijauTua}>{r ? jamDesimal(r.lemburMenit) : '–'} jam</Teks>
        </View>
        {!!r && r.lemburMenunggu > 0 && (
          <View style={{ alignItems: 'flex-end' }}>
            <Teks v="label" warna={W.stempelTua}>Menunggu</Teks>
            <Teks v="judul" warna={W.stempelTua}>{jamDesimal(r.lemburMenunggu)} jam</Teks>
          </View>
        )}
      </Kartu>

      <Kartu lubang label={`Kalender kehadiran ${namaBulan}`}>
        <Teks v="judul" tingkat={2} style={{ marginBottom: 8 }}>{namaBulan}</Teks>
        <View style={st.kalender}>
          {HARI_PENDEK.map((h) => (
            <Text key={h} style={st.kepalaHari} aria-hidden>{h}</Text>
          ))}
          {Array.from({ length: kosong }, (_, i) => <View key={`k${i}`} style={st.sel} />)}
          {r
            ? r.hari.map((h) => <Sel key={h.kunci} h={h} hariIni={sama(h.tgl, ctx.hariIni)} />)
            : Array.from({ length: 35 }, (_, i) => (
                <View key={`p${i}`} style={st.sel} aria-hidden>
                  <View style={[st.selIsi, { backgroundColor: W.kertas2, borderColor: W.kertas2 }]} />
                </View>
              ))}
        </View>
        <View style={st.legenda}>
          {(['hadir', 'telat', 'izin', 'cuti', 'alpa', 'libur'] as StatusHari[]).map((k) => (
            <View key={k} style={st.legendaItem}>
              <View style={[st.legendaKotak, { backgroundColor: KODE[k].bg, borderColor: KODE[k].garis ?? KODE[k].bg }]}>
                <Text style={[st.legendaHuruf, { color: KODE[k].fg }]}>{KODE[k].huruf}</Text>
              </View>
              <Text style={st.legendaTeks}>{k === 'izin' ? 'Izin/sakit' : KODE[k].nama}</Text>
            </View>
          ))}
        </View>
      </Kartu>

      <Kartu style={{ gap: 6 }} label="Catatan bulan ini">
        <Teks v="judul" tingkat={2}>Catatan</Teks>
        {!r && <Teks v="kecil" warna={W.tinta2}>Telat, alpa, izin, sakit, cuti, dan lembur bulan ini akan tercatat di sini.</Teks>}
        {r && catatan.length === 0 && <Teks v="kecil" warna={W.tinta2}>Tidak ada telat, alpa, izin, atau lembur.</Teks>}
        {catatan.map((h) => (
          <View key={h.kunci} style={st.catatan}>
            <Text style={st.catatanTgl}>{tanggalPendek(h.tgl)}</Text>
            <Teks v="kecil" style={{ flex: 1 }}>{teksCatatan(h)}</Teks>
          </View>
        ))}
      </Kartu>
    </>
  );
}

function teksCatatan(h: Hari) {
  const bagian: string[] = [];
  if (h.telatMenit) bagian.push(`Telat ${h.telatMenit} menit (masuk ${jam(h.masuk ?? 0)}, shift ${SHIFT[h.shift].nama} ${jam(SHIFT[h.shift].mulai)})`);
  if (h.status === 'alpa') bagian.push('Alpa: tidak absen tanpa pengajuan');
  if (h.status === 'sakit') bagian.push('Sakit');
  if (h.status === 'izin') bagian.push('Izin');
  if (h.status === 'cuti') bagian.push('Cuti tahunan');
  if (h.lemburMenit) bagian.push(`Lembur ${jamDesimal(h.lemburMenit)} jam disetujui`);
  if (h.lemburMenunggu) bagian.push(`Lembur ${jamDesimal(h.lemburMenunggu)} jam menunggu persetujuan`);
  return bagian.join(' · ');
}

function Angka({ label, nilai, ket, nada }: { label: string; nilai: string; ket: string; nada: 'merah' | 'gelap' | 'kertas' | 'ungu' | 'kunyit' }) {
  const n = {
    merah: [W.stempelMuda, W.stempelTua, '#E8B9AA'], gelap: [W.jelaga, W.diJelaga, W.jelaga], kertas: [W.kertas, W.tinta, W.garis],
    ungu: [W.unguMuda, W.ungu, '#C9C1E4'], kunyit: [W.kunyitMuda, W.tinta, '#E6D08E'],
  }[nada];
  return (
    <View style={[st.angka, { backgroundColor: n[0], borderColor: n[2] }]} accessible accessibilityLabel={`${label} ${nilai} ${ket}`}>
      <Teks v="label" warna={n[1]}>{label}</Teks>
      <Teks v="judul" warna={n[1]} style={{ fontSize: 28, lineHeight: 30 }}>{nilai}</Teks>
      <Teks v="monoKecil" warna={n[1]}>{ket}</Teks>
    </View>
  );
}

function Sel({ h, hariIni }: { h: Hari; hariIni: boolean }) {
  const k = KODE[h.status];
  const label = `${tanggalPendek(h.tgl)}: ${k.nama}${h.masuk != null ? `, masuk ${jam(h.masuk)}` : ''}${h.telatMenit ? `, telat ${h.telatMenit} menit` : ''}${hariIni ? ', hari ini' : ''}`;
  return (
    <View style={st.sel} accessible accessibilityLabel={label}>
      <View style={[st.selIsi, { backgroundColor: k.bg, borderColor: hariIni ? W.tinta : k.garis ?? k.bg }, hariIni && { borderWidth: 2 }]}>
        <Text style={[st.selTgl, { color: k.fg }]}>{h.tgl.d}</Text>
        <Text style={[st.selHuruf, { color: k.fg }]}>{k.huruf}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bento: { flexDirection: 'row', gap: 10 },
  persen: { flex: 1.1, backgroundColor: W.jelaga, borderRadius: 22, padding: 14, gap: 4, justifyContent: 'space-between' },
  kolomAngka: { flex: 1, gap: 10 },
  barisAngka: { flexDirection: 'row', gap: 10 },
  angka: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 10, gap: 1 },
  lembur: { flexDirection: 'row', alignItems: 'center', backgroundColor: W.hijauMuda, borderColor: '#BBD3B0' },
  kalender: { flexDirection: 'row', flexWrap: 'wrap' },
  kepalaHari: { width: `${100 / 7}%`, textAlign: 'center', ...H.monoTebal, fontSize: 12, color: W.tinta2, letterSpacing: 0.8, textTransform: 'uppercase', paddingBottom: 6 },
  sel: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2.5 },
  selIsi: { flex: 1, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  selTgl: { ...H.mono, fontSize: 12, lineHeight: 14 },
  selHuruf: { ...H.display, fontSize: 18, lineHeight: 20 },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendaKotak: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  legendaHuruf: { ...H.display, fontSize: 13 },
  legendaTeks: { ...H.isi, fontSize: 12.5, color: W.tinta },
  catatan: { flexDirection: 'row', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderColor: W.garis },
  catatanTgl: { ...H.monoTebal, fontSize: 12.5, color: W.tinta, width: 56 },
});
