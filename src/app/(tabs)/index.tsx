import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { Avatar, IlustrasiBukti } from '@/components/Ilustrasi';
import { PapanBalik } from '@/components/Jam';
import { KartuPekan } from '@/components/KartuPekan';
import { Lembar } from '@/components/Lembar';
import { useLokasiHariIni } from '@/components/LokasiPanel';
import { Chip, Kartu, Layar, Stempel, Tautan, Teks, Tombol } from '@/components/ui';
import { ATURAN, CABANG, ORANG, SAYA_ID, SHIFT, TIM_KOTA, daftarPengumuman } from '@/lib/data';
import { keadaanHariIni, shiftBerikutnya, shiftPekanIni } from '@/lib/hariini';
import { meta } from '@/lib/meta';
import { router } from '@/lib/nav';
import { Hari, hari, rekapBulan, shiftHari, sisaCuti } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import {
  HARI_PENDEK, NAMA_BULAN, NAMA_HARI, banding, durasi, durasiPendek, geserBulan, hariDalamPekan, awalPekan, jam, jamDesimal, nomorHari,
  sekarangWIB, tambahHari, tanggalPanjang, tanggalPendek,
} from '@/lib/waktu';
import { H, W, WARNA_SHIFT } from '@/theme';

export function generateMetadata() {
  return meta(
    '/',
    'Gilir: Demo Aplikasi Absensi & HR Karyawan | PintuWeb',
    'Coba demo aplikasi absensi karyawan: absen dengan cek radius gerai, jadwal shift, cuti, lembur, rekap kehadiran, dan slip gaji. Android, iOS, web.',
  );
}

const saya = ORANG[SAYA_ID];
const web = Platform.OS === 'web';

export default function Beranda() {
  const ctx = useGilir();
  const { siap } = ctx;
  const [rekan, setRekan] = useState<string | null>(null);
  const [kenalan, setKenalan] = useState(true);
  useEffect(() => {
    if (!siap) return;
    setKenalan(!ctx.simpanan.kenal);
  }, [siap, ctx.simpanan.kenal]);
  useEffect(() => {
    if (web && siap) document.documentElement.classList.toggle('kenal', !kenalan);
  }, [kenalan, siap]);
  const tutupKenalan = useCallback(() => {
    setKenalan(false);
    ctx.setKenal(true);
  }, [ctx]);
  const tutupRekan = useCallback(() => setRekan(null), []);

  return (
    <Layar
      tab
      sub={siap ? tanggalPanjang(ctx.hariIni) : 'Roti Lintang Pagi · Gerai Kota'}
      judul={`Halo, ${saya.panggilan}`}
      kanan={<KepalaKanan />}
      lapisan={
        <>
          <Lembar buka={!!rekan} tutup={tutupRekan} judul={rekan ? ORANG[rekan].nama : ''}>
            {rekan && <RincianRekan id={rekan} tutup={tutupRekan} />}
          </Lembar>
          <Lembar buka={kenalan} tutup={tutupKenalan} judul="Selamat datang di Gilir" nativeID="kenalan">
            <Kenalan selesai={tutupKenalan} />
          </Lembar>
        </>
      }
    >
      <Isi bukaRekan={setRekan} />
    </Layar>
  );
}

function KepalaKanan() {
  const { siap, simpanan, hariIni } = useGilir();
  const belum = siap
    ? daftarPengumuman(hariIni, '').filter((p) => !simpanan.dibaca.includes(p.id) && banding(hariIni, p.tanggal) <= 3).length
    : 0;
  return (
    <View style={st.kepalaKanan}>
      <Tautan href="/pengumuman" label={`Pengumuman HR${belum ? `, ${belum} baru` : ''}`} style={st.ikonBulat}>
        <Ikon nama="lonceng" />
        {belum ? (
          <View style={st.lencana} aria-hidden>
            <Text style={st.lencanaTeks}>{belum}</Text>
          </View>
        ) : null}
      </Tautan>
      <Tautan href="/profil" label="Profil karyawan" style={st.avatarTombol}>
        <Avatar rupa={saya.rupa} ukuran={44} />
      </Tautan>
    </View>
  );
}

// ——— Ubin shift berbasis keadaan ———

type Keadaan = ReturnType<typeof keadaanHariIni>;

function pecah(detik: number) {
  const d = Math.max(0, Math.floor(detik));
  return { j: Math.floor(d / 3600), m: Math.floor((d % 3600) / 60), s: d % 60 };
}

