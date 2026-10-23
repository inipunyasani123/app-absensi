import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { Avatar } from '@/components/Ilustrasi';
import { Kartu, Kerangka, Layar, Stempel, Teks, Tombol } from '@/components/ui';
import { router } from '@/lib/nav';
import { CABANG, KodeShift, ORANG, SAYA_ID, SHIFT, TIM_KOTA } from '@/lib/data';
import { meta } from '@/lib/meta';
import { hari, shiftHari } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { HARI_PENDEK, NAMA_HARI, Tgl, awalPekan, hariDalamPekan, jam, kunci, rentang, sama, tambahHari, tanggalPendek } from '@/lib/waktu';
import { H, W, WARNA_SHIFT } from '@/theme';

export function generateMetadata() {
  return meta('/jadwal', 'Jadwal Shift Mingguan · Gilir', 'Jadwal shift bergilir pekan ini dan pekan depan: Pagi, Siang, Sore, hari libur, dan rekan satu shift di Gerai Kota. Demo aplikasi Gilir.');
}

export default function Jadwal() {
  const { siap } = useGilir();
  return (
    <Layar tab sub={`${CABANG.kota.nama} · rotasi pekanan`} judul="Jadwal shift">
      {siap ? <Isi /> : <><Kerangka tinggi={48} lebar="100%" /><Kerangka tinggi={320} lebar="100%" /></>}
    </Layar>
  );
}

function Isi() {
  const ctx = useGilir();
  const [geser, setGeser] = useState(0);
  const [pilih, setPilih] = useState<string>(ctx.kunciHariIni);
  const senin = tambahHari(awalPekan(ctx.hariIni), geser * 7);
  const hariList = Array.from({ length: 7 }, (_, i) => tambahHari(senin, i));
  const namaPekan = geser === 0 ? 'Pekan ini' : geser === 1 ? 'Pekan depan' : geser === -1 ? 'Pekan lalu' : geser > 0 ? `${geser} pekan lagi` : `${-geser} pekan lalu`;
  const dipilih = hariList.find((t) => kunci(t) === pilih) ?? hariList[0];
  const jamKerja = hariList.reduce((s, t) => {
    const sh = shiftHari(SAYA_ID, t, ctx.simpanan, ctx.pengajuan);
    return s + (sh === 'libur' ? 0 : (SHIFT[sh].selesai - SHIFT[sh].mulai) / 60);
  }, 0);

  return (
    <>
      <View style={st.navPekan}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pekan sebelumnya"
          disabled={geser <= -2}
          onPress={() => setGeser((g) => g - 1)}
          style={[st.navTombol, geser <= -2 && { opacity: 0.35 }]}
        >
          <Ikon nama="kiri" />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }} aria-live="polite">
          <Teks v="label" warna={W.tinta2}>{namaPekan}</Teks>
          <Teks v="judul">{rentang(hariList[0], hariList[6])}</Teks>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pekan berikutnya"
          disabled={geser >= 2}
          onPress={() => setGeser((g) => g + 1)}
          style={[st.navTombol, geser >= 2 && { opacity: 0.35 }]}
        >
          <Ikon nama="kanan" />
        </Pressable>
      </View>

      <View style={st.legenda} aria-label="Keterangan warna shift" {...({ role: 'list' } as object)}>
        {(['pagi', 'siang', 'sore'] as KodeShift[]).map((k) => (
          <View key={k} style={st.legendaItem} {...({ role: 'listitem' } as object)}>
            <View style={[st.legendaWarna, { backgroundColor: WARNA_SHIFT[k] }]} />
            <Text style={st.legendaTeks}>{SHIFT[k].nama} {jam(SHIFT[k].mulai)}–{jam(SHIFT[k].selesai)}</Text>
          </View>
        ))}
      </View>

      <Kartu lubang style={{ paddingHorizontal: 12, gap: 6 }} label={`Jadwal ${namaPekan.toLowerCase()}`}>
        <View style={st.skala} aria-hidden>
          <View style={{ width: 58 }} />
          <View style={st.skalaBar}>
            {[0, 6, 12, 18, 24].map((j) => (
              <Text key={j} style={[st.skalaTeks, { left: `${(j / 24) * 100}%` }, j === 24 && { transform: [{ translateX: -16 }] }]}>
                {String(j).padStart(2, '0')}
              </Text>
            ))}
          </View>
        </View>
        {hariList.map((t, i) => (
          <BarisHari key={kunci(t)} t={t} i={i} aktif={sama(t, dipilih)} onPilih={() => setPilih(kunci(t))} hariIni={sama(t, ctx.hariIni)} />
        ))}
        <Teks v="kecil" warna={W.tinta2} style={{ marginTop: 6 }}>
          Total {jamKerja} jam terjadwal pekan ini · ketuk hari untuk melihat rekan satu shift.
        </Teks>
      </Kartu>

      <Rekan t={dipilih} />

      <Kartu nada="polos" style={{ gap: 8 }} label="Tukar shift">
        <Teks v="subjudul">Mau tukar shift {tanggalPendek(dipilih)}?</Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Sepakati dulu dengan rekan, lalu ajukan di sini. Setelah {ORANG.bayu.panggilan} (kepala gerai) menyetujui, jadwal kalian berdua langsung bertukar.
        </Teks>
        <Tombol
          varian="utama"
          ikon="ulang"
          label="Ajukan tukar shift"
          onPress={() => router.push(`/pengajuan/baru?jenis=tukar&tanggal=${kunci(dipilih)}`)}
        />
      </Kartu>
    </>
  );
}

