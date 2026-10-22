import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from '@/lib/nav';
import { Ikon } from '@/components/Ikon';
import { Avatar } from '@/components/Ilustrasi';
import { Jam } from '@/components/Jam';
import { KartuPekan } from '@/components/KartuPekan';
import { LokasiPanel } from '@/components/LokasiPanel';
import { Chip, Kartu, Layar, Stempel, Tautan, Teks, Tombol } from '@/components/ui';
import { CABANG, ORANG, SAYA_ID, daftarPengumuman } from '@/lib/data';
import { keadaanHariIni, shiftBerikutnya, shiftPekanIni } from '@/lib/hariini';
import { meta } from '@/lib/meta';
import { rekapBulan, sisaCuti } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { NAMA_BULAN, NAMA_HARI, durasi, geserBulan, hariDalamPekan, jam, jamDesimal, tanggalPanjang } from '@/lib/waktu';
import { W } from '@/theme';

export function generateMetadata() {
  return meta(
    '/',
    'Gilir: Demo Aplikasi Absensi & HR Karyawan | PintuWeb',
    'Coba demo aplikasi absensi karyawan: absen dengan cek radius gerai, jadwal shift, cuti, lembur, rekap kehadiran, dan slip gaji. Android, iOS, web.',
  );
}

const saya = ORANG[SAYA_ID];

export default function Beranda() {
  const ctx = useGilir();
  const { siap } = ctx;
  return (
    <Layar
      tab
      sub={siap ? tanggalPanjang(ctx.hariIni) : 'Roti Lintang Pagi'}
      judul={`Halo, ${saya.panggilan}`}
      kanan={<KepalaKanan />}
    >
      <Isi />
    </Layar>
  );
}

function KepalaKanan() {
  const { siap, simpanan, hariIni } = useGilir();
  const belum = siap ? daftarPengumuman(hariIni, '').filter((p) => !simpanan.dibaca.includes(p.id)).length : 0;
  return (
    <View style={st.kepalaKanan}>
      <Tautan href="/pengumuman" label={`Pengumuman HR${belum ? `, ${belum} belum dibaca` : ''}`} style={st.ikonBulat}>
        <Ikon nama="lonceng" />
        {belum ? (
          <View style={st.lencana} aria-hidden>
            <Teks v="monoKecil" warna="#FFF8EE" style={{ fontSize: 10.5, lineHeight: 14 }}>{belum}</Teks>
          </View>
        ) : null}
      </Tautan>
      <Tautan href="/profil" label="Profil karyawan" style={st.avatarTombol}>
        <Avatar rupa={saya.rupa} ukuran={44} />
      </Tautan>
    </View>
  );
}