function lamaIstirahat(k: Keadaan, menit: number) {
  const i = k.rec?.istirahat;
  if (!i) return 0;
  return (i.selesai ?? menit) - i.mulai;
}

function UbinShift({ k }: { k: Keadaan | null }) {
  const ctx = useGilir();
  const [detik, setDetik] = useState<number | null>(null);
  useEffect(() => {
    if (!ctx.siap) return;
    const tick = () => {
      const n = sekarangWIB();
      setDetik(n.menit * 60 + n.detik);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ctx.siap]);

  const cabang = CABANG[saya.cabang];
  let judul = 'Memuat kartu absen';
  let a: number | null = null;
  let b: number | null = null;
  let kecil: string | undefined = '--';
  let satuan: [string, string] = ['jam', 'menit'];
  let sub = 'Menyiapkan jadwal & jam WIB…';
  let kalimat = 'Memuat';

  if (k && detik != null) {
    const sh = k.sh;
    const menit = detik / 60;
    const set = (sel: number) => {
      const p = pecah(sel);
      a = p.j;
      b = p.m;
      kecil = String(p.s).padStart(2, '0');
      return p;
    };
    if (k.langkah === 'libur' || k.langkah === 'cuti') {
      const berikut = shiftBerikutnya(ctx.hariIni);
      if (berikut) {
        const selisihHari = nomorHari(berikut.tgl) - nomorHari(ctx.hariIni);
        const sisa = selisihHari * 86400 + berikut.shift.mulai * 60 - detik;
        const p = pecah(sisa);
        const hariSisa = Math.floor(p.j / 24);
        if (hariSisa >= 1) {
          a = hariSisa;
          b = p.j % 24;
          satuan = ['hari', 'jam'];
          kecil = undefined;
        } else {
          a = p.j;
          b = p.m;
          kecil = String(p.s).padStart(2, '0');
        }
        judul = k.langkah === 'cuti' ? `${k.h.status === 'sakit' ? 'Sakit' : k.h.status === 'izin' ? 'Izin' : 'Cuti'} · shift berikutnya dalam` : 'Libur · shift berikutnya dalam';
        sub = `${NAMA_HARI[hariDalamPekan(berikut.tgl)]} ${tanggalPendek(berikut.tgl)} · ${berikut.shift.nama} ${jam(berikut.shift.mulai)}–${jam(berikut.shift.selesai)}`;
        kalimat = `${judul} ${hariSisa >= 1 ? `${a} hari ${b} jam` : `${a} jam ${b} menit`}`;
      }
    } else if (k.langkah === 'masuk') {
      if (menit < k.buka) {
        const p = set(k.buka * 60 - detik);
        judul = 'Absen dibuka dalam';
        sub = `${cabang.nama} · dibuka ${jam(k.buka)}, mulai ${jam(sh.mulai)}`;
        kalimat = `Absen dibuka ${p.j} jam ${p.m} menit lagi`;
      } else if (menit < sh.mulai) {
        const p = set(sh.mulai * 60 - detik);
        judul = 'Shift mulai dalam';
        sub = `Absen sudah dibuka · toleransi ${ATURAN.toleransiTelat} menit`;
        kalimat = `Shift mulai ${p.j} jam ${p.m} menit lagi`;
      } else if (menit <= sh.selesai) {
        const p = set(detik - sh.mulai * 60);
        judul = menit <= sh.mulai + ATURAN.toleransiTelat ? 'Shift sudah mulai' : 'Lewat jam masuk';
        sub = menit <= sh.mulai + ATURAN.toleransiTelat ? 'Masih toleransi 5 menit, ayo stempel' : 'Absen sekarang tercatat telat';
        kalimat = `${judul} ${p.j} jam ${p.m} menit`;
      } else {
        const p = set(detik - sh.selesai * 60);
        judul = 'Shift sudah selesai';
        sub = `Berakhir ${jam(sh.selesai)} · absen jadi simulasi`;
        kalimat = `Shift selesai ${p.j} jam ${p.m} menit lalu`;
      }
    } else if (k.langkah === 'pulang') {
      const istirahatJalan = !!k.rec?.istirahat && k.rec.istirahat.selesai == null;
      if (istirahatJalan) {
        const p = set(detik - (k.rec?.istirahat?.mulai ?? 0) * 60);
        judul = 'Sedang istirahat';
        sub = `Mulai ${jam(k.rec?.istirahat?.mulai ?? 0)} · jatah 30 menit`;
        kalimat = `Istirahat ${p.j} jam ${p.m} menit`;
      } else {
        const kerja = detik - (k.rec?.masuk?.menit ?? 0) * 60 - lamaIstirahat(k, menit) * 60;
        const p = set(kerja);
        judul = 'Sedang bertugas';
        const sisa = sh.selesai - menit;
        sub = sisa > 0 ? `Pulang ${jam(sh.selesai)} · ${durasiPendek(sisa)} lagi` : `Lewat jam pulang ${durasiPendek(-sisa)} · ajukan lembur`;
        kalimat = `Sudah bekerja ${p.j} jam ${p.m} menit`;
      }
    } else {
      const total = ((k.rec?.pulang?.menit ?? 0) - (k.rec?.masuk?.menit ?? 0) - lamaIstirahat(k, menit)) * 60;
      const p = pecah(total);
      a = p.j;
      b = p.m;
      kecil = undefined;
      judul = 'Selesai · total kerja';
      sub = k.rec?.istirahat ? `Bersih setelah istirahat ${durasiPendek(lamaIstirahat(k, menit))}` : 'Jam kerja bersih hari ini';
      kalimat = `Total kerja hari ini ${p.j} jam ${p.m} menit`;
    }
  }

  const jamDinding = detik != null ? `${jam(Math.floor(detik / 60))}.${String(detik % 60).padStart(2, '0')} WIB` : '--.--.-- WIB';
  return (
    <Kartu nada="jelaga" lubang style={{ gap: 8 }} label="Keadaan shift hari ini">
      <View style={st.barisAntara}>
        <Chip nada="kunyit" teks={!k ? 'Shift hari ini' : k.h.shift === 'libur' ? 'Libur' : `Shift ${k.sh.nama} ${jam(k.sh.mulai)}–${jam(k.sh.selesai)}`} />
        <Text style={st.jamDinding}>{jamDinding}</Text>
      </View>
      <Text style={st.ubinJudul}>{judul}</Text>
      <PapanBalik a={a} b={b} kecil={kecil} satuan={satuan} label={kalimat} />
      <Text style={st.ubinSub} numberOfLines={1}>{sub}</Text>
      <View style={st.stempelBaris}>
        {k?.rec?.masuk ? (
          <Stempel
            teks={`Masuk ${jam(k.rec.masuk.menit)}`}
            sub={k.masuk?.status === 'telat' ? `telat ${k.masuk.telat} mnt` : k.masuk?.status === 'luar' ? 'di luar jam shift' : 'tepat waktu'}
            warna={k.masuk?.status === 'telat' ? W.oranyeTerang : '#9FD3A8'}
            miring={-5}
          />
        ) : (
          <SlotStempel teks="Masuk --.--" />
        )}
        {k?.rec?.pulang ? <Stempel teks={`Pulang ${jam(k.rec.pulang.menit)}`} warna={W.kunyit} miring={3} /> : <SlotStempel teks="Pulang --.--" />}
      </View>
    </Kartu>
  );
}

/** Kolom stempel yang belum terisi: garis putus-putus, menunggu dicap. */
function SlotStempel({ teks }: { teks: string }) {
  return (
    <View style={st.slot} aria-hidden>
      <Text style={st.slotTeks}>{teks}</Text>
    </View>
  );
}

// ——— Aksi utama ———

// Area aksi bertinggi tetap di semua keadaan supaya isi di bawahnya tidak melompat saat data siap (CLS).
function Aksi({ k }: { k: Keadaan | null }) {
  return <View style={st.aksiWadah}><AksiIsi k={k} /></View>;
}

function AksiIsi({ k }: { k: Keadaan | null }) {
  const ctx = useGilir();
  const { lokasi, dalam, cabang } = useLokasiHariIni();
  if (!k || k.langkah === 'masuk') {
    const awal = k && ctx.menit < k.buka;
    return (
      <View style={{ gap: 8 }}>
        <Tombol
          besar
          varian="stempel"
          ikon="masuk"
          label={k ? 'Absen masuk' : 'Absen'}
          disabled={!k}
          onPress={() => router.push('/absen?jenis=masuk')}
        />
        <View style={st.lokasiBaris}>
          <Ikon nama="pin" ukuran={18} warna={dalam ? W.hijau : W.tinta2} />
          <Teks v="kecil" warna={dalam ? W.hijauTua : W.tinta2} style={{ flex: 1 }} numberOfLines={1}>
            {!k
              ? 'Menyiapkan kartu absenmu…'
              : lokasi
                ? `${dalam ? 'Di dalam' : 'Di luar'} radius ${cabang.nama}${lokasi.sumber === 'simulasi' ? ' (simulasi)' : ''}`
                : awal
                  ? `Radius ${cabang.radius} m · boleh dicoba sebelum dibuka`
                  : `Lokasi dicek saat menstempel · radius ${cabang.radius} m`}
          </Teks>
        </View>
      </View>
    );
  }
  if (k.langkah === 'pulang') {
    const ist = k.rec?.istirahat;
    const sedang = !!ist && ist.selesai == null;
    return (
      <View style={{ gap: 8 }}>
        <View style={st.duaTombol}>
          {!ist || sedang ? (
            <Tombol
              varian={sedang ? 'utama' : 'garis'}
              ikon="jam"
              label={sedang ? 'Selesai istirahat' : 'Mulai istirahat'}
              onPress={() => ctx.istirahat(sedang ? 'selesai' : 'mulai')}
              style={{ flex: 1, minHeight: 60 }}
            />
          ) : (
            <View style={[st.istirahatSelesai]}>
              <Teks v="label" warna={W.tinta2}>Istirahat</Teks>
              <Teks v="subjudul">{jam(ist.mulai)}–{jam(ist.selesai ?? ist.mulai)}</Teks>
            </View>
          )}
          <Tombol besar varian="stempel" ikon="pulang" label="Pulang" keterangan="Absen pulang" onPress={() => router.push('/absen?jenis=pulang')} style={{ flex: 1.3 }} />
        </View>
        <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center' }} numberOfLines={1}>
          {sedang ? 'Jam istirahat tidak dihitung jam kerja' : `Jatah istirahat 30 menit · pulang ${jam(k.sh.selesai)}`}
        </Teks>
      </View>
    );
  }
  if (k.langkah === 'selesai') {
    const berikut = shiftBerikutnya(ctx.hariIni);
    return (
      <View style={[st.aksiKartu, { backgroundColor: W.hijauMuda, borderColor: '#BBD3B0' }]} {...({ role: 'group', 'aria-label': 'Absen hari ini selesai' } as object)}>
        <View style={{ flex: 1, gap: 2 }}>
          <Teks v="subjudul" warna={W.hijauTua}>Kartu hari ini lengkap</Teks>
          {berikut && (
            <Teks v="kecil" warna={W.hijauTua} numberOfLines={2}>
              Berikutnya {NAMA_HARI[hariDalamPekan(berikut.tgl)]}, {berikut.shift.nama} {jam(berikut.shift.mulai)} · absen dibuka {jam(berikut.shift.mulai - ATURAN.bukaAbsen)}
            </Teks>
          )}
        </View>
        <Tombol varian="garis" ikon="ulang" label="Ulangi" keterangan="Ulangi absen hari ini (demo)" onPress={ctx.ulangiHariIni} style={{ paddingHorizontal: 12 }} />
      </View>
    );
  }
  if (k.langkah === 'libur') {
    return (
      <View style={[st.aksiKartu, { backgroundColor: W.kunyit, borderColor: '#C9A031' }]} {...({ role: 'group', 'aria-label': 'Hari ini libur' } as object)}>
        <View style={{ flex: 1, gap: 2 }}>
          <Teks v="subjudul">Hari ini jatah liburmu</Teks>
          <Teks v="kecil" numberOfLines={2}>Mau mencoba alur absen? Jadikan hari kerja sementara.</Teks>
        </View>
        <Tombol varian="utama" ikon="jam" label="Simulasikan" keterangan="Simulasikan hari kerja" onPress={() => ctx.simulasiHariKerja(shiftPekanIni(ctx.hariIni))} style={{ paddingHorizontal: 12 }} />
      </View>
    );
  }
  const p = k.h.pengajuan;
  return (
    <View style={[st.aksiKartu, { backgroundColor: W.unguMuda, borderColor: '#C9C1E4' }]} {...({ role: 'group', 'aria-label': 'Status hari ini' } as object)}>
      <Teks v="subjudul" warna={W.ungu} style={{ flex: 1 }} numberOfLines={3}>
        {k.h.status === 'cuti' ? 'Kamu sedang cuti.' : k.h.status === 'sakit' ? 'Kamu tercatat sakit.' : 'Kamu sedang izin.'}{' '}
        {p?.status === 'menunggu' ? 'Pengajuan masih menunggu kepala gerai.' : 'Tidak perlu absen hari ini.'}
      </Teks>
    </View>
  );
}

// ——— Bertugas hari ini ———

function BertugasHariIni({ buka }: { buka: (id: string) => void }) {
  const ctx = useGilir();
  if (!ctx.siap) {
    return (
      <Kartu style={{ gap: 8, paddingVertical: 12 }} label="Bertugas hari ini">
        <View style={st.barisAntara}>
          <Teks v="label" warna={W.tinta2}>Bertugas hari ini</Teks>
          <Tautan href="/jadwal" style={st.tautanKecil}>
            <Text style={st.tautanKecilTeks}>Jadwal</Text>
            <Ikon nama="kanan" ukuran={16} />
          </Tautan>
        </View>
        <View style={st.deretAvatar}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={st.rekan} aria-hidden>
              <View style={st.avatarKosong} />
              <Text style={st.rekanNama}> </Text>
              <Text style={st.rekanJam}> </Text>
            </View>
          ))}
        </View>
      </Kartu>
    );
  }
  const sayaShift = shiftHari(SAYA_ID, ctx.hariIni, ctx.simpanan, ctx.pengajuan);
  const sh = SHIFT[sayaShift];
  const tim = TIM_KOTA.filter((id) => id !== SAYA_ID).map((id) => ({ id, h: hari(id, ctx.hariIni, ctx) }));
  const bekerja = tim.filter((t) => t.h.shift !== 'libur');
  const beririsan = (t: { h: Hari }) =>
    sayaShift === 'libur' || (SHIFT[t.h.shift].mulai < sh.selesai && SHIFT[t.h.shift].selesai > sh.mulai);
  const daftar = [...bekerja.filter(beririsan), ...bekerja.filter((t) => !beririsan(t))];
  const libur = tim.length - bekerja.length;
  return (
    <Kartu style={{ gap: 8, paddingVertical: 12 }} label="Bertugas hari ini">
      <View style={st.barisAntara}>
        <Teks v="label" warna={W.tinta2}>{sayaShift === 'libur' ? 'Bertugas hari ini' : 'Bertugas bersamamu'}{libur > 0 ? ` · ${libur} libur` : ''}</Teks>
        <Tautan href="/jadwal" style={st.tautanKecil}>
          <Text style={st.tautanKecilTeks}>Jadwal</Text>
          <Ikon nama="kanan" ukuran={16} />
        </Tautan>
      </View>
      <View style={st.deretAvatar} {...({ role: 'list' } as object)}>
        {daftar.map(({ id, h }) => {
          const o = ORANG[id];
          const absen = h.status === 'sakit' || h.status === 'cuti' || h.status === 'izin';
          const s = SHIFT[h.shift];
          return (
            <View key={id} {...({ role: 'listitem' } as object)} style={{ opacity: beririsan({ h }) ? 1 : 0.92 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${o.nama}, ${absen ? h.status : `shift ${s.nama} ${jam(s.mulai)} sampai ${jam(s.selesai)}`}. Lihat rincian`}
                onPress={() => buka(id)}
                style={st.rekan}
              >
                <View style={[st.cincin, { borderColor: absen ? W.ungu : WARNA_SHIFT[h.shift] }]}>
                  <Avatar rupa={o.rupa} ukuran={38} />
                </View>
                <Text style={st.rekanNama} numberOfLines={1}>{o.panggilan}</Text>
                <Text style={[st.rekanJam, absen && { color: W.ungu }]}>{absen ? h.status : `${jam(s.mulai).slice(0, 2)}–${jam(s.selesai).slice(0, 2)}`}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Kartu>
  );
}

function RincianRekan({ id, tutup }: { id: string; tutup: () => void }) {
  const ctx = useGilir();
  const o = ORANG[id];
  const h = hari(id, ctx.hariIni, ctx);
  const s = SHIFT[h.shift];
  const senin = awalPekan(ctx.hariIni);
  const pekan = Array.from({ length: 7 }, (_, i) => tambahHari(senin, i));
  const status =
    h.status === 'libur' ? 'Libur hari ini'
      : h.status === 'sakit' || h.status === 'cuti' || h.status === 'izin' ? `${h.status[0].toUpperCase()}${h.status.slice(1)} hari ini`
        : h.masuk != null ? `${h.telatMenit ? 'Masuk telat' : 'Sudah masuk'} ${jam(h.masuk)}`
          : 'Belum masuk';
  return (
    <View style={{ gap: 12 }}>
      <View style={st.rincianAtas}>
        <View style={[st.cincin, { borderColor: WARNA_SHIFT[h.shift] }]}>
          <Avatar rupa={o.rupa} ukuran={60} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Teks v="kecil" warna={W.tinta2}>{o.jabatan}</Teks>
          <Teks v="subjudul">{h.shift === 'libur' ? 'Libur' : `Shift ${s.nama} ${jam(s.mulai)}–${jam(s.selesai)}`}</Teks>
          <Teks v="kecil">{status}</Teks>
        </View>
      </View>
      <View style={st.pekanMini} accessible accessibilityLabel={`Jadwal ${o.panggilan} pekan ini: ${pekan.map((t, i) => `${NAMA_HARI[i]} ${SHIFT[shiftHari(id, t, ctx.simpanan, ctx.pengajuan)].nama}`).join(', ')}`}>
        {pekan.map((t, i) => {
          const k = shiftHari(id, t, ctx.simpanan, ctx.pengajuan);
          return (
            <View key={i} style={[st.pekanSel, { backgroundColor: k === 'libur' ? 'transparent' : WARNA_SHIFT[k] }, nomorHari(t) === nomorHari(ctx.hariIni) && st.pekanHariIni]}>
              <Text style={st.pekanHari}>{HARI_PENDEK[i].slice(0, 1)}</Text>
              <Text style={st.pekanKode}>{k === 'libur' ? 'L' : SHIFT[k].nama.slice(0, 2)}</Text>
            </View>
          );
        })}
      </View>
      <Tombol
        varian="utama"
        ikon="ulang"
        label={`Minta tukar shift dengan ${o.panggilan}`}
        onPress={() => {
          tutup();
          router.push(`/pengajuan/baru?jenis=tukar&rekan=${id}`);
        }}
      />
    </View>
  );
}

// ——— Pengenalan sekali tampil ———

const LANGKAH_KENALAN = [
  { judul: `Kamu ${saya.panggilan}, kasir Gerai Kota`, teks: 'Roti Lintang Pagi punya tiga gerai dan satu dapur pusat di Tulungagung. Semua nama dan angkanya rekaan.', gambar: 'sekar' },
  { judul: 'Absen tanpa swafoto', teks: 'Cukup berada di radius gerai (atau tekan Simulasikan) dan centang tugas pembuka, lalu tekan-tahan tombol stempel.', gambar: 'bukti' },
  { judul: `Coba juga sebagai ${ORANG.bayu.panggilan}`, teks: 'Mode atasan menyetujui cuti, lembur, dan tukar shift tim. Jadwal dan data contoh mengikuti jam WIB hari ini.', gambar: 'bayu' },
] as const;

function Kenalan({ selesai }: { selesai: () => void }) {
  const [i, setI] = useState(0);
  const l = LANGKAH_KENALAN[i];
  const akhir = i === LANGKAH_KENALAN.length - 1;
  return (
    <View style={{ gap: 14 }}>
      <View style={st.kenalKartu}>
        <View style={st.kenalLubang} aria-hidden>
          {[0, 1, 2, 3, 4].map((x) => <View key={x} style={st.kenalTitik} />)}
        </View>
        <View style={st.kenalIsi}>
          {l.gambar === 'bukti' ? <IlustrasiBukti jenis="kasir" ukuran={60} /> : <Avatar rupa={ORANG[l.gambar === 'sekar' ? 'sekar' : 'bayu'].rupa} ukuran={60} />}
          <View style={{ flex: 1, gap: 4 }}>
            <Teks v="subjudul">{l.judul}</Teks>
            <Teks v="kecil" warna={W.tinta2}>{l.teks}</Teks>
          </View>
        </View>
        <Text style={st.kenalNomor} aria-hidden>{String(i + 1).padStart(2, '0')}/03</Text>
      </View>
      <View style={st.duaTombol}>
        <Tombol varian="garis" label="Lewati" onPress={selesai} style={{ flex: 1 }} />
        <Tombol
          varian="stempel"
          label={akhir ? 'Mulai mencoba' : 'Lanjut'}
          keterangan={akhir ? 'Mulai mencoba' : `Lanjut ke langkah ${i + 2} dari 3`}
          onPress={() => (akhir ? selesai() : setI(i + 1))}
          style={{ flex: 1.4 }}
        />
      </View>
    </View>
  );
}

// ——— Isi beranda ———

function Isi({ bukaRekan }: { bukaRekan: (id: string) => void }) {
  const ctx = useGilir();
  const { siap } = ctx;
  const k = siap ? keadaanHariIni(ctx) : null;
  const rekap = useMemo(() => (siap ? rekapBulan(SAYA_ID, ctx.hariIni.y, ctx.hariIni.m, ctx) : null), [ctx, siap]);
  const cuti = siap ? sisaCuti(ctx) : null;
  const bulan = siap ? NAMA_BULAN[ctx.hariIni.m - 1].slice(0, 3) : '';
  const telatBanyak = (rekap?.telat ?? 0) > 2;
  const pengumuman = siap
    ? (() => {
        const semua = daftarPengumuman(ctx.hariIni, NAMA_BULAN[geserBulan(ctx.hariIni.y, ctx.hariIni.m, -1).m - 1]);
        return semua.find((p) => p.penting && !ctx.simpanan.dibaca.includes(p.id)) ?? semua.find((p) => p.penting) ?? semua[0];
      })()
    : null;

  return (
    <>
      <UbinShift k={k} />
      <Aksi k={k} />
      <BertugasHariIni buka={bukaRekan} />

      {/* Tiga ubin ringkas */}
      <View style={st.bento}>
        <Tautan href="/pengajuan" style={[st.ubin, st.ubinCuti]}>
          <Text style={st.ubinLabel}>Sisa cuti</Text>
          <Teks v="angka">{cuti ? cuti.sisa : '–'}</Teks>
          <Text style={st.ubinKet}>dari {cuti?.jatah ?? 12} hari</Text>
        </Tautan>
        <Tautan href="/rekap" style={[st.ubin, st.ubinKertas]}>
          <Text style={st.ubinLabel}>Lembur {bulan}</Text>
          <Teks v="angka">{rekap ? jamDesimal(rekap.lemburMenit) : '–'}</Teks>
          <Text style={[st.ubinKet, !!rekap?.lemburMenunggu && { color: W.stempelTua }]}>
            {rekap?.lemburMenunggu ? `jam · +${jamDesimal(rekap.lemburMenunggu)} tunggu` : 'jam disetujui'}
          </Text>
        </Tautan>
        <Tautan href="/rekap" style={[st.ubin, telatBanyak ? st.ubinMerah : st.ubinHijau]}>
          <Text style={[st.ubinLabel, { color: telatBanyak ? W.stempelTua : W.hijauTua }]}>Telat {bulan}</Text>
          <Teks v="angka" warna={telatBanyak ? W.stempelTua : W.hijauTua}>{rekap ? `${rekap.telat}×` : '–'}</Teks>
          <Text style={[st.ubinKet, { color: telatBanyak ? W.stempelTua : W.hijauTua }]}>{!rekap ? 'bulan ini' : telatBanyak ? 'tunjangan gugur' : 'tunjangan aman'}</Text>
        </Tautan>
      </View>

      {siap && <KartuPekan />}

      {pengumuman && (
        <Tautan href={`/pengumuman/${pengumuman.id}`} style={st.pengumuman}>
          <View style={st.barisAntara}>
            <Teks v="label" warna={W.stempel}>Pengumuman · {tanggalPendek(pengumuman.tanggal)}</Teks>
            {pengumuman.penting && <Stempel teks="Wajib" kecil miring={4} />}
          </View>
          <Teks v="subjudul">{pengumuman.judul}</Teks>
          <Teks v="kecil" warna={W.tinta2}>{pengumuman.ringkas}</Teks>
        </Tautan>
      )}

      <Tautan href="/atasan" style={st.atasan}>
        <Avatar rupa={ORANG.bayu.rupa} ukuran={46} />
        <View style={{ flex: 1 }}>
          <Teks v="label" warna={W.ungu}>Mode atasan</Teks>
          <Teks v="subjudul">Coba sebagai {ORANG.bayu.nama}</Teks>
          <Teks v="kecil" warna={W.tinta2}>{siap ? `${ctx.menunggu.length} pengajuan tim menunggu keputusan` : 'Setujui cuti, lembur, dan tukar shift tim'}</Teks>
        </View>
        <Ikon nama="kanan" warna={W.ungu} />
      </Tautan>
      <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center', marginTop: 4 }}>
        Demo: data contoh dibuat relatif terhadap hari ini (WIB) dan tersimpan di perangkat ini.
      </Teks>
    </>
  );
}

const st = StyleSheet.create({
  kepalaKanan: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  ikonBulat: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  avatarTombol: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: W.tinta, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  lencana: {
    position: 'absolute', top: -5, right: -5, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: W.stempel,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: W.manila,
  },
  lencanaTeks: { ...H.monoTebal, fontSize: 12, lineHeight: 15, color: '#FFF8EE' },
  barisAntara: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  jamDinding: { ...H.monoTebal, fontSize: 12, color: W.diJelaga2 },
  ubinJudul: { ...H.monoTebal, fontSize: 13, letterSpacing: 1.2, color: W.kunyit, textTransform: 'uppercase' },
  ubinSub: { ...H.mono, fontSize: 13.5, lineHeight: 19, color: W.diJelaga },
  slot: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#5A5146', borderRadius: 8, paddingHorizontal: 10, minHeight: 44, justifyContent: 'center' },
  slotTeks: { ...H.monoTebal, fontSize: 14, letterSpacing: 1.4, color: W.diJelaga2, textTransform: 'uppercase' },
  aksiWadah: { minHeight: 96, justifyContent: 'center' },
  aksiKartu: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, minHeight: 96 },
  lokasiNama: { ...H.monoTebal, fontSize: 12, letterSpacing: 1, color: W.diJelaga2 },
  stempelBaris: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingTop: 2, minHeight: 48, alignItems: 'center' },
  lokasiBaris: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingHorizontal: 6 },
  duaTombol: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  istirahatSelesai: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: W.garisTegas, justifyContent: 'center', paddingHorizontal: 12 },
  deretAvatar: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'space-between' },
  avatarKosong: { width: 48, height: 48, borderRadius: 24, backgroundColor: W.kertas2 },
  rekan: { alignItems: 'center', width: 58, gap: 1, paddingVertical: 2, borderRadius: 12 },
  cincin: { borderWidth: 3, borderRadius: 999, padding: 2 },
  rekanNama: { ...H.isiTebal, fontSize: 13, color: W.tinta },
  rekanJam: { ...H.monoTebal, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  tautanKecil: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32, paddingHorizontal: 4 },
  tautanKecilTeks: { ...H.isiTebal, fontSize: 14, color: W.tinta },
  bento: { flexDirection: 'row', gap: 8 },
  ubin: { flex: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, gap: 2 },
  ubinLabel: { ...H.monoTebal, fontSize: 12, letterSpacing: 0.8, color: W.tinta, textTransform: 'uppercase' },
  ubinKet: { ...H.isi, fontSize: 12.5, lineHeight: 16, minHeight: 32, color: W.tinta },
  ubinCuti: { backgroundColor: W.kunyit, borderColor: '#C9A031' },
  ubinKertas: { backgroundColor: W.kertas, borderColor: W.garis },
  ubinHijau: { backgroundColor: W.hijauMuda, borderColor: '#BBD3B0' },
  ubinMerah: { backgroundColor: W.stempelMuda, borderColor: '#E8B9AA' },
  rincianAtas: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pekanMini: { flexDirection: 'row', gap: 4 },
  pekanSel: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: W.tinta, alignItems: 'center', paddingVertical: 5 },
  pekanHariIni: { borderWidth: 2.5 },
  pekanHari: { ...H.monoTebal, fontSize: 12, color: W.tinta },
  pekanKode: { ...H.isiTebal, fontSize: 12, color: W.tinta },
  kenalKartu: { backgroundColor: W.manila, borderRadius: 18, borderWidth: 1.5, borderColor: W.tinta, padding: 14, paddingTop: 10, gap: 8 },
  kenalLubang: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30 },
  kenalTitik: { width: 9, height: 9, borderRadius: 5, backgroundColor: W.kertas, borderWidth: 1, borderColor: W.garisTegas },
  kenalIsi: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  kenalNomor: { ...H.monoTebal, fontSize: 12, color: W.tinta2, alignSelf: 'flex-end' },
  atasan: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: W.unguMuda, borderWidth: 1, borderColor: '#C9C1E4' },
  pengumuman: { padding: 16, borderRadius: 22, backgroundColor: W.kertas, borderWidth: 1, borderColor: W.garis, gap: 4 },
});
