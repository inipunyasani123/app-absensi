import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gerigi } from '@/components/Gerigi';
import { TombolTahan } from '@/components/TombolTahan';
import { useGerakDikurangi } from '@/lib/gerak';
import { getarBerhasil } from '@/lib/haptik';
import { Ikon } from '@/components/Ikon';
import { IlustrasiBukti } from '@/components/Ilustrasi';
import { Jam } from '@/components/Jam';
import { LokasiPanel, useLokasiHariIni } from '@/components/LokasiPanel';
import { Kartu, Kerangka, Layar, Stempel, Teks, Tombol } from '@/components/ui';
import { keadaanHariIni } from '@/lib/hariini';
import { meta } from '@/lib/meta';
import { router, useLocalSearchParams } from '@/lib/nav';
import { BuktiAbsen, CatatanAbsen, nilaiMasuk } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { durasi, jam, jamDesimal, tanggalPanjang } from '@/lib/waktu';
import { ATURAN, CABANG, ORANG, SAYA_ID } from '@/lib/data';
import { shiftBerikutnya } from '@/lib/hariini';
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
  const [selesai, setSelesai] = useState<CatatanAbsen | null>(null);

  const sudah = jenis === 'masuk' ? k.rec?.masuk : k.rec?.pulang;
  const belumMasuk = jenis === 'pulang' && !k.rec?.masuk;

  if (selesai != null) return <Berhasil jenis={jenis} c={selesai} />;

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
    const c: CatatanAbsen = { menit: sekarang, bukti, catatan: catatan.trim(), lokasi: lokasi?.sumber ?? 'simulasi', jarak: lokasi?.jarak };
    ctx.absen(jenis, c);
    setSelesai(c);
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

      <TombolTahan ikon={jenis === 'masuk' ? 'masuk' : 'pulang'} label={`Stempel ${jenis}`} onSelesai={stempel} disabled={!!kurang} />
      {kurang && <Teks v="kecil" warna={W.stempelTua} style={{ textAlign: 'center' }}>{kurang}</Teks>}
    </>
  );
}

function StempelJatuh({ teks, sub, warna }: { teks: string; sub: string; warna: string }) {
  const kurang = useGerakDikurangi();
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    getarBerhasil();
    if (kurang) {
      t.setValue(1);
      return;
    }
    Animated.timing(t, { toValue: 1, duration: 320, easing: Easing.out(Easing.back(1.6)), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [kurang, t]);
  return (
    <Animated.View
      style={{
        opacity: t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
        transform: [
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1.4, 1] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-16deg', '-6deg'] }) },
        ],
      }}
    >
      <View style={[st.capBesar, { borderColor: warna }]}>
        <Text style={[st.capTeks, { color: warna }]}>{teks}</Text>
        <Text style={[st.capSub, { color: warna }]}>{sub}</Text>
      </View>
    </Animated.View>
  );
}

/** Wilayah aria-live yang diisi sesaat setelah tampil agar pembaca layar mengumumkannya. */
function Umumkan({ teks }: { teks: string }) {
  const [isi, setIsi] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setIsi(teks), 150);
    return () => clearTimeout(t);
  }, [teks]);
  return (
    <Text style={st.sr} aria-live="assertive" accessibilityLiveRegion="assertive">
      {isi}
    </Text>
  );
}

function BarisStruk({ k, v, tebal }: { k: string; v: string; tebal?: boolean }) {
  return (
    <View style={st.strukBaris}>
      <Text style={st.strukK}>{k}</Text>
      <Text style={[st.strukV, tebal && { ...H.monoTebal }]}>{v}</Text>
    </View>
  );
}

