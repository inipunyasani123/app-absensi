import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ikon, NamaIkon } from '@/components/Ikon';
import { Avatar } from '@/components/Ilustrasi';
import { Logo } from '@/components/Logo';
import { Kartu, Layar, Tautan, Teks, Tombol } from '@/components/ui';
import { APLIKASI, ATURAN, CABANG, ORANG, PERUSAHAAN, SAYA_ID } from '@/lib/data';
import { meta } from '@/lib/meta';
import { Href, router } from '@/lib/nav';
import { useGilir } from '@/lib/store';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/profil', 'Profil & Kartu Karyawan · Gilir', 'Kartu karyawan digital, data cabang dan atasan, aturan kehadiran, serta pengaturan data demo di aplikasi absensi Gilir buatan PintuWeb.');
}

const saya = ORANG[SAYA_ID];

const MENU: { href: Href; ikon: NamaIkon; label: string; ket: string }[] = [
  { href: '/pengumuman', ikon: 'lonceng', label: 'Pengumuman HR', ket: 'pelatihan, aturan, slip terbit' },
  { href: '/atasan', ikon: 'tameng', label: 'Mode atasan', ket: `coba sebagai ${ORANG.bayu.nama}` },
  { href: '/gaji', ikon: 'dompet', label: 'Slip gaji', ket: 'tiga bulan terakhir' },
  { href: '/rekap', ikon: 'rekap', label: 'Rekap kehadiran', ket: 'telat, alpa, lembur' },
];

// Garis-garis dekoratif ala kode batang, diturunkan dari NIK.
const BATANG = `${saya.nik}${saya.bergabung}`.split('').flatMap((c, i) => [((c.charCodeAt(0) + i) % 3) + 1, ((c.charCodeAt(0) * 7 + i) % 2) + 1]);

export default function Profil() {
  const ctx = useGilir();
  const [yakin, setYakin] = useState(false);
  const cabang = CABANG[saya.cabang];
  return (
    <Layar kembali sub="Akun karyawan" judul="Profil">
      <View style={st.idKartu} accessible accessibilityLabel={`Kartu karyawan ${saya.nama}, ${saya.jabatan}, NIK ${saya.nik}, ${cabang.nama}`}>
        <View style={st.idAtas}>
          <Logo ukuran={34} />
          <View style={{ flex: 1 }}>
            <Text style={st.idPerusahaan}>{PERUSAHAAN.nama.toUpperCase()}</Text>
            <Text style={st.idJenis}>KARTU KARYAWAN</Text>
          </View>
        </View>
        <View style={st.idTengah}>
          <View style={st.idFoto}>
            <Avatar rupa={saya.rupa} ukuran={88} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={st.idNama}>{saya.nama}</Text>
            <Text style={st.idJabatan}>{saya.jabatan}</Text>
          </View>
        </View>
        <View style={st.idBawah}>
          <Kolom k="NIK" v={saya.nik} />
          <Kolom k="Cabang" v={cabang.nama} />
          <Kolom k="Sejak" v={saya.bergabung} />
        </View>
        <View style={st.batang} aria-hidden>
          {BATANG.map((w, i) => (
            <View key={i} style={{ width: w * 1.6, height: 30, backgroundColor: i % 2 ? 'transparent' : W.tinta }} />
          ))}
        </View>
      </View>

      <Kartu style={{ gap: 2 }} label="Data kerja">
        <Info k="Atasan langsung" v={`${ORANG.bayu.nama} · ${ORANG.bayu.jabatan}`} />
        <Info k="Lokasi absen" v={`${cabang.nama}, ${cabang.wilayah} · radius ${cabang.radius} m`} />
        <Info k="Pola kerja" v="6 hari kerja, shift bergilir tiap pekan" />
        <Info k="Toleransi telat" v={`${ATURAN.toleransiTelat} menit`} />
        <Info k="Jatah cuti" v={`${ATURAN.jatahCuti} hari per tahun`} terakhir />
      </Kartu>

      <View style={{ gap: 8 }} {...({ role: 'list' } as object)}>
        {MENU.map((m) => (
          <View key={m.label} {...({ role: 'listitem' } as object)}>
            <Tautan href={m.href} style={st.menu}>
              <View style={st.menuIkon}><Ikon nama={m.ikon} warna={W.diJelaga} /></View>
              <View style={{ flex: 1 }}>
                <Teks v="subjudul" style={{ fontSize: 15 }}>{m.label}</Teks>
                <Teks v="kecil" warna={W.tinta2}>{m.ket}</Teks>
              </View>
              <Ikon nama="kanan" />
            </Tautan>
          </View>
        ))}
      </View>

      <Kartu nada="polos" style={{ gap: 8 }} label="Data demo">
        <Teks v="judul" tingkat={2}>Data demo</Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Absen, pengajuan, dan keputusan atasan yang kamu buat tersimpan di perangkat ini saja. Riwayat contoh selalu dibuat ulang relatif terhadap tanggal hari ini (WIB).
        </Teks>
        <Tombol
          varian="garis"
          ikon="info"
          label="Putar ulang pengenalan"
          onPress={() => {
            ctx.setKenal(false);
            router.push('/');
          }}
        />
        {yakin ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Tombol varian="garis" label="Batal" onPress={() => setYakin(false)} style={{ flex: 1 }} />
            <Tombol
              varian="stempel"
              ikon="ulang"
              label="Ya, atur ulang"
              onPress={() => {
                ctx.aturUlang();
                setYakin(false);
              }}
              style={{ flex: 1.4 }}
            />
          </View>
        ) : (
          <Tombol varian="garis" ikon="ulang" label="Atur ulang data demo" onPress={() => setYakin(true)} />
        )}
      </Kartu>

      <Kartu nada="jelaga" style={{ gap: 8 }} label="Tentang aplikasi">
        <Teks v="label" warna={W.diJelaga2}>Tentang {APLIKASI.nama}</Teks>
        <Teks warna={W.diJelaga}>
          Demo aplikasi Android, iOS, dan web buatan PintuWeb (Tulungagung). Nama usaha, karyawan, dan angka di dalamnya rekaan.
        </Teks>
        <Tautan href={APLIKASI.kontak as Href} label="Pesan aplikasi seperti ini di PintuWeb" style={st.cta}>
          <Teks v="subjudul" warna={W.tinta}>Pesan aplikasi seperti ini</Teks>
          <Ikon nama="kanan" />
        </Tautan>
      </Kartu>
    </Layar>
  );
}

