import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { Avatar } from '@/components/Ilustrasi';
import { KartuPengajuan } from '@/components/KartuPengajuan';
import { Kosong } from '@/components/Kosong';
import { Kartu, Kerangka, Layar, Segmen, Tautan, Teks, Tombol } from '@/components/ui';
import { NAMA_JENIS, ORANG, Pengajuan, SAYA_ID, SHIFT, StatusPengajuan, TIM_KOTA } from '@/lib/data';
import { meta } from '@/lib/meta';
import { Hari, hari } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { HARI_PENDEK, NAMA_HARI, awalPekan, jam, sama, tambahHari } from '@/lib/waktu';
import { H, W, WARNA_SHIFT } from '@/theme';

export function generateMetadata() {
  return meta('/atasan', 'Mode Atasan: Persetujuan Tim · Gilir', 'Mode kepala gerai di demo Gilir: papan hadir hari ini, jadwal tim sepekan, lalu setujui atau tolak cuti, izin, lembur, dan tukar shift.');
}

const bayu = ORANG.bayu;
const TIM = TIM_KOTA.filter((id) => id !== 'bayu');

type Tunda = { id: string; status: StatusPengajuan; catatan?: string; teks: string };

export default function Atasan() {
  const { siap, putuskan } = useGilir();
  const [tunda, setTunda] = useState<Tunda | null>(null);
  const tundaRef = useRef<Tunda | null>(null);
  tundaRef.current = tunda;

  // Keputusan dikunci 5 detik setelah ditekan; sebelum itu bisa diurungkan.
  useEffect(() => {
    if (!tunda) return;
    const t = setTimeout(() => {
      putuskan(tunda.id, tunda.status, tunda.catatan);
      setTunda(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [tunda, putuskan]);
  useEffect(
    () => () => {
      const t = tundaRef.current;
      if (t) putuskan(t.id, t.status, t.catatan);
    },
    [putuskan],
  );

  const ajukanKeputusan = useCallback(
    (x: Tunda) => {
      const lama = tundaRef.current;
      if (lama) putuskan(lama.id, lama.status, lama.catatan);
      setTunda(x);
    },
    [putuskan],
  );

  return (
    <Layar
      kembali
      sub={`Mode atasan · ${bayu.nama}`}
      judul="Persetujuan tim"
      lapisan={
        tunda ? (
          <View style={st.snack} {...({ role: 'status', 'aria-live': 'polite' } as object)}>
            <Text style={st.snackTeks}>{tunda.teks}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Urungkan keputusan" onPress={() => setTunda(null)} style={st.snackTombol}>
              <Text style={st.snackAksi}>URUNGKAN</Text>
            </Pressable>
          </View>
        ) : null
      }
    >
      <View style={st.banner}>
        <Avatar rupa={bayu.rupa} ukuran={52} />
        <View style={{ flex: 1, gap: 2 }}>
          <Teks v="subjudul" warna={W.ungu}>Kamu melihat sebagai {bayu.panggilan}</Teks>
          <Teks v="isi" warna={W.ungu}>Keputusan di sini mengubah status pengajuan di akun {ORANG[SAYA_ID].panggilan}. Ada 5 detik untuk mengurungkan.</Teks>
        </View>
      </View>
      {siap ? <Isi tunda={tunda} putus={ajukanKeputusan} /> : <Kerangka tinggi={300} lebar="100%" />}
    </Layar>
  );
}

function Isi({ tunda, putus }: { tunda: Tunda | null; putus: (t: Tunda) => void }) {
  const ctx = useGilir();
  const [tab, setTab] = useState<'hari' | 'pekan'>('hari');
  const tim = TIM.map((id) => ({ id, h: hari(id, ctx.hariIni, ctx) }));
  const terjadwal = tim.filter((t) => t.h.status !== 'libur');
  const hadir = terjadwal.filter((t) => t.h.masuk != null);
  const telat = terjadwal.filter((t) => t.h.telatMenit);
  const menunggu = ctx.menunggu.filter((p) => p.id !== tunda?.id);
  const diputuskan = ctx.pengajuan.filter((p) => p.status !== 'menunggu' && p.orang !== 'bayu').slice(0, 4);
  const celah = tim.filter((t) => t.h.status === 'sakit' || t.h.status === 'cuti' || t.h.status === 'izin');

  return (
    <>
      <View style={st.bento}>
        <View style={[st.ubin, { backgroundColor: W.jelaga, flex: 1.3 }]}>
          <Text style={[st.ubinLabel, { color: W.diJelaga2 }]}>Hadir hari ini</Text>
          <Teks v="raksasa" warna={W.diJelaga} style={{ fontSize: 56, lineHeight: 58 }}>
            {hadir.length}<Text style={{ fontSize: 30, color: W.diJelaga2 }}>/{terjadwal.length}</Text>
          </Teks>
        </View>
        <View style={[st.ubin, { backgroundColor: W.stempelMuda, borderColor: '#E8B9AA', borderWidth: 1 }]}>
          <Text style={[st.ubinLabel, { color: W.stempelTua }]}>Menunggu</Text>
          <Teks v="angka" warna={W.stempelTua}>{menunggu.length}</Teks>
        </View>
        <View style={[st.ubin, { backgroundColor: W.kertas, borderColor: W.garis, borderWidth: 1 }]}>
          <Text style={st.ubinLabel}>Telat</Text>
          <Teks v="angka">{telat.length}</Teks>
        </View>
      </View>

      {celah.map(({ id, h }) => (
        <View key={id} style={st.celah}>
          <Ikon nama="info" warna={W.stempelTua} />
          <Teks v="kecil" warna={W.stempelTua} style={{ flex: 1, ...H.isiSedang }}>
            {ORANG[id].panggilan} {h.status}{h.pengajuan?.status === 'menunggu' ? ' (menunggu)' : ''}: shift {SHIFT[h.shift].nama} {jam(SHIFT[h.shift].mulai)} belum ada pengganti.
          </Teks>
        </View>
      ))}

      <Segmen
        label="Tampilan mode atasan"
        nilai={tab}
        ubah={setTab}
        pilihan={[
          { nilai: 'hari', label: 'Papan hari ini' },
          { nilai: 'pekan', label: 'Jadwal tim' },
        ]}
      />

      {tab === 'hari' ? <PapanHadir tim={tim} /> : <JadwalTim />}

      <Teks v="judul" tingkat={2} style={{ marginTop: 4 }}>Antrean persetujuan</Teks>
      {menunggu.length === 0 ? (
        <Kosong
          jenis="beres"
          judul="Semua beres"
          teks={`Tidak ada pengajuan yang menunggu. Coba ajukan cuti, lembur, atau tukar shift sebagai ${ORANG[SAYA_ID].panggilan}.`}
          aksi={{ label: `Ajukan sebagai ${ORANG[SAYA_ID].panggilan}`, href: '/pengajuan/baru?jenis=cuti' }}
        />
      ) : (
        <View style={{ gap: 10 }} {...({ role: 'list' } as object)}>
          {menunggu.map((p) => (
            <View key={p.id} {...({ role: 'listitem' } as object)}>
              <Antrean p={p} putus={putus} />
            </View>
          ))}
        </View>
      )}

      {diputuskan.length > 0 && (
        <>
          <Teks v="judul" tingkat={2} style={{ marginTop: 4 }}>Baru diputuskan</Teks>
          <View style={{ gap: 10 }}>
            {diputuskan.map((p) => <KartuPengajuan key={p.id} p={p} denganOrang />)}
          </View>
        </>
      )}

      <Tautan href="/" style={st.kembali}>
        <Ikon nama="orang" />
        <Teks v="subjudul">Kembali ke mode karyawan</Teks>
      </Tautan>
    </>
  );
}

// Papan hadir: bilah shift 03.00–22.00 per orang, titik stempel masuk/pulang, garis "sekarang".
const AWAL = 3 * 60;
const AKHIR = 22 * 60;
const pos = (m: number) => `${Math.min(100, Math.max(0, ((m - AWAL) / (AKHIR - AWAL)) * 100))}%` as const;

function PapanHadir({ tim }: { tim: { id: string; h: Hari }[] }) {
  const ctx = useGilir();
  return (
    <Kartu lubang style={{ gap: 4 }} label="Papan hadir hari ini">
      <View style={st.papanKepala}>
        <Teks v="judul" tingkat={2}>Papan hadir</Teks>
        <Text style={st.papanSkala} aria-hidden>03 · 08 · 13 · 18 · 22</Text>
      </View>
      {tim.map(({ id, h }) => {
        const o = ORANG[id];
        const s = SHIFT[h.shift];
        const absen = h.status === 'sakit' || h.status === 'cuti' || h.status === 'izin';
        let ket: string;
        let warna: string = W.tinta2;
        if (h.status === 'libur') ket = 'Libur';
        else if (absen) {
          ket = `${h.status[0].toUpperCase()}${h.status.slice(1)}`;
          warna = W.ungu;
        } else if (h.masuk != null) {
          ket = `${h.telatMenit ? 'Telat' : 'Masuk'} ${jam(h.masuk)}${h.pulang != null ? ` · pulang ${jam(h.pulang)}` : ''}`;
          warna = h.telatMenit ? W.stempelTua : W.hijauTua;
        } else ket = ctx.menit > s.mulai ? 'Belum masuk' : `Mulai ${jam(s.mulai)}`;
        return (
          <View key={id} style={st.papan} accessible accessibilityLabel={`${o.nama}: ${h.shift === 'libur' ? 'libur' : `shift ${s.nama} ${jam(s.mulai)} sampai ${jam(s.selesai)}`}, ${ket}`}>
            <Avatar rupa={o.rupa} ukuran={36} />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={st.papanAtas}>
                <Text style={st.papanNama}>{o.panggilan}</Text>
                <Text style={[st.papanKet, { color: warna }]}>{ket}</Text>
              </View>
              <View style={st.bilah}>
                {h.shift !== 'libur' && (
                  <View
                    style={[
                      st.blok,
                      { left: pos(s.mulai), width: `${((s.selesai - s.mulai) / (AKHIR - AWAL)) * 100}%`, backgroundColor: absen ? W.unguMuda : WARNA_SHIFT[h.shift] },
                      absen && { borderStyle: 'dashed', borderColor: W.ungu },
                    ]}
                  />
                )}
                {h.masuk != null && <View style={[st.titik, { left: pos(h.masuk), backgroundColor: h.telatMenit ? W.stempel : W.hijau }]} />}
                {h.pulang != null && <View style={[st.titik, { left: pos(h.pulang), backgroundColor: W.tinta }]} />}
                <View style={[st.kini, { left: pos(ctx.menit) }]} />
              </View>
            </View>
          </View>
        );
      })}
      <View style={st.legenda} aria-hidden>
        <View style={[st.titikLeg, { backgroundColor: W.hijau }]} /><Text style={st.legTeks}>masuk</Text>
        <View style={[st.titikLeg, { backgroundColor: W.stempel }]} /><Text style={st.legTeks}>telat</Text>
        <View style={[st.titikLeg, { backgroundColor: W.tinta }]} /><Text style={st.legTeks}>pulang</Text>
        <View style={st.kiniLeg} /><Text style={st.legTeks}>sekarang</Text>
      </View>
    </Kartu>
  );
}

function JadwalTim() {
  const ctx = useGilir();
  const senin = awalPekan(ctx.hariIni);
  const pekan = Array.from({ length: 7 }, (_, i) => tambahHari(senin, i));
  const orang = TIM_KOTA;
  const celah: string[] = [];
  const grid = orang.map((id) =>
    pekan.map((t, i) => {
      const h = hari(id, t, ctx);
      const absen = h.status === 'sakit' || h.status === 'cuti' || h.status === 'izin';
      if (absen && h.shift !== 'libur') celah.push(`${HARI_PENDEK[i]} ${t.d}: ${ORANG[id].panggilan} ${h.status}, shift ${SHIFT[h.shift].nama} perlu pengganti`);
      return { h, absen };
    }),
  );
  return (
    <Kartu lubang style={{ gap: 6, paddingHorizontal: 12 }} label="Jadwal tim pekan ini">
      <Teks v="judul" tingkat={2}>Jadwal tim pekan ini</Teks>
      <View style={st.gBaris}>
        <View style={st.gNama} />
        {pekan.map((t, i) => (
          <View key={i} style={[st.gKepala, sama(t, ctx.hariIni) && st.gHariIni]}>
            <Text style={st.gHari}>{HARI_PENDEK[i].slice(0, 2)}</Text>
            <Text style={st.gTgl}>{t.d}</Text>
          </View>
        ))}
      </View>
      {orang.map((id, r) => (
        <View key={id} style={st.gBaris}>
          <Text style={[st.gNama, st.gNamaTeks]} numberOfLines={1}>{ORANG[id].panggilan}</Text>
          {grid[r].map(({ h, absen }, i) => {
            const kode = absen ? h.status.slice(0, 1).toUpperCase() : h.shift === 'libur' ? 'L' : SHIFT[h.shift].nama.slice(0, 2);
            return (
              <View
                key={i}
                accessible
                accessibilityLabel={`${ORANG[id].panggilan}, ${NAMA_HARI[i]} ${pekan[i].d}: ${absen ? h.status : h.shift === 'libur' ? 'libur' : `shift ${SHIFT[h.shift].nama}`}`}
                style={[
                  st.gSel,
                  { backgroundColor: absen ? W.unguMuda : h.shift === 'libur' ? 'transparent' : WARNA_SHIFT[h.shift] },
                  absen && { borderColor: W.ungu, borderStyle: 'dashed' },
                  h.shift === 'libur' && !absen && { borderColor: W.garisTegas },
                ]}
              >
                <Text style={[st.gKode, absen && { color: W.ungu }, h.shift === 'libur' && !absen && { color: W.tinta2 }]}>{kode}</Text>
              </View>
            );
          })}
        </View>
      ))}
      <Text style={st.legTeks}>Pa = Pagi 06–14 · Si = Siang 10–18 · So = Sore 13–21 · L = libur · S/C/I = sakit/cuti/izin</Text>
      {celah.length > 0 && (
        <View style={{ gap: 4, marginTop: 4 }}>
          {celah.map((c) => (
            <Teks key={c} v="kecil" warna={W.stempelTua}>• {c}</Teks>
          ))}
        </View>
      )}
    </Kartu>
  );
}

function Antrean({ p, putus }: { p: Pengajuan; putus: (t: Tunda) => void }) {
  const [tolak, setTolak] = useState(false);
  const [catatan, setCatatan] = useState('');
  const idLabel = `catatan-${p.id}`;
  const nama = ORANG[p.orang].panggilan;
  const jenis = NAMA_JENIS[p.jenis].toLowerCase();
  return (
    <KartuPengajuan p={p} denganOrang>
      {tolak ? (
        <View style={{ gap: 8 }}>
          <Teks v="label" warna={W.tinta2} nativeID={idLabel}>Alasan penolakan untuk {nama}</Teks>
          <TextInput
            value={catatan}
            onChangeText={setCatatan}
            placeholder="Misal: gerai kekurangan orang di tanggal itu"
            placeholderTextColor="#6E6253"
            aria-labelledby={idLabel}
            accessibilityLabelledBy={idLabel}
            style={st.input}
            multiline
          />
          <View style={st.aksi}>
            <Tombol varian="garis" label="Batal" onPress={() => setTolak(false)} style={{ flex: 1 }} />
            <Tombol
              varian="stempel"
              label="Kirim penolakan"
              disabled={catatan.trim().length < 5}
              onPress={() => putus({ id: p.id, status: 'ditolak', catatan: catatan.trim(), teks: `${NAMA_JENIS[p.jenis]} ${nama} ditolak` })}
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      ) : (
        <View style={st.aksi}>
          <Tombol varian="garis" ikon="silang" label="Tolak" keterangan={`Tolak ${jenis} ${nama}`} onPress={() => setTolak(true)} style={{ flex: 1 }} />
          <Tombol
            varian="utama"
            ikon="centang"
            label="Setujui"
            keterangan={`Setujui ${jenis} ${nama}`}
            onPress={() =>
              putus({
                id: p.id,
                status: 'disetujui',
                catatan: p.jenis === 'lembur' ? 'Lembur disetujui, masuk slip bulan ini.' : p.jenis === 'tukar' ? 'Disetujui, jadwal sudah ditukar.' : 'Disetujui.',
                teks: `${NAMA_JENIS[p.jenis]} ${nama} disetujui`,
              })
            }
            style={{ flex: 1.4 }}
          />
        </View>
      )}
    </KartuPengajuan>
  );
}

const st = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: W.unguMuda, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#C9C1E4' },
  bento: { flexDirection: 'row', gap: 10 },
  ubin: { flex: 1, borderRadius: 20, padding: 12, justifyContent: 'space-between', minHeight: 104 },
  ubinLabel: { ...H.monoTebal, fontSize: 12, letterSpacing: 0.8, color: W.tinta2, textTransform: 'uppercase' },
  celah: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: W.stempelMuda, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#E8B9AA' },
  papanKepala: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  papanSkala: { ...H.mono, fontSize: 12, color: W.tinta2 },
  papan: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: W.garis },
  papanAtas: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  papanNama: { ...H.isiTebal, fontSize: 14.5, color: W.tinta },
  papanKet: { ...H.monoTebal, fontSize: 12, textAlign: 'right', flexShrink: 1 },
  bilah: { height: 14, borderRadius: 4, backgroundColor: W.kertas2, borderWidth: 1, borderColor: W.garis, position: 'relative' },
  blok: { position: 'absolute', top: 1, bottom: 1, borderRadius: 3, borderWidth: 1, borderColor: W.tinta },
  titik: { position: 'absolute', top: 1, width: 10, height: 10, borderRadius: 5, marginLeft: -5, borderWidth: 1.5, borderColor: W.kertas },
  kini: { position: 'absolute', top: -4, bottom: -4, width: 2, marginLeft: -1, backgroundColor: W.tinta },
  legenda: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 6 },
  titikLeg: { width: 10, height: 10, borderRadius: 5 },
  kiniLeg: { width: 2, height: 12, backgroundColor: W.tinta },
  legTeks: { ...H.mono, fontSize: 12, color: W.tinta2, marginRight: 6 },
  gBaris: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gNama: { width: 52 },
  gNamaTeks: { ...H.isiTebal, fontSize: 13, color: W.tinta },
  gKepala: { flex: 1, alignItems: 'center', paddingVertical: 2, borderRadius: 6 },
  gHariIni: { backgroundColor: W.kunyitMuda },
  gHari: { ...H.monoTebal, fontSize: 12, color: W.tinta2 },
  gTgl: { ...H.display, fontSize: 18, color: W.tinta },
  gSel: { flex: 1, height: 32, borderRadius: 7, borderWidth: 1, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  gKode: { ...H.monoTebal, fontSize: 12, color: W.tinta },
  aksi: { flexDirection: 'row', gap: 8, marginTop: 4 },
  input: {
    ...H.isi, fontSize: 15, minHeight: 64, borderWidth: 1.5, borderColor: W.garisTegas, borderRadius: 14, padding: 12,
    backgroundColor: '#FFFDF6', color: W.tinta, textAlignVertical: 'top',
  },
  kembali: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', minHeight: 52, borderRadius: 16, borderWidth: 1.5, borderColor: W.tinta, marginTop: 6 },
  snack: {
    position: 'absolute', left: 12, right: 12, bottom: 14, backgroundColor: W.jelaga, borderRadius: 16, paddingLeft: 16, paddingRight: 6,
    minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 3, borderTopColor: W.stempel,
  },
  snackTeks: { ...H.isiSedang, fontSize: 14.5, color: W.diJelaga, flex: 1 },
  snackTombol: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10 },
  snackAksi: { ...H.monoTebal, fontSize: 13, letterSpacing: 1.2, color: W.kunyit },
});