function BarisHari({ t, i, aktif, onPilih, hariIni }: { t: Tgl; i: number; aktif: boolean; onPilih: () => void; hariIni: boolean }) {
  const ctx = useGilir();
  const h = hari(SAYA_ID, t, ctx);
  const sh = SHIFT[h.shift];
  const status =
    h.status === 'cuti' || h.status === 'izin' || h.status === 'sakit'
      ? h.status
      : h.shift === 'libur'
        ? 'libur'
        : null;
  const label = `${NAMA_HARI[i]} ${t.d}: ${h.shift === 'libur' ? 'libur' : `shift ${sh.nama} ${jam(sh.mulai)} sampai ${jam(sh.selesai)}`}${status && status !== 'libur' ? `, ${status}` : ''}${hariIni ? ', hari ini' : ''}`;
  return (
    <Pressable
      onPress={onPilih}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...({ 'aria-pressed': aktif } as object)}
      style={[st.baris, aktif && st.barisAktif, hariIni && !aktif && st.barisHariIni]}
    >
      <View style={st.tanggal}>
        <Text style={st.hari}>{HARI_PENDEK[i]}</Text>
        <Text style={st.angka}>{t.d}</Text>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <View style={st.bar}>
          {[6, 12, 18].map((j) => (
            <View key={j} style={[st.bantu, { left: `${(j / 24) * 100}%` }]} />
          ))}
          {h.shift !== 'libur' && (
            <View
              style={[
                st.blok,
                { left: `${(sh.mulai / 1440) * 100}%`, width: `${((sh.selesai - sh.mulai) / 1440) * 100}%`, backgroundColor: WARNA_SHIFT[h.shift] },
                status && { opacity: 0.35 },
              ]}
            />
          )}
        </View>
        <View style={st.ket}>
          <Text style={st.ketTeks}>
            {h.shift === 'libur' ? 'Libur' : `${sh.nama} · ${jam(sh.mulai)}–${jam(sh.selesai)}`}
          </Text>
          {status && status !== 'libur' && <Text style={[st.ketTeks, { color: W.ungu }]}>{status.toUpperCase()}</Text>}
          {hariIni && <Stempel teks="Hari ini" kecil miring={-3} />}
        </View>
      </View>
    </Pressable>
  );
}

function Rekan({ t }: { t: Tgl }) {
  const ctx = useGilir();
  const shSaya = shiftHari(SAYA_ID, t, ctx.simpanan, ctx.pengajuan);
  const daftar = TIM_KOTA.filter((id) => id !== SAYA_ID).map((id) => ({ id, s: shiftHari(id, t, ctx.simpanan, ctx.pengajuan), h: hari(id, t, ctx) }));
  const serupa = daftar.filter((d) => d.s === shSaya && shSaya !== 'libur');
  const lain = daftar.filter((d) => !(d.s === shSaya && shSaya !== 'libur'));
  return (
    <Kartu style={{ gap: 10 }} label="Rekan satu shift">
      <Teks v="judul" tingkat={2}>
        {shSaya === 'libur' ? `Tim ${NAMA_HARI[hariDalamPekan(t)]} ${t.d}` : `Rekan shift ${SHIFT[shSaya].nama}`}
      </Teks>
      {serupa.length === 0 && shSaya !== 'libur' && <Teks v="kecil" warna={W.tinta2}>Tidak ada rekan di shift yang sama.</Teks>}
      {[...serupa, ...lain].map((d) => {
        const o = ORANG[d.id];
        const ket =
          d.h.status === 'cuti' || d.h.status === 'izin' || d.h.status === 'sakit'
            ? d.h.status
            : d.s === 'libur'
              ? 'libur'
              : `${SHIFT[d.s].nama} ${jam(SHIFT[d.s].mulai)}–${jam(SHIFT[d.s].selesai)}`;
        return (
          <View key={d.id} style={st.rekan}>
            <Avatar rupa={o.rupa} ukuran={40} />
            <View style={{ flex: 1 }}>
              <Teks v="subjudul" style={{ fontSize: 15 }}>{o.nama}</Teks>
              <Teks v="kecil" warna={W.tinta2}>{o.jabatan}</Teks>
            </View>
            <Text style={[st.rekanShift, d.s === shSaya && shSaya !== 'libur' && { backgroundColor: W.kunyitMuda }]}>{ket}</Text>
          </View>
        );
      })}
    </Kartu>
  );
}

const st = StyleSheet.create({
  navPekan: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navTombol: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: W.kertas, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: W.garis },
  legendaWarna: { width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: W.tinta },
  legendaTeks: { ...H.mono, fontSize: 12, color: W.tinta },
  skala: { flexDirection: 'row', height: 14 },
  skalaBar: { flex: 1, position: 'relative' },
  skalaTeks: { position: 'absolute', ...H.mono, fontSize: 12, color: W.tinta2, transform: [{ translateX: -6 }] },
  baris: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
  barisAktif: { borderColor: W.tinta, backgroundColor: W.kertas2 },
  barisHariIni: { backgroundColor: W.kunyitMuda },
  tanggal: { width: 46, alignItems: 'center' },
  hari: { ...H.monoTebal, fontSize: 12, letterSpacing: 1, color: W.tinta2, textTransform: 'uppercase' },
  angka: { ...H.display, fontSize: 28, lineHeight: 30, color: W.tinta },
  bar: { height: 16, borderRadius: 5, backgroundColor: W.kertas2, borderWidth: 1, borderColor: W.garis, overflow: 'hidden', position: 'relative' },
  bantu: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: W.garis },
  blok: { position: 'absolute', top: 1, bottom: 1, borderRadius: 4, borderWidth: 1, borderColor: W.tinta },
  ket: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  ketTeks: { ...H.isiTebal, fontSize: 13.5, color: W.tinta },
  rekan: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  rekanShift: { ...H.monoTebal, fontSize: 12, color: W.tinta, backgroundColor: W.kertas2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', textTransform: 'uppercase' },
});
