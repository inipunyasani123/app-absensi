import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { IlustrasiBukti } from '@/components/Ilustrasi';
import { Jam } from '@/components/Jam';
import { LokasiPanel, useLokasiHariIni } from '@/components/LokasiPanel';
import { Kartu, Kerangka, Layar, Stempel, Teks, Tombol } from '@/components/ui';
import { keadaanHariIni } from '@/lib/hariini';
import { meta } from '@/lib/meta';
import { router, useLocalSearchParams } from '@/lib/nav';
import { BuktiAbsen, nilaiMasuk } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { durasi, jam, jamDesimal } from '@/lib/waktu';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/absen', 'Konfirmasi Absen Masuk & Pulang · Gilir', 'Langkah absen di demo Gilir: cek radius gerai, pilih bukti tugas tanpa swafoto, lalu stempel jam masuk atau pulang.');
}

const PILIHAN: Record<'masuk' | 'pulang', { id: BuktiAbsen; label: string }[]> = {
  masuk: [
    { id: 'seragam', label: 'Seragam & celemek lengkap' },
    { id: 'kasir', label: 'Kasir dibuka, uang modal dihitung' },
    { id: 'etalase', label: 'Etalase tertata' },
    { id: 'kiriman', label: 'Kiriman dari dapur diterima' },
  ],
  pulang: [
    { id: 'kasir', label: 'Kas disetor ke kepala gerai' },
    { id: 'etalase', label: 'Etalase dibersihkan' },
    { id: 'kiriman', label: 'Sisa roti dicatat' },
    { id: 'seragam', label: 'Celemek dikembalikan' },
  ],
};

export default function Absen() {
  const params = useLocalSearchParams<{ jenis?: string }>();
  const jenis: 'masuk' | 'pulang' = params.jenis === 'pulang' ? 'pulang' : 'masuk';
  const ctx = useGilir();
  return (
    <Layar kembali sub="Konfirmasi" judul={!ctx.siap ? 'Absen' : jenis === 'masuk' ? 'Absen masuk' : 'Absen pulang'}>
      {ctx.siap ? <Form jenis={jenis} /> : <Kartu nada="jelaga" style={{ gap: 12, minHeight: 180 }}><Kerangka gelap /><Kerangka gelap tinggi={70} /></Kartu>}
    </Layar>
  );
}

