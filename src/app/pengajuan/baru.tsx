import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { Avatar, CatatanKertas, NotaKiriman, SuratDokter } from '@/components/Ilustrasi';
import { Kartu, Kerangka, Layar, Segmen, Teks, Tombol } from '@/components/ui';
import { JenisPengajuan, NAMA_JENIS, ORANG, Pengajuan, SAYA_ID, SHIFT, TIM_KOTA } from '@/lib/data';
import { meta } from '@/lib/meta';
import { router, useLocalSearchParams } from '@/lib/nav';
import { hitungHariKerja, shiftHari, sisaCuti } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import {
  HARI_PENDEK, NAMA_HARI, awalPekan, durasi, hariDalamPekan, jam, jamDesimal, kunci, nomorHari, rentang, tambahHari, tanggalPendek,
} from '@/lib/waktu';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/pengajuan/baru', 'Ajukan Cuti, Izin, Lembur, atau Tukar Shift · Gilir', 'Formulir pengajuan di demo Gilir: pilih jenis dan tanggal, hari kerja dihitung otomatis, tulis alasan, lalu kirim ke kepala gerai.');
}

// Rentang tanggal yang boleh dipilih (selisih hari dari hari ini).
const RENTANG: Record<JenisPengajuan, [number, number]> = {
  cuti: [3, 60],
  izin: [0, 60],
  sakit: [-3, 1],
  lembur: [-7, 0],
  tukar: [1, 21],
};

const JENIS: JenisPengajuan[] = ['cuti', 'izin', 'sakit', 'lembur', 'tukar'];

export default function Baru() {
  const { siap } = useGilir();
  return (
    <Layar kembali="/pengajuan" sub="Pengajuan baru" judul="Isi formulir">
      <Teks v="isi" warna={W.tinta2}>
        Pilih jenis dan tanggal. Hari libur shift tidak memotong cuti, dan pengajuanmu langsung masuk antrean kepala gerai untuk disetujui.
      </Teks>
      {siap ? <Form /> : <Kerangka tinggi={300} lebar="100%" />}
    </Layar>
  );
}