function Berhasil({ jenis, c }: { jenis: 'masuk' | 'pulang'; c: CatatanAbsen }) {
  const ctx = useGilir();
  const k = keadaanHariIni(ctx);
  const sh = k.sh;
  const cabang = CABANG[ORANG[SAYA_ID].cabang];
  const lewat = jenis === 'pulang' ? c.menit - sh.selesai : 0;
  const lembur = lewat >= 30 ? Math.floor(lewat / 30) * 30 : 0;
  let status: string;
  let warna: string = W.hijau;
  if (jenis === 'masuk') {
    const n = nilaiMasuk(k.h.shift, c.menit);
    const awal = sh.mulai - c.menit;
    if (n.status === 'luar') {
      status = 'Di luar jam shift (simulasi)';
      warna = W.stempel;
    } else if (n.status === 'telat') {
      status = `Telat ${durasi(n.telat)}`;
      warna = W.stempel;
    } else status = awal > 0 ? `${durasi(awal)} lebih awal` : 'Tepat waktu';
  } else {
    status = lewat < 0 ? `Pulang ${durasi(-lewat)} lebih awal` : lewat >= 30 ? `Lewat ${durasi(lewat)} dari jadwal` : 'Sesuai jadwal';
    if (lewat < 0) warna = W.stempel;
  }
  const label = PILIHAN[jenis].filter((p) => c.bukti.includes(p.id)).map((p) => p.label);
  const ist = k.rec?.istirahat;
  const lamaIst = ist ? (ist.selesai ?? c.menit) - ist.mulai : 0;
  const totalKerja = jenis === 'pulang' && k.rec?.masuk ? c.menit - k.rec.masuk.menit - lamaIst : 0;
  const berikut = shiftBerikutnya(ctx.hariIni);
  return (
    <>
      <View style={st.hasilAtas}>
        <StempelJatuh teks={`${jenis} ${jam(c.menit)}`} sub={`${cabang.nama} · tercatat`} warna={warna} />
        <Teks v="judul" tingkat={2} style={{ textAlign: 'center', marginTop: 10 }}>
          {jenis === 'masuk' ? 'Selamat bekerja!' : 'Terima kasih, hati-hati di jalan'}
        </Teks>
        <Umumkan teks={`Absen ${jenis} tercatat pukul ${jam(c.menit)}. ${status}.`} />
      </View>

      <View {...({ role: 'region', 'aria-label': 'Struk absen' } as object)}>
        <Gerigi />
        <View style={st.struk}>
          <Text style={st.strukJudul}>GILIR · KARTU ABSEN</Text>
          <Text style={st.strukTgl}>{tanggalPanjang(ctx.hariIni).toUpperCase()}</Text>
          <View style={st.putus} />
          <BarisStruk k="Jenis" v={jenis === 'masuk' ? 'Masuk' : 'Pulang'} tebal />
          <BarisStruk k="Jam" v={`${jam(c.menit)} WIB`} tebal />
          <BarisStruk k="Jadwal" v={`Shift ${sh.nama} · ${jam(jenis === 'masuk' ? sh.mulai : sh.selesai)}`} />
          <BarisStruk k="Status" v={status} />
          <BarisStruk k="Lokasi" v={`${cabang.nama}${c.jarak != null ? ` · ${Math.round(c.jarak)} m` : ''}${c.lokasi === 'simulasi' ? ' (simulasi)' : ''}`} />
          {jenis === 'pulang' && totalKerja > 0 && <BarisStruk k="Total kerja" v={`${durasi(totalKerja)}${lamaIst ? ` · istirahat ${durasi(lamaIst)}` : ''}`} tebal />}
          <View style={st.putus} />
          <Text style={st.strukK}>{jenis === 'masuk' ? 'Tugas pembuka' : 'Tugas penutup'} ({label.length}/{PILIHAN[jenis].length})</Text>
          {label.map((l) => (
            <View key={l} style={st.tugas}>
              <Ikon nama="centang" ukuran={16} warna={W.hijau} tebal={2.6} />
              <Text style={st.tugasTeks}>{l}</Text>
            </View>
          ))}
          {c.catatan ? (
            <>
              <Text style={[st.strukK, { marginTop: 6 }]}>Catatan</Text>
              <Text style={st.tugasTeks}>“{c.catatan}”</Text>
            </>
          ) : null}
          <View style={st.putus} />
          <Text style={st.pengingat}>
            {jenis === 'masuk'
              ? `Absen pulang mulai ${jam(sh.selesai)} · toleransi telat ${ATURAN.toleransiTelat} menit sudah dihitung`
              : berikut
                ? `Shift berikutnya ${berikut.shift.nama} ${jam(berikut.shift.mulai)} · absen dibuka ${jam(berikut.shift.mulai - ATURAN.bukaAbsen)}`
                : 'Kartu absen hari ini lengkap'}
          </Text>
        </View>
        <Gerigi bawah />
      </View>

      {lembur > 0 && (
        <Tombol
          varian="garis"
          ikon="tambah"
          label={`Ajukan lembur ${jamDesimal(lembur)} jam`}
          onPress={() => router.replace(`/pengajuan/baru?jenis=lembur&menit=${lembur}`)}
        />
      )}
      <Tombol label="Kembali ke beranda" ikon="kiri" onPress={() => router.replace('/')} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Tombol varian="garis" ikon="kalender" label="Jadwal" keterangan="Lihat jadwal shift pekan ini" onPress={() => router.replace('/jadwal')} style={{ flex: 1 }} />
        <Tombol varian="garis" ikon="rekap" label="Rekap" keterangan="Lihat rekap bulan ini" onPress={() => router.replace('/rekap')} style={{ flex: 1 }} />
      </View>
    </>
  );
}

const st = StyleSheet.create({
  hasilAtas: { alignItems: 'center', paddingVertical: 18 },
  capBesar: { borderWidth: 4, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 8, alignItems: 'center', backgroundColor: 'rgba(252,246,228,0.6)' },
  capTeks: { ...H.monoTebal, fontSize: 30, letterSpacing: 3, textTransform: 'uppercase' },
  capSub: { ...H.monoTebal, fontSize: 13, letterSpacing: 1 },
  sr: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
  struk: { backgroundColor: '#FFFDF6', paddingHorizontal: 18, paddingVertical: 6, gap: 3 },
  strukJudul: { ...H.display, fontSize: 24, color: W.tinta, textAlign: 'center', letterSpacing: 1.5 },
  strukTgl: { ...H.monoTebal, fontSize: 12, color: W.tinta2, textAlign: 'center', letterSpacing: 0.8 },
  putus: { borderBottomWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTegas, marginVertical: 8 },
  strukBaris: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 2 },
  strukK: { ...H.monoTebal, fontSize: 12, color: W.tinta2, letterSpacing: 0.6, textTransform: 'uppercase' },
  strukV: { ...H.mono, fontSize: 13.5, color: W.tinta, textAlign: 'right', flexShrink: 1 },
  tugas: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  tugasTeks: { ...H.isi, fontSize: 14, color: W.tinta, flexShrink: 1 },
  pengingat: { ...H.isiTebal, fontSize: 13.5, color: W.tinta, textAlign: 'center' },
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
