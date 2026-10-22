import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { CatatanKertas, NotaKiriman, SuratDokter } from '@/components/Ilustrasi';
import { Kartu, Kerangka, Layar, Segmen, Teks, Tombol } from '@/components/ui';
import { JenisPengajuan, NAMA_JENIS, ORANG, Pengajuan, SAYA_ID, SHIFT } from '@/lib/data';
import { meta } from '@/lib/meta';
import { router, useLocalSearchParams } from '@/lib/nav';
import { hitungHariKerja, shiftHari, sisaCuti } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { HARI_PENDEK, durasi, hariDalamPekan, jam, jamDesimal, kunci, rentang, tambahHari } from '@/lib/waktu';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/pengajuan/baru', 'Ajukan Cuti, Izin, Sakit, atau Lembur · Gilir', 'Formulir pengajuan di demo Gilir: pilih jenis dan tanggal, hitung hari kerja otomatis, tulis alasan, dan kirim ke kepala gerai.');
}

const RENTANG: Record<JenisPengajuan, [number, number]> = {
  cuti: [3, 30],
  izin: [0, 21],
  sakit: [-3, 1],
  lembur: [-7, 0],
};

export default function Baru() {
  const { siap } = useGilir();
  return (
    <Layar kembali="/pengajuan" sub="Pengajuan baru" judul="Isi formulir">
      {siap ? <Form /> : <Kerangka tinggi={300} lebar="100%" />}
    </Layar>
  );
}