function Form() {
  const ctx = useGilir();
  const q = useLocalSearchParams<{ jenis?: string; menit?: string; rekan?: string; tanggal?: string }>();
  const awalJenis = JENIS.find((j) => j === q.jenis) ?? 'cuti';

  // Hari kerja Sekar terdekat di dalam rentang: maju untuk pengajuan ke depan, mundur untuk lembur.
  const bawaan = (j: JenisPengajuan) => {
    const [a, b] = RENTANG[j];
    const urutan = j === 'lembur' ? Array.from({ length: b - a + 1 }, (_, i) => b - i) : Array.from({ length: b - a + 1 }, (_, i) => a + i);
    for (const off of urutan) {
      if (shiftHari(SAYA_ID, tambahHari(ctx.hariIni, off), ctx.simpanan, ctx.pengajuan) !== 'libur') return off;
    }
    return j === 'lembur' ? b : a;
  };

  const awalTanggal = (() => {
    if (!q.tanggal) return bawaan(awalJenis);
    const [y, m, d] = q.tanggal.split('-').map(Number);
    const off = nomorHari({ y, m, d }) - nomorHari(ctx.hariIni);
    const [a, b] = RENTANG[awalJenis];
    return off >= a && off <= b ? off : bawaan(awalJenis);
  })();

  const [jenis, setJenisAsli] = useState<JenisPengajuan>(awalJenis);
  const [mulai, setMulai] = useState<number>(awalTanggal);
  const [lama, setLama] = useState(1);
  const [menit, setMenit] = useState(() => {
    const m = Number(q.menit);
    return m >= 30 && m <= 240 ? m : 60;
  });
  const [rekan, setRekan] = useState<string | null>(q.rekan && ORANG[q.rekan] ? q.rekan : null);
  const [alasan, setAlasan] = useState('');
  const [bukti, setBukti] = useState<NonNullable<Pengajuan['bukti']>>(awalJenis === 'sakit' ? 'surat-dokter' : awalJenis === 'lembur' ? 'foto-nota' : 'catatan');
  const [coba, setCoba] = useState(false);

  function setJenis(j: JenisPengajuan) {
    setJenisAsli(j);
    setMulai(bawaan(j));
    setLama(1);
    setBukti(j === 'sakit' ? 'surat-dokter' : j === 'lembur' ? 'foto-nota' : 'catatan');
  }

  const tglMulai = tambahHari(ctx.hariIni, mulai);
  const tglSelesai = jenis === 'lembur' || jenis === 'tukar' ? tglMulai : tambahHari(tglMulai, lama - 1);
  const hariKerja = jenis === 'lembur' || jenis === 'tukar' ? 0 : hitungHariKerja(SAYA_ID, kunci(tglMulai), kunci(tglSelesai));
  const shiftSaya = shiftHari(SAYA_ID, tglMulai, ctx.simpanan, ctx.pengajuan);
  const cuti = sisaCuti(ctx);
  const bisaCuti = Math.max(0, cuti.sisa - cuti.menunggu);
  const shiftRekan = rekan ? shiftHari(rekan, tglMulai, ctx.simpanan, ctx.pengajuan) : null;

  const bentrok = ctx.pengajuan.find(
    (p) =>
      p.orang === SAYA_ID && p.status !== 'ditolak' && (p.jenis === 'lembur') === (jenis === 'lembur') && (p.jenis === 'tukar') === (jenis === 'tukar') &&
      !(p.selesai < kunci(tglMulai) || p.mulai > kunci(tglSelesai)),
  );

  const galat: string[] = [];
  if (alasan.trim().length < 10) galat.push('Tulis alasan minimal 10 karakter.');
  if ((jenis === 'cuti' || jenis === 'izin' || jenis === 'sakit') && hariKerja === 0) galat.push('Semua tanggal yang dipilih adalah hari libur shift.');
  if (jenis === 'cuti' && hariKerja > bisaCuti) galat.push(`Sisa cuti yang bisa diajukan ${bisaCuti} hari.`);
  if (jenis === 'sakit' && hariKerja > 1 && bukti !== 'surat-dokter') galat.push('Sakit lebih dari 1 hari wajib menyertakan surat dokter.');
  if (jenis === 'lembur' && shiftSaya === 'libur') galat.push('Hari itu kamu libur; lembur dihitung dari jam pulang shift.');
  if (jenis === 'tukar' && !rekan) galat.push('Pilih rekan yang mau bertukar shift.');
  if (jenis === 'tukar' && rekan && shiftRekan === shiftSaya) galat.push('Shift rekan sama dengan shiftmu di tanggal itu.');
  if (bentrok) galat.push(`Bentrok dengan pengajuan ${NAMA_JENIS[bentrok.jenis].toLowerCase()} ${rentang(tglMulai, tglSelesai)}.`);

  const ringkas =
    jenis === 'lembur'
      ? shiftSaya === 'libur'
        ? 'Hari libur: pilih tanggal kamu bekerja.'
        : `Lembur ${jamDesimal(menit)} jam, ${jam(SHIFT[shiftSaya].selesai)}–${jam(SHIFT[shiftSaya].selesai + menit)} setelah shift ${SHIFT[shiftSaya].nama}`
      : jenis === 'tukar'
        ? rekan
          ? `Kamu ${SHIFT[shiftSaya].nama} ⇄ ${ORANG[rekan].panggilan} ${SHIFT[shiftRekan ?? 'libur'].nama} pada ${NAMA_HARI[hariDalamPekan(tglMulai)]} ${tanggalPendek(tglMulai)}`
          : `${NAMA_HARI[hariDalamPekan(tglMulai)]} ${tanggalPendek(tglMulai)}: kamu ${SHIFT[shiftSaya].nama}. Pilih rekan di bawah.`
        : `${rentang(tglMulai, tglSelesai)} · ${hariKerja} hari kerja${lama - hariKerja > 0 ? ` (${lama - hariKerja} hari libur tidak dihitung)` : ''}${
            jenis === 'cuti' ? ` · sisa cuti setelah disetujui ${Math.max(0, cuti.sisa - hariKerja)} hari` : ''
          }`;

  function kirim() {
    setCoba(true);
    if (galat.length) return;
    const p = ctx.ajukan({
      jenis,
      mulai: kunci(tglMulai),
      selesai: kunci(tglSelesai),
      hari: jenis === 'lembur' ? undefined : jenis === 'tukar' ? 1 : hariKerja,
      lemburMenit: jenis === 'lembur' ? menit : undefined,
      jamMulai: jenis === 'lembur' ? SHIFT[shiftSaya].selesai : undefined,
      rekan: jenis === 'tukar' ? rekan ?? undefined : undefined,
      alasan: alasan.trim(),
      bukti,
    });
    router.replace(`/pengajuan?terkirim=${p.id}`);
  }

  return (
    <>
      <Teks v="label" warna={W.tinta2}>Jenis pengajuan</Teks>
      <Segmen
        label="Jenis pengajuan"
        nilai={jenis}
        ubah={setJenis}
        pilihan={JENIS.map((j) => ({ nilai: j, label: j === 'cuti' ? 'Cuti' : j === 'tukar' ? 'Tukar' : NAMA_JENIS[j] }))}
      />

      <Kartu style={{ gap: 10 }} label="Tanggal">
        <Teks v="judul" tingkat={2}>{jenis === 'lembur' ? 'Tanggal lembur' : jenis === 'tukar' ? 'Tanggal tukar' : 'Mulai tanggal'}</Teks>
        <KalenderPekan key={jenis} rentangOff={RENTANG[jenis]} pilih={mulai} ubah={setMulai} />

        {jenis === 'lembur' ? (
          <>
            <Teks v="label" warna={W.tinta2}>Durasi lembur</Teks>
            <Stepper label="Durasi lembur" nilai={`${jamDesimal(menit)} jam`} kurang={() => setMenit((m) => Math.max(30, m - 30))} tambah={() => setMenit((m) => Math.min(240, m + 30))} />
          </>
        ) : jenis === 'tukar' ? null : (
          <>
            <Teks v="label" warna={W.tinta2}>Lama</Teks>
            <Stepper label="Lama dalam hari kalender" nilai={`${lama} hari`} kurang={() => setLama((l) => Math.max(1, l - 1))} tambah={() => setLama((l) => Math.min(jenis === 'sakit' ? 3 : 7, l + 1))} />
          </>
        )}
        <View style={st.ringkas} aria-live="polite">
          <Ikon nama="info" ukuran={18} warna={W.tinta} />
          <Teks v="kecil" style={{ flex: 1, ...H.isiSedang }}>{ringkas}</Teks>
        </View>
      </Kartu>

      {jenis === 'tukar' && (
        <Kartu style={{ gap: 8 }} label="Pilih rekan">
          <Teks v="judul" tingkat={2}>Tukar dengan</Teks>
          <View accessibilityRole="radiogroup" accessibilityLabel="Rekan untuk tukar shift" style={{ gap: 8 }}>
            {TIM_KOTA.filter((id) => id !== SAYA_ID && id !== 'bayu').map((id) => {
              const sr = shiftHari(id, tglMulai, ctx.simpanan, ctx.pengajuan);
              const samaShift = sr === shiftSaya;
              const aktif = rekan === id;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="radio"
                  aria-checked={aktif}
                  accessibilityState={{ disabled: samaShift }}
                  disabled={samaShift}
                  accessibilityLabel={`${ORANG[id].nama}, ${sr === 'libur' ? 'libur' : `shift ${SHIFT[sr].nama}`}${samaShift ? ', shift sama' : ''}`}
                  onPress={() => setRekan(id)}
                  style={[st.rekan, aktif && st.rekanAktif, samaShift && { opacity: 0.5 }]}
                >
                  <Avatar rupa={ORANG[id].rupa} ukuran={40} />
                  <View style={{ flex: 1 }}>
                    <Teks v="subjudul" style={{ fontSize: 15 }}>{ORANG[id].nama}</Teks>
                    <Teks v="kecil" warna={W.tinta2}>{sr === 'libur' ? 'Libur hari itu' : `${SHIFT[sr].nama} ${jam(SHIFT[sr].mulai)}–${jam(SHIFT[sr].selesai)}`}{samaShift ? ' · shift sama' : ''}</Teks>
                  </View>
                  <View style={[st.bulat, aktif && st.bulatAktif]} aria-hidden />
                </Pressable>
              );
            })}
          </View>
        </Kartu>
      )}

      <Kartu style={{ gap: 10 }} label="Alasan dan bukti">
        <Teks v="judul" tingkat={2} nativeID="label-alasan">Alasan</Teks>
        <TextInput
          value={alasan}
          onChangeText={setAlasan}
          multiline
          maxLength={200}
          placeholder={
            jenis === 'cuti' ? 'Misal: pulang kampung, acara keluarga'
              : jenis === 'izin' ? 'Misal: mengurus dokumen di kecamatan'
                : jenis === 'sakit' ? 'Misal: demam, sudah periksa ke klinik'
                  : jenis === 'tukar' ? 'Misal: ada kuliah sore, sudah sepakat dengan rekan'
                    : 'Misal: bantu stok opname akhir bulan'
          }
          placeholderTextColor="#6E6253"
          aria-labelledby="label-alasan"
          accessibilityLabelledBy="label-alasan"
          style={st.input}
        />
        {jenis !== 'tukar' && <Teks v="label" warna={W.tinta2}>Bukti (ilustrasi, tanpa unggah foto)</Teks>}
        {(jenis === 'sakit' || jenis === 'lembur') && (
          <Segmen
            label="Jenis bukti"
            nilai={bukti}
            ubah={setBukti}
            pilihan={[
              jenis === 'lembur' ? { nilai: 'foto-nota', label: 'Nota barang' } : { nilai: 'surat-dokter', label: 'Surat dokter' },
              { nilai: 'catatan', label: 'Catatan saja' },
            ]}
          />
        )}
        {jenis !== 'tukar' && (
          <View style={st.bukti}>
            {bukti === 'surat-dokter' ? <SuratDokter /> : bukti === 'foto-nota' ? <NotaKiriman /> : <CatatanKertas />}
            <Teks v="kecil" warna={W.tinta2} style={{ flex: 1 }}>
              {bukti === 'surat-dokter'
                ? 'Di aplikasi asli, surat dokter difoto lalu dilampirkan. Di demo cukup ditandai.'
                : bukti === 'foto-nota'
                  ? 'Nota penerimaan barang atau daftar stok sebagai bukti pekerjaan lembur.'
                  : 'Alasan di atas menjadi catatan untuk kepala gerai.'}
            </Teks>
          </View>
        )}
      </Kartu>

      <View style={st.kirimKe}>
        <Ikon nama="tameng" warna={W.ungu} />
        <Teks v="kecil" warna={W.ungu} style={{ flex: 1 }}>
          Dikirim ke {ORANG.bayu.nama} ({ORANG.bayu.jabatan}). {jenis === 'tukar' ? 'Setelah disetujui, jadwal kalian berdua langsung bertukar.' : 'Statusnya bisa kamu pantau di tab Ajukan.'}
        </Teks>
      </View>
      {coba && galat.length > 0 && (
        <View style={st.galat} aria-live="assertive">
          {galat.map((g) => (
            <Teks key={g} v="kecil" warna={W.stempelTua}>• {g}</Teks>
          ))}
        </View>
      )}
      <Tombol besar varian="stempel" ikon="centang" label={`Kirim ${jenis === 'cuti' ? 'cuti' : jenis === 'tukar' ? 'tukar shift' : NAMA_JENIS[jenis].toLowerCase()}`} onPress={kirim} />
      {jenis === 'lembur' && <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center' }}>Lembur {durasi(menit)} masuk slip setelah disetujui.</Teks>}
    </>
  );
}

