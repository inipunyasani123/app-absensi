import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ikon } from '@/components/Ikon';
import { Avatar } from '@/components/Ilustrasi';
import { KartuPengajuan } from '@/components/KartuPengajuan';
import { Kartu, Kerangka, Layar, Tautan, Teks, Tombol } from '@/components/ui';
import { NAMA_JENIS, ORANG, Pengajuan, SAYA_ID, SHIFT, TIM_KOTA } from '@/lib/data';
import { meta } from '@/lib/meta';
import { hari } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { jam } from '@/lib/waktu';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/atasan', 'Mode Atasan: Persetujuan Tim · Gilir', 'Mode kepala gerai di demo Gilir: lihat siapa yang sudah hadir hari ini, lalu setujui atau tolak cuti, izin, sakit, dan lembur tim.');
}

const bayu = ORANG.bayu;

export default function Atasan() {
  const { siap } = useGilir();
  return (
    <Layar kembali sub={`Mode atasan · ${bayu.nama}`} judul="Persetujuan tim">
      {siap ? <Isi /> : <Kerangka tinggi={300} lebar="100%" />}
    </Layar>
  );
}

function Isi() {
  const ctx = useGilir();
  const tim = TIM_KOTA.filter((id) => id !== 'bayu').map((id) => ({ id, h: hari(id, ctx.hariIni, ctx) }));
  const terjadwal = tim.filter((t) => t.h.status !== 'libur');
  const hadir = terjadwal.filter((t) => t.h.masuk != null);
  const telat = terjadwal.filter((t) => t.h.telatMenit);
  const menunggu = ctx.menunggu;
  const diputuskan = ctx.pengajuan.filter((p) => p.status !== 'menunggu' && p.orang !== 'bayu').slice(0, 5);

  return (
    <>
      <View style={st.banner}>
        <Avatar rupa={bayu.rupa} ukuran={52} />
        <View style={{ flex: 1, gap: 2 }}>
          <Teks v="subjudul" warna={W.ungu}>Kamu melihat sebagai {bayu.panggilan}</Teks>
          <Teks v="kecil" warna={W.ungu}>Keputusan di sini langsung mengubah status pengajuan di akun {ORANG[SAYA_ID].panggilan}.</Teks>
        </View>
      </View>

      <View style={st.bento}>
        <View style={[st.ubin, { backgroundColor: W.jelaga, flex: 1.3 }]} accessible accessibilityLabel={`Hadir hari ini ${hadir.length} dari ${terjadwal.length}`}>
          <Teks v="label" warna={W.diJelaga2}>Hadir hari ini</Teks>
          <Teks v="raksasa" warna={W.diJelaga} style={{ fontSize: 56, lineHeight: 58 }}>
            {hadir.length}<Text style={{ fontSize: 28, color: W.diJelaga2 }}>/{terjadwal.length}</Text>
          </Teks>
        </View>
        <View style={[st.ubin, { backgroundColor: W.stempelMuda, borderColor: '#E8B9AA', borderWidth: 1 }]}>
          <Teks v="label" warna={W.stempelTua}>Menunggu</Teks>
          <Teks v="angka" warna={W.stempelTua}>{menunggu.length}</Teks>
        </View>
        <View style={[st.ubin, { backgroundColor: W.kertas, borderColor: W.garis, borderWidth: 1 }]}>
          <Teks v="label" warna={W.tinta2}>Telat</Teks>
          <Teks v="angka">{telat.length}</Teks>
        </View>
      </View>

      <Kartu lubang style={{ gap: 4 }} label="Papan hadir hari ini">
        <Teks v="judul" tingkat={2} style={{ marginBottom: 4 }}>Papan hadir</Teks>
        {tim.map(({ id, h }) => {
          const o = ORANG[id];
          let ket: string;
          let warna: string = W.tinta2;
          if (h.status === 'libur') ket = 'Libur';
          else if (h.status === 'cuti' || h.status === 'izin' || h.status === 'sakit') {
            ket = `${h.status[0].toUpperCase()}${h.status.slice(1)}${h.pengajuan?.status === 'menunggu' ? ' (menunggu)' : ''}`;
            warna = W.ungu;
          } else if (h.masuk != null) {
            ket = `${h.telatMenit ? 'Telat' : 'Masuk'} ${jam(h.masuk)}${h.pulang != null ? ` · pulang ${jam(h.pulang)}` : ''}`;
            warna = h.telatMenit ? W.stempelTua : W.hijauTua;
          } else ket = 'Belum masuk';
          return (
            <View key={id} style={st.papan}>
              <Avatar rupa={o.rupa} ukuran={38} />
              <View style={{ flex: 1 }}>
                <Teks v="subjudul" style={{ fontSize: 15 }}>{o.nama}</Teks>
                <Teks v="monoKecil" warna={W.tinta2}>{h.shift === 'libur' ? '—' : `${SHIFT[h.shift].nama} ${jam(SHIFT[h.shift].mulai)}–${jam(SHIFT[h.shift].selesai)}`}</Teks>
              </View>
              <Text style={[st.papanKet, { color: warna }]}>{ket}</Text>
            </View>
          );
        })}
      </Kartu>

      <Teks v="judul" tingkat={2} style={{ marginTop: 4 }}>Antrean persetujuan</Teks>
      {menunggu.length === 0 && (
        <Kartu nada="hijau">
          <Teks warna={W.hijauTua}>Semua pengajuan sudah diputuskan. Ajukan cuti atau lembur sebagai {ORANG[SAYA_ID].panggilan} untuk mencobanya lagi.</Teks>
        </Kartu>
      )}
      <View style={{ gap: 10 }} {...({ role: 'list' } as object)}>
        {menunggu.map((p) => (
          <View key={p.id} {...({ role: 'listitem' } as object)}>
            <Antrean p={p} />
          </View>
        ))}
      </View>

      {diputuskan.length > 0 && (
        <>
          <Teks v="judul" tingkat={2} style={{ marginTop: 4 }}>Baru diputuskan</Teks>
          <View style={{ gap: 10 }}>
            {diputuskan.map((p) => <KartuPengajuan key={p.id} p={p} denganOrang />)}
          </View>
        </>
      )}

      <Tautan href="/" label="Kembali ke mode karyawan" style={st.kembali}>
        <Ikon nama="orang" />
        <Teks v="subjudul">Kembali ke mode karyawan</Teks>
      </Tautan>
    </>
  );
}