// Kerangka halaman sama di HTML statis dan setelah data siap; hanya nilai yang bergantung tanggal yang menyusul.
function Isi() {
  const ctx = useGilir();
  const { siap } = ctx;
  const k = siap ? keadaanHariIni(ctx) : null;
  const cabang = CABANG[saya.cabang];
  const rekap = useMemo(() => (siap ? rekapBulan(SAYA_ID, ctx.hariIni.y, ctx.hariIni.m, ctx) : null), [ctx, siap]);
  const cuti = siap ? sisaCuti(ctx) : null;
  const pengumuman = siap ? daftarPengumuman(ctx.hariIni, NAMA_BULAN[geserBulan(ctx.hariIni.y, ctx.hariIni.m, -1).m - 1])[0] : null;
  const bulan = siap ? NAMA_BULAN[ctx.hariIni.m - 1] : '';
  const telatBanyak = (rekap?.telat ?? 0) > 2;

  return (
    <>
      {/* Ubin jam & shift */}
      <Kartu nada="jelaga" lubang style={{ gap: 12 }} label="Jam dan shift hari ini">
        <View style={st.barisAntara}>
          <Chip nada="kunyit" teks={!k ? 'Shift hari ini' : k.h.shift === 'libur' ? 'Libur' : `Shift ${k.sh.nama}`} />
          <Teks v="monoKecil" warna={W.diJelaga2}>{cabang.nama.toUpperCase()}</Teks>
        </View>
        <Jam siap={siap} />
        <Teks v="mono" warna={W.diJelaga}>
          {!k
            ? 'Memuat jadwal shift…'
            : k.h.shift !== 'libur'
              ? `${jam(k.sh.mulai)}–${jam(k.sh.selesai)} · absen dibuka ${jam(k.buka)}${k.simulasi ? ' · simulasi' : ''}`
              : 'Tidak ada shift hari ini'}
        </Teks>
        {k && (k.rec?.masuk || k.rec?.pulang) && (
          <View style={st.stempelBaris}>
            {k.rec?.masuk && (
              <Stempel
                teks={`Masuk ${jam(k.rec.masuk.menit)}`}
                sub={k.masuk?.status === 'telat' ? `telat ${k.masuk.telat} mnt` : k.masuk?.status === 'luar' ? 'di luar jam shift' : 'tepat waktu'}
                warna={k.masuk?.status === 'telat' ? W.oranyeTerang : '#9FD3A8'}
                miring={-5}
              />
            )}
            {k.rec?.pulang && <Stempel teks={`Pulang ${jam(k.rec.pulang.menit)}`} warna={W.kunyit} miring={3} />}
          </View>
        )}
      </Kartu>

      {/* Aksi utama */}
      {!k ? (
        <AksiTombol label="Absen" ikon="masuk" keterangan="Menyiapkan kartu absenmu…" />
      ) : k.langkah === 'masuk' || k.langkah === 'pulang' ? (
        <AksiTombol {...propsAksi(k, ctx.menit)} />
      ) : (
        <Aksi k={k} />
      )}

      {/* Lokasi */}
      {(!k || k.langkah === 'masuk' || k.langkah === 'pulang') && (
        <Kartu label="Lokasi terhadap gerai">
          <LokasiPanel ringkas />
        </Kartu>
      )}

      {/* Bento angka */}
      <View style={st.bento}>
        <Tautan
          href="/pengajuan"
          style={[st.ubin, st.ubinCuti]}
        >
          <Teks v="label">Sisa cuti</Teks>
          <Teks v="raksasa" style={{ marginTop: 6 }}>{cuti ? cuti.sisa : '–'}</Teks>
          <Teks v="kecil">dari {cuti?.jatah ?? 12} hari{cuti?.menunggu ? ` · ${cuti.menunggu} menunggu` : ''}</Teks>
          <View style={st.petak} aria-hidden>
            {Array.from({ length: cuti?.jatah ?? 12 }, (_, i) => (
              <View
                key={i}
                style={[
                  st.petakItem,
                  cuti && i < cuti.terpakai && { backgroundColor: W.tinta },
                  cuti && i >= cuti.terpakai && i < cuti.terpakai + cuti.menunggu && { backgroundColor: W.stempel },
                ]}
              />
            ))}
          </View>
        </Tautan>
        <View style={{ flex: 1, gap: 10 }}>
          <Tautan
            href="/rekap"
            style={[st.ubin, st.ubinKertas]}
          >
            <Teks v="label" warna={W.tinta2}>Lembur {bulan ? bulan.slice(0, 3) : 'bulan ini'}</Teks>
            <Teks v="angka">{rekap ? jamDesimal(rekap.lemburMenit) : '–'}<Teks v="subjudul"> jam</Teks></Teks>
            {rekap?.lemburMenunggu ? (
              <Teks v="kecil" warna={W.stempelTua}>+{jamDesimal(rekap.lemburMenunggu)} jam menunggu</Teks>
            ) : (
              <Teks v="kecil" warna={W.tinta2}>disetujui</Teks>
            )}
          </Tautan>
          <Tautan
            href="/rekap"
            style={[st.ubin, telatBanyak ? st.ubinMerah : st.ubinHijau]}
          >
            <Teks v="label" warna={telatBanyak ? W.stempelTua : W.hijauTua}>Telat bulan ini</Teks>
            <Teks v="angka" warna={telatBanyak ? W.stempelTua : W.hijauTua}>{rekap ? `${rekap.telat}×` : '–'}</Teks>
            <Teks v="kecil" warna={telatBanyak ? W.stempelTua : W.hijauTua}>
              {!rekap ? 'tunjangan kehadiran' : telatBanyak ? 'tunjangan kehadiran gugur' : 'tunjangan kehadiran aman'}
            </Teks>
          </Tautan>
        </View>
      </View>

      {siap && <KartuPekan />}

      {/* Mode atasan */}
      <Tautan
        href="/atasan"
        style={st.atasan}
      >
        <Avatar rupa={ORANG.bayu.rupa} ukuran={46} />
        <View style={{ flex: 1 }}>
          <Teks v="label" warna={W.ungu}>Mode atasan</Teks>
          <Teks v="subjudul">Coba sebagai {ORANG.bayu.nama}</Teks>
          <Teks v="kecil" warna={W.tinta2}>{siap ? `${ctx.menunggu.length} pengajuan tim menunggu keputusan` : 'Setujui cuti, izin, dan lembur tim'}</Teks>
        </View>
        <Ikon nama="kanan" warna={W.ungu} />
      </Tautan>

      {/* Pengumuman */}
      {pengumuman && (
        <Tautan href={`/pengumuman/${pengumuman.id}`} style={st.pengumuman}>
          <View style={st.barisAntara}>
            <Teks v="label" warna={W.stempel}>Pengumuman HR · {pengumuman.kategori}</Teks>
            {!ctx.simpanan.dibaca.includes(pengumuman.id) && <Chip teks="Baru" nada="stempel" />}
          </View>
          <Teks v="subjudul">{pengumuman.judul}</Teks>
          <Teks v="kecil" warna={W.tinta2}>{pengumuman.ringkas}</Teks>
        </Tautan>
      )}
      <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center', marginTop: 4 }}>
        Demo: data contoh dibuat relatif terhadap hari ini (WIB) dan tersimpan di perangkat ini.
      </Teks>
    </>
  );
}