/** Kalender per pekan (Sen–Min) yang bisa digeser; tanggal di luar rentang dinonaktifkan. */
function KalenderPekan({ rentangOff, pilih, ubah }: { rentangOff: [number, number]; pilih: number; ubah: (off: number) => void }) {
  const ctx = useGilir();
  const [a, b] = rentangOff;
  const seninIni = awalPekan(ctx.hariIni);
  const pekanDari = (off: number) => Math.floor((nomorHari(tambahHari(ctx.hariIni, off)) - nomorHari(seninIni)) / 7);
  const [pekan, setPekan] = useState(() => pekanDari(pilih));
  const minP = pekanDari(a);
  const maksP = pekanDari(b);
  const senin = tambahHari(seninIni, pekan * 7);
  const hari = useMemo(() => Array.from({ length: 7 }, (_, i) => tambahHari(senin, i)), [senin.y, senin.m, senin.d]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={{ gap: 8 }}>
      <View style={st.kalNav}>
        <Pressable accessibilityRole="button" accessibilityLabel="Pekan sebelumnya" disabled={pekan <= minP} onPress={() => setPekan((p) => p - 1)} style={[st.navTombol, pekan <= minP && { opacity: 0.35 }]}>
          <Ikon nama="kiri" />
        </Pressable>
        <Text style={st.kalJudul} aria-live="polite">{rentang(hari[0], hari[6])}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Pekan berikutnya" disabled={pekan >= maksP} onPress={() => setPekan((p) => p + 1)} style={[st.navTombol, pekan >= maksP && { opacity: 0.35 }]}>
          <Ikon nama="kanan" />
        </Pressable>
      </View>
      <View style={st.kalBaris} accessibilityRole="radiogroup" accessibilityLabel="Pilih tanggal">
        {hari.map((t, i) => {
          const off = nomorHari(t) - nomorHari(ctx.hariIni);
          const diLuar = off < a || off > b;
          const libur = shiftHari(SAYA_ID, t, ctx.simpanan, ctx.pengajuan) === 'libur';
          const aktif = off === pilih;
          return (
            <Pressable
              key={kunci(t)}
              accessibilityRole="radio"
              aria-checked={aktif}
              accessibilityState={{ disabled: diLuar }}
              accessibilityLabel={`${NAMA_HARI[i]} ${t.d}${off === 0 ? ', hari ini' : ''}${libur ? ', libur' : ''}${diLuar ? ', tidak tersedia' : ''}`}
              disabled={diLuar}
              onPress={() => ubah(off)}
              style={[st.sel, aktif && st.selAktif, diLuar && st.selMati, libur && !aktif && st.selLibur]}
            >
              <Text style={[st.selHari, aktif && { color: W.diJelaga2 }]}>{HARI_PENDEK[i]}</Text>
              <Text style={[st.selTgl, aktif && { color: W.diJelaga }, diLuar && { color: W.tinta2 }]}>{t.d}</Text>
              <Text style={[st.selKet, aktif && { color: W.kunyit }]}>{off === 0 ? 'kini' : libur ? 'libur' : ' '}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Stepper({ label, nilai, kurang, tambah }: { label: string; nilai: string; kurang: () => void; tambah: () => void }) {
  return (
    <View style={st.stepper}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Kurangi ${label.toLowerCase()}`} onPress={kurang} style={st.stepTombol}>
        <Text style={st.stepTanda}>−</Text>
      </Pressable>
      <Text style={st.stepNilai} aria-live="polite">{nilai}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Tambah ${label.toLowerCase()}`} onPress={tambah} style={st.stepTombol}>
        <Text style={st.stepTanda}>+</Text>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  kalNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kalJudul: { flex: 1, textAlign: 'center', ...H.display, fontSize: 24, color: W.tinta },
  navTombol: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  kalBaris: { flexDirection: 'row', gap: 4 },
  sel: { flex: 1, minHeight: 62, borderRadius: 12, borderWidth: 1.5, borderColor: W.garis, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kertas2 },
  selAktif: { backgroundColor: W.jelaga, borderColor: W.jelaga },
  selMati: { backgroundColor: 'transparent', borderStyle: 'dashed', opacity: 0.55 },
  selLibur: { backgroundColor: W.manila },
  selHari: { ...H.monoTebal, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  selTgl: { ...H.display, fontSize: 26, lineHeight: 28, color: W.tinta },
  selKet: { ...H.mono, fontSize: 12, color: W.tinta2 },
  ringkas: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: W.kunyitMuda, borderRadius: 12, padding: 10 },
  rekan: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.kertas2, minHeight: 60 },
  rekanAktif: { borderColor: W.tinta, backgroundColor: W.kunyitMuda },
  bulat: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: W.tinta },
  bulatAktif: { borderWidth: 7 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepTombol: { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  stepTanda: { ...H.isiTebal, fontSize: 24, color: W.tinta, lineHeight: 28 },
  stepNilai: { ...H.display, fontSize: 30, color: W.tinta, minWidth: 100, textAlign: 'center' },
  input: {
    ...H.isi, fontSize: 15, minHeight: 88, borderWidth: 1.5, borderColor: W.garisTegas, borderRadius: 14, padding: 12,
    backgroundColor: '#FFFDF6', color: W.tinta, textAlignVertical: 'top',
  },
  bukti: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: W.kertas2, borderRadius: 14, padding: 10 },
  kirimKe: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: W.unguMuda, borderRadius: 16, padding: 12 },
  galat: { backgroundColor: W.stempelMuda, borderRadius: 14, padding: 12, gap: 4 },
});