function Antrean({ p }: { p: Pengajuan }) {
  const { putuskan } = useGilir();
  const [tolak, setTolak] = useState(false);
  const [catatan, setCatatan] = useState('');
  const idLabel = `catatan-${p.id}`;
  return (
    <KartuPengajuan p={p} denganOrang>
      {tolak ? (
        <View style={{ gap: 8 }}>
          <Teks v="label" warna={W.tinta2} nativeID={idLabel}>Alasan penolakan untuk {ORANG[p.orang].panggilan}</Teks>
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
              onPress={() => putuskan(p.id, 'ditolak', catatan.trim())}
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      ) : (
        <View style={st.aksi}>
          <Tombol
            varian="garis"
            ikon="silang"
            label="Tolak"
            keterangan={`Tolak ${NAMA_JENIS[p.jenis].toLowerCase()} ${ORANG[p.orang].panggilan}`}
            onPress={() => setTolak(true)}
            style={{ flex: 1 }}
          />
          <Tombol
            varian="utama"
            ikon="centang"
            label="Setujui"
            keterangan={`Setujui ${NAMA_JENIS[p.jenis].toLowerCase()} ${ORANG[p.orang].panggilan}`}
            onPress={() => putuskan(p.id, 'disetujui', p.jenis === 'lembur' ? 'Lembur disetujui, masuk slip bulan ini.' : 'Disetujui.')}
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
  papan: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderColor: W.garis },
  papanKet: { ...H.monoTebal, fontSize: 12, textAlign: 'right', maxWidth: 120 },
  aksi: { flexDirection: 'row', gap: 8, marginTop: 4 },
  input: {
    ...H.isi, fontSize: 15, minHeight: 64, borderWidth: 1.5, borderColor: W.garisTegas, borderRadius: 14, padding: 12,
    backgroundColor: '#FFFDF8', color: W.tinta, textAlignVertical: 'top',
  },
  kembali: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', minHeight: 52, borderRadius: 16, borderWidth: 1.5, borderColor: W.tinta, marginTop: 6 },
});