function Form() {
  const ctx = useGilir();
  const q = useLocalSearchParams<{ jenis?: string; menit?: string }>();
  const awalJenis = (['cuti', 'izin', 'sakit', 'lembur'] as const).find((j) => j === q.jenis) ?? 'cuti';
  const [jenis, setJenisAsli] = useState<JenisPengajuan>(awalJenis);
  const [mulai, setMulai] = useState<number>(awalJenis === 'lembur' ? 0 : RENTANG[awalJenis][0]);
  const [lama, setLama] = useState(1);
  const [menit, setMenit] = useState(() => {
    const m = Number(q.menit);
    return m >= 30 && m <= 240 ? m : 60;
  });
  const [alasan, setAlasan] = useState('');
  const [bukti, setBukti] = useState<NonNullable<Pengajuan['bukti']>>(awalJenis === 'sakit' ? 'surat-dokter' : awalJenis === 'lembur' ? 'foto-nota' : 'catatan');
  const [coba, setCoba] = useState(false);

  function setJenis(j: JenisPengajuan) {
    setJenisAsli(j);
    setMulai(j === 'lembur' ? 0 : RENTANG[j][0]);
    setLama(1);
    setBukti(j === 'sakit' ? 'surat-dokter' : j === 'lembur' ? 'foto-nota' : 'catatan');
  }

  const [a, b] = RENTANG[jenis];
  const opsi = useMemo(() => Array.from({ length: b - a + 1 }, (_, i) => tambahHari(ctx.hariIni, a + i)), [a, b, ctx.hariIni]);
  const tglMulai = tambahHari(ctx.hariIni, mulai);
  const tglSelesai = jenis === 'lembur' ? tglMulai : tambahHari(tglMulai, lama - 1);
  const hariKerja = jenis === 'lembur' ? 0 : hitungHariKerja(SAYA_ID, kunci(tglMulai), kunci(tglSelesai));
  const shiftLembur = shiftHari(SAYA_ID, tglMulai, ctx.simpanan);
  const cuti = sisaCuti(ctx);

  const bentrok = ctx.pengajuan.find(
    (p) =>
      p.orang === SAYA_ID && p.status !== 'ditolak' && (p.jenis === 'lembur') === (jenis === 'lembur') &&
      !(p.selesai < kunci(tglMulai) || p.mulai > kunci(tglSelesai)),
  );

  const galat: string[] = [];
  if (alasan.trim().length < 10) galat.push('Tulis alasan minimal 10 karakter.');
  if (jenis !== 'lembur' && hariKerja === 0) galat.push('Semua tanggal yang dipilih adalah hari libur shift.');
  if (jenis === 'cuti' && hariKerja > cuti.sisa - cuti.menunggu) galat.push(`Sisa cuti yang bisa diajukan ${Math.max(0, cuti.sisa - cuti.menunggu)} hari.`);
  if (jenis === 'sakit' && hariKerja > 1 && bukti !== 'surat-dokter') galat.push('Sakit lebih dari 1 hari wajib menyertakan surat dokter.');
  if (jenis === 'lembur' && shiftLembur === 'libur') galat.push('Hari itu kamu libur; lembur dihitung dari jam pulang shift.');
  if (bentrok) galat.push(`Bentrok dengan pengajuan ${NAMA_JENIS[bentrok.jenis].toLowerCase()} ${rentang(tglMulai, tglSelesai)}.`);

  function kirim() {
    setCoba(true);
    if (galat.length) return;
    const p = ctx.ajukan({
      jenis,
      mulai: kunci(tglMulai),
      selesai: kunci(tglSelesai),
      hari: jenis === 'lembur' ? undefined : hariKerja,
      lemburMenit: jenis === 'lembur' ? menit : undefined,
      jamMulai: jenis === 'lembur' ? SHIFT[shiftLembur].selesai : undefined,
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
        pilihan={(['cuti', 'izin', 'sakit', 'lembur'] as const).map((j) => ({ nilai: j, label: j === 'cuti' ? 'Cuti' : NAMA_JENIS[j] }))}
      />

      <Kartu style={{ gap: 10 }} label="Tanggal">
        <Teks v="judul" tingkat={2}>{jenis === 'lembur' ? 'Tanggal lembur' : 'Mulai tanggal'}</Teks>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          {...({ role: 'radiogroup', 'aria-label': jenis === 'lembur' ? 'Tanggal lembur' : 'Tanggal mulai' } as object)}
        >
          {opsi.map((t, i) => {
            const off = a + i;
            const aktif = off === mulai;
            const libur = shiftHari(SAYA_ID, t, ctx.simpanan) === 'libur';
            return (
              <Pressable
                key={kunci(t)}
                accessibilityRole="radio"
                aria-checked={aktif}
                accessibilityLabel={`${HARI_PENDEK[hariDalamPekan(t)]} ${t.d}${libur ? ', libur' : ''}`}
                onPress={() => setMulai(off)}
                style={[st.tgl, aktif && st.tglAktif]}
              >
                <Text style={[st.tglHari, aktif && { color: W.diJelaga2 }]}>{HARI_PENDEK[hariDalamPekan(t)]}</Text>
                <Text style={[st.tglAngka, aktif && { color: W.diJelaga }]}>{t.d}</Text>
                <Text style={[st.tglKet, aktif && { color: W.kunyit }]}>{off === 0 ? 'hari ini' : libur ? 'libur' : ' '}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {jenis === 'lembur' ? (
          <>
            <Teks v="label" warna={W.tinta2}>Durasi lembur</Teks>
            <Stepper
              label="Durasi lembur"
              nilai={`${jamDesimal(menit)} jam`}
              kurang={() => setMenit((m) => Math.max(30, m - 30))}
              tambah={() => setMenit((m) => Math.min(240, m + 30))}
            />
            <Teks v="kecil" warna={W.tinta2}>
              {shiftLembur === 'libur'
                ? 'Hari libur.'
                : `Mulai ${jam(SHIFT[shiftLembur].selesai)} setelah shift ${SHIFT[shiftLembur].nama}, selesai ${jam(SHIFT[shiftLembur].selesai + menit)}. Jam pertama dibayar 1,5×, berikutnya 2× upah per jam.`}
            </Teks>
          </>
        ) : (
          <>
            <Teks v="label" warna={W.tinta2}>Lama</Teks>
            <Stepper
              label="Lama dalam hari kalender"
              nilai={`${lama} hari`}
              kurang={() => setLama((l) => Math.max(1, l - 1))}
              tambah={() => setLama((l) => Math.min(jenis === 'sakit' ? 3 : 6, l + 1))}
            />
            <Teks v="kecil" warna={W.tinta2}>
              {rentang(tglMulai, tglSelesai)} = {hariKerja} hari kerja
              {lama - hariKerja > 0 ? ` (${lama - hariKerja} hari libur tidak dihitung)` : ''}
              {jenis === 'cuti' ? ` · sisa cuti setelah disetujui ${Math.max(0, cuti.sisa - hariKerja)} hari` : ''}
            </Teks>
          </>
        )}
      </Kartu>

      <Kartu style={{ gap: 10 }} label="Alasan dan bukti">
        <Teks v="judul" tingkat={2} nativeID="label-alasan">Alasan</Teks>
        <TextInput
          value={alasan}
          onChangeText={setAlasan}
          multiline
          maxLength={200}
          placeholder={
            jenis === 'cuti' ? 'Misal: pulang kampung, acara keluarga' : jenis === 'izin' ? 'Misal: mengurus dokumen di kecamatan' : jenis === 'sakit' ? 'Misal: demam, sudah periksa ke klinik' : 'Misal: bantu stok opname akhir bulan'
          }
          placeholderTextColor="#6E6253"
          aria-labelledby="label-alasan"
          accessibilityLabelledBy="label-alasan"
          style={st.input}
        />
        <Teks v="label" warna={W.tinta2}>Bukti (ilustrasi, tanpa unggah foto)</Teks>
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
      </Kartu>

      <View style={st.ringkas}>
        <Ikon nama="tameng" warna={W.ungu} />
        <Teks v="kecil" warna={W.ungu} style={{ flex: 1 }}>
          Dikirim ke {ORANG.bayu.nama} ({ORANG.bayu.jabatan}). Statusnya bisa kamu pantau di tab Ajukan.
        </Teks>
      </View>
      {coba && galat.length > 0 && (
        <View style={st.galat} aria-live="assertive">
          {galat.map((g) => (
            <Teks key={g} v="kecil" warna={W.stempelTua}>• {g}</Teks>
          ))}
        </View>
      )}
      <Tombol besar varian="stempel" ikon="centang" label={`Kirim ${jenis === 'cuti' ? 'cuti' : NAMA_JENIS[jenis].toLowerCase()}`} onPress={kirim} />
      {jenis === 'lembur' && <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center' }}>Lembur {durasi(menit)} tercatat setelah disetujui.</Teks>}
    </>
  );
}

function Stepper({ label, nilai, kurang, tambah }: { label: string; nilai: string; kurang: () => void; tambah: () => void }) {
  return (
    <View style={st.stepper} accessibilityLabel={label}>
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
  tgl: { width: 58, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, borderColor: W.garis, alignItems: 'center', backgroundColor: W.kertas2 },
  tglAktif: { backgroundColor: W.jelaga, borderColor: W.jelaga },
  tglHari: { ...H.monoTebal, fontSize: 11, letterSpacing: 1, color: W.tinta2, textTransform: 'uppercase' },
  tglAngka: { ...H.display, fontSize: 26, lineHeight: 30, color: W.tinta },
  tglKet: { ...H.mono, fontSize: 10, color: W.tinta2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepTombol: { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  stepTanda: { ...H.isiTebal, fontSize: 24, color: W.tinta, lineHeight: 28 },
  stepNilai: { ...H.display, fontSize: 28, color: W.tinta, minWidth: 100, textAlign: 'center' },
  input: {
    ...H.isi, fontSize: 15, minHeight: 88, borderWidth: 1.5, borderColor: W.garisTegas, borderRadius: 14, padding: 12,
    backgroundColor: '#FFFDF8', color: W.tinta, textAlignVertical: 'top',
  },
  bukti: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: W.kertas2, borderRadius: 14, padding: 10 },
  ringkas: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: W.unguMuda, borderRadius: 16, padding: 12 },
  galat: { backgroundColor: W.stempelMuda, borderRadius: 14, padding: 12, gap: 4 },
});