function Kolom({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={st.idK}>{k}</Text>
      <Text style={st.idV}>{v}</Text>
    </View>
  );
}

function Info({ k, v, terakhir }: { k: string; v: string; terakhir?: boolean }) {
  return (
    <View style={[st.info, terakhir && { borderBottomWidth: 0 }]}>
      <Teks v="label" warna={W.tinta2}>{k}</Teks>
      <Teks v="isi">{v}</Teks>
    </View>
  );
}

const st = StyleSheet.create({
  idKartu: { backgroundColor: W.kertas, borderRadius: 24, borderWidth: 2, borderColor: W.tinta, padding: 16, gap: 14 },
  idAtas: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1.5, borderColor: W.tinta, paddingBottom: 10 },
  idPerusahaan: { ...H.display, fontSize: 20, color: W.tinta, letterSpacing: 0.8 },
  idJenis: { ...H.monoTebal, fontSize: 12, color: W.stempel, letterSpacing: 1.6 },
  idTengah: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  idFoto: { borderRadius: 18, borderWidth: 2, borderColor: W.tinta, overflow: 'hidden' },
  idNama: { ...H.display, fontSize: 30, lineHeight: 32, color: W.tinta, textTransform: 'uppercase' },
  idJabatan: { ...H.isiSedang, fontSize: 14, color: W.tinta2 },
  idBawah: { flexDirection: 'row', gap: 8 },
  idK: { ...H.monoTebal, fontSize: 12, letterSpacing: 1.2, color: W.tinta2, textTransform: 'uppercase' },
  idV: { ...H.isiTebal, fontSize: 14, color: W.tinta },
  batang: { flexDirection: 'row', gap: 0, alignSelf: 'flex-start', marginTop: 2 },
  info: { paddingVertical: 8, borderBottomWidth: 1, borderColor: W.garis, gap: 2 },
  menu: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, padding: 12 },
  menuIkon: { width: 40, height: 40, borderRadius: 12, backgroundColor: W.jelaga, alignItems: 'center', justifyContent: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: W.kunyit, borderRadius: 14, paddingHorizontal: 14, minHeight: 50 },
});