function propsAksi(k: ReturnType<typeof keadaanHariIni>, menit: number) {
  const masuk = k.langkah === 'masuk';
  const awal = masuk && menit < k.buka;
  return {
    ikon: (masuk ? 'masuk' : 'pulang') as 'masuk' | 'pulang',
    label: masuk ? 'Absen masuk' : 'Absen pulang',
    onPress: () => router.push(`/absen?jenis=${k.langkah}`),
    keterangan: masuk
      ? awal
        ? `Absen biasanya dibuka ${jam(k.buka)}. Di demo kamu tetap bisa mencobanya sekarang.`
        : 'Tanpa swafoto: cukup lokasi dalam radius dan catatan tugas pembuka.'
      : `Sudah bekerja ${durasi(menit - (k.rec?.masuk?.menit ?? menit))} sejak masuk.`,
  };
}

// Satu jenis komponen untuk keadaan memuat & siap, supaya simpul DOM-nya dipakai ulang (LCP tidak tergeser).
function AksiTombol({ label, ikon, keterangan, onPress }: { label: string; ikon: 'masuk' | 'pulang'; keterangan: string; onPress?: () => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Tombol besar varian="stempel" ikon={ikon} label={label} onPress={onPress} disabled={!onPress} />
      <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center' }}>{keterangan}</Teks>
    </View>
  );
}

function Aksi({ k }: { k: ReturnType<typeof keadaanHariIni> }) {
  const ctx = useGilir();
  if (k.langkah === 'selesai') {
    const lama = (k.rec?.pulang?.menit ?? 0) - (k.rec?.masuk?.menit ?? 0);
    return (
      <Kartu nada="hijau" style={{ gap: 6 }} label="Absen hari ini selesai">
        <Teks v="judul" tingkat={2} warna={W.hijauTua}>Selesai untuk hari ini</Teks>
        <Teks v="isi" warna={W.hijauTua}>
          Masuk {jam(k.rec?.masuk?.menit ?? 0)}, pulang {jam(k.rec?.pulang?.menit ?? 0)}. Total {durasi(lama)} di {CABANG[saya.cabang].nama}.
        </Teks>
        <Tombol varian="teks" ikon="ulang" label="Ulangi absen hari ini (demo)" onPress={ctx.ulangiHariIni} style={{ alignSelf: 'flex-start' }} />
      </Kartu>
    );
  }
  if (k.langkah === 'libur') {
    const berikut = shiftBerikutnya(ctx.hariIni);
    return (
      <Kartu nada="kunyit" style={{ gap: 8 }} label="Hari ini libur">
        <Teks v="judul" tingkat={2}>Hari ini kamu libur</Teks>
        {berikut && (
          <Teks v="isi">
            Shift berikutnya {NAMA_HARI[hariDalamPekan(berikut.tgl)]}, {berikut.shift.nama} {jam(berikut.shift.mulai)}–{jam(berikut.shift.selesai)}.
          </Teks>
        )}
        <Tombol
          varian="utama"
          ikon="jam"
          label="Simulasikan hari kerja"
          onPress={() => ctx.simulasiHariKerja(shiftPekanIni(ctx.hariIni))}
        />
      </Kartu>
    );
  }
  const p = k.h.pengajuan;
  return (
    <Kartu nada="ungu" style={{ gap: 6 }} label="Status hari ini">
      <Teks v="judul" tingkat={2} warna={W.ungu}>
        {k.h.status === 'cuti' ? 'Kamu sedang cuti' : k.h.status === 'sakit' ? 'Kamu tercatat sakit' : 'Kamu sedang izin'}
      </Teks>
      <Teks v="isi" warna={W.ungu}>
        {p?.status === 'menunggu' ? 'Pengajuan masih menunggu persetujuan kepala gerai.' : 'Pengajuan sudah disetujui. Tidak perlu absen hari ini.'}
      </Teks>
    </Kartu>
  );
}

const st = StyleSheet.create({
  kepalaKanan: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  ikonBulat: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center',
  },
  avatarTombol: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: W.tinta, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  lencana: {
    position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: W.stempel,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: W.manila,
  },
  barisAntara: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  stempelBaris: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingTop: 2 },
  bento: { flexDirection: 'row', gap: 10 },
  ubin: { borderRadius: 22, padding: 14, borderWidth: 1 },
  ubinCuti: { flex: 1, backgroundColor: W.kunyit, borderColor: '#D9AE34', justifyContent: 'space-between' },
  ubinKertas: { backgroundColor: W.kertas, borderColor: W.garis, gap: 2 },
  ubinHijau: { backgroundColor: W.hijauMuda, borderColor: '#BBD3B0', gap: 2 },
  ubinMerah: { backgroundColor: W.stempelMuda, borderColor: '#E8B9AA', gap: 2 },
  petak: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 },
  petakItem: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: W.tinta },
  atasan: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: W.unguMuda,
    borderWidth: 1, borderColor: '#C9C1E4',
  },
  pengumuman: { padding: 16, borderRadius: 22, backgroundColor: W.kertas, borderWidth: 1, borderColor: W.garis, gap: 4 },
});