function Form({ jenis }: { jenis: 'masuk' | 'pulang' }) {
  const ctx = useGilir();
  const k = keadaanHariIni(ctx);
  const { dalam, lokasi } = useLokasiHariIni();
  const [bukti, setBukti] = useState<BuktiAbsen[]>([]);
  const [catatan, setCatatan] = useState('');
  const [selesai, setSelesai] = useState<number | null>(null);

  const sudah = jenis === 'masuk' ? k.rec?.masuk : k.rec?.pulang;
  const belumMasuk = jenis === 'pulang' && !k.rec?.masuk;

  if (selesai != null) return <Berhasil jenis={jenis} menit={selesai} />;

  if (k.langkah === 'libur' || k.langkah === 'cuti') {
    return (
      <Kartu nada="kunyit" style={{ gap: 8 }}>
        <Teks v="judul" tingkat={2}>{k.langkah === 'libur' ? 'Hari ini libur' : 'Hari ini kamu tidak dijadwalkan absen'}</Teks>
        <Teks>Kembali ke beranda untuk mensimulasikan hari kerja atau melihat status pengajuan.</Teks>
        <Tombol label="Ke beranda" ikon="kiri" onPress={() => router.replace('/')} />
      </Kartu>
    );
  }
  if (sudah || belumMasuk) {
    return (
      <Kartu style={{ gap: 8 }}>
        <Teks v="judul" tingkat={2}>{sudah ? `Sudah absen ${jenis} pukul ${jam(sudah.menit)}` : 'Absen masuk dulu'}</Teks>
        <Teks warna={W.tinta2}>{sudah ? 'Satu kali stempel per jenis setiap hari.' : 'Absen pulang terbuka setelah absen masuk.'}</Teks>
        <Tombol label="Ke beranda" ikon="kiri" onPress={() => router.replace('/')} />
      </Kartu>
    );
  }

  const sekarang = ctx.menit;
  let pratinjau: { teks: string; nada: string };
  if (jenis === 'masuk') {
    const n = nilaiMasuk(k.h.shift, sekarang);
    pratinjau =
      n.status === 'hadir'
        ? { teks: 'Tercatat tepat waktu', nada: '#9FD3A8' }
        : n.status === 'telat'
          ? { teks: `Tercatat telat ${durasi(n.telat)}`, nada: W.oranyeTerang }
          : { teks: 'Di luar jam shift: tercatat sebagai simulasi', nada: W.kunyit };
  } else {
    const sel = sekarang - k.sh.selesai;
    pratinjau =
      sel < 0
        ? { teks: `Pulang ${durasi(-sel)} lebih awal dari jadwal`, nada: W.oranyeTerang }
        : sel >= 30
          ? { teks: `Lewat ${durasi(sel)} dari jadwal pulang`, nada: W.kunyit }
          : { teks: 'Pulang sesuai jadwal', nada: '#9FD3A8' };
  }

  const kurang = !dalam ? 'Pastikan lokasi dalam radius gerai (atau pakai simulasi).' : bukti.length === 0 ? 'Pilih minimal satu bukti tugas.' : null;

  function stempel() {
    if (kurang) return;
    ctx.absen(jenis, { menit: sekarang, bukti, catatan: catatan.trim(), lokasi: lokasi?.sumber ?? 'simulasi', jarak: lokasi?.jarak });
    setSelesai(sekarang);
  }

  return (
    <>
      <Kartu nada="jelaga" lubang style={{ gap: 12 }} label="Waktu absen">
        <Teks v="label" warna={W.diJelaga2}>
          Shift {k.sh.nama} · {jam(k.sh.mulai)}–{jam(k.sh.selesai)}
        </Teks>
        <Jam siap />
        <View style={st.pratinjau} aria-live="polite">
          <View style={[st.titik, { backgroundColor: pratinjau.nada }]} />
          <Teks v="mono" warna={W.diJelaga}>{pratinjau.teks}</Teks>
        </View>
      </Kartu>

      <Kartu label="Lokasi">
        <LokasiPanel />
      </Kartu>

      <Kartu style={{ gap: 10 }} label="Bukti tugas">
        <Teks v="judul" tingkat={2}>{jenis === 'masuk' ? 'Tugas pembuka' : 'Tugas penutup'}</Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Tanpa swafoto. Gilir tidak memakai kamera; buktinya lokasi dan centang tugas yang sudah kamu kerjakan.
        </Teks>
        <View style={st.kisi}>
          {PILIHAN[jenis].map((p) => {
            const aktif = bukti.includes(p.id);
            return (
              <Pressable
                key={p.id}
                accessibilityRole="checkbox"
                aria-checked={aktif}
                accessibilityLabel={p.label}
                onPress={() => setBukti((b) => (aktif ? b.filter((x) => x !== p.id) : [...b, p.id]))}
                style={[st.pilihan, aktif && st.pilihanAktif]}
              >
                <IlustrasiBukti jenis={p.id} ukuran={40} />
                <Teks v="kecil" style={{ ...H.isiSedang, flex: 1 }}>{p.label}</Teks>
                <View style={[st.kotak, aktif && st.kotakAktif]} aria-hidden>
                  {aktif && <Ikon nama="centang" ukuran={16} warna={W.kertas} tebal={2.6} />}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Teks v="label" warna={W.tinta2} nativeID="label-catatan">Catatan untuk kepala gerai (opsional)</Teks>
        <TextInput
          value={catatan}
          onChangeText={setCatatan}
          maxLength={140}
          multiline
          placeholder={jenis === 'masuk' ? 'Misal: kiriman roti tawar kurang 5 bungkus' : 'Misal: mesin kasir 2 macet sore tadi'}
          placeholderTextColor="#6E6253"
          accessibilityLabelledBy="label-catatan"
          aria-labelledby="label-catatan"
          style={st.input}
        />
      </Kartu>

      <Tombol besar varian="stempel" ikon={jenis === 'masuk' ? 'masuk' : 'pulang'} label={`Stempel ${jenis}`} onPress={stempel} disabled={!!kurang} />
      {kurang && <Teks v="kecil" warna={W.stempelTua} style={{ textAlign: 'center' }}>{kurang}</Teks>}
    </>
  );
}

function Berhasil({ jenis, menit }: { jenis: 'masuk' | 'pulang'; menit: number }) {
  const ctx = useGilir();
  const k = keadaanHariIni(ctx);
  const lewat = jenis === 'pulang' ? menit - k.sh.selesai : 0;
  const lembur = lewat >= 30 ? Math.floor(lewat / 30) * 30 : 0;
  return (
    <Kartu style={{ gap: 14, alignItems: 'center', paddingVertical: 28 }} label="Absen berhasil">
      <Stempel teks={`${jenis} ${jam(menit)}`} sub="Gerai Kota · tercatat" miring={-6} />
      <Teks v="judul" tingkat={2} style={{ textAlign: 'center' }}>
        {jenis === 'masuk' ? 'Selamat bekerja!' : 'Terima kasih, hati-hati di jalan'}
      </Teks>
      <Teks warna={W.tinta2} style={{ textAlign: 'center' }}>
        {jenis === 'masuk'
          ? 'Kartu absen hari ini sudah distempel. Jangan lupa absen pulang.'
          : 'Kartu absen hari ini lengkap. Rekap bulanan ikut diperbarui.'}
      </Teks>
      {lembur > 0 && (
        <Tombol
          varian="garis"
          ikon="tambah"
          label={`Ajukan lembur ${jamDesimal(lembur)} jam`}
          onPress={() => router.replace(`/pengajuan/baru?jenis=lembur&menit=${lembur}`)}
          style={{ alignSelf: 'stretch' }}
        />
      )}
      <Tombol label="Kembali ke beranda" ikon="kiri" onPress={() => router.replace('/')} style={{ alignSelf: 'stretch' }} />
    </Kartu>
  );
}

const st = StyleSheet.create({
  pratinjau: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titik: { width: 10, height: 10, borderRadius: 5 },
  kisi: { gap: 8 },
  pilihan: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, borderWidth: 1.5, borderColor: W.garis,
    backgroundColor: W.kertas2, minHeight: 60,
  },
  pilihanAktif: { borderColor: W.tinta, backgroundColor: W.kunyitMuda },
  kotak: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  kotakAktif: { backgroundColor: W.tinta },
  input: {
    ...H.isi, fontSize: 15, minHeight: 72, borderWidth: 1.5, borderColor: W.garisTegas, borderRadius: 14, padding: 12,
    backgroundColor: '#FFFDF8', color: W.tinta, textAlignVertical: 'top',
  },
});
