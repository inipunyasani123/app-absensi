import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gerigi } from '@/components/Gerigi';
import { Kartu, Kerangka, Layar, Segmen, Tautan, Teks } from '@/components/ui';
import { Ikon } from '@/components/Ikon';
import { CABANG, ORANG, PERUSAHAAN, SAYA_ID } from '@/lib/data';
import { Baris, UPAH, hitungSlip } from '@/lib/gaji';
import { meta } from '@/lib/meta';
import { Rekap, rekapBulan } from '@/lib/riwayat';
import { useGilir } from '@/lib/store';
import { BULAN_PENDEK, NAMA_BULAN, geserBulan, jumlahHari, rupiah } from '@/lib/waktu';
import { H, W } from '@/theme';

export function generateMetadata() {
  return meta('/gaji', 'Slip Gaji Contoh · Gilir', 'Slip gaji contoh dengan komponen jelas: gaji pokok, uang makan, lembur 1/173, tunjangan kehadiran, BPJS, dan PPh 21. Angka rekaan, demo Gilir.');
}

const saya = ORANG[SAYA_ID];

const REKAP_KOSONG: Rekap = {
  y: 2026, m: 1, hari: [], hariKerja: 0, hadir: 0, telat: 0, telatMenit: 0, izin: 0, sakit: 0, cuti: 0, alpa: 0,
  lemburMenit: 0, lemburMenunggu: 0, rataSelisihMasuk: null, persen: null,
};

export default function Gaji() {
  const { siap } = useGilir();
  return (
    <Layar tab sub="Slip gaji karyawan" judul="Gaji">
      <Isi />
    </Layar>
  );
}

function Isi() {
  const ctx = useGilir();
  const [geser, setGeser] = useState<'1' | '2' | '3'>('1');
  const bln = geserBulan(ctx.hariIni.y, ctx.hariIni.m, -Number(geser));
  const bayar = geserBulan(bln.y, bln.m, 1);
  // Sebelum data siap: struktur slip yang sama dengan nilai "Rp–" (tanpa angka yang lalu melompat).
  const siap = ctx.siap;
  const r = useMemo(() => (siap ? rekapBulan(SAYA_ID, bln.y, bln.m, ctx) : REKAP_KOSONG), [bln.y, bln.m, ctx, siap]);
  const slip = hitungSlip(r);
  const uang = (n: number) => (siap ? rupiah(n) : 'Rp–');
  const bulanNama = siap ? `${NAMA_BULAN[bln.m - 1]} ${bln.y}` : 'bulan lalu';
  const pilihan = (['1', '2', '3'] as const).map((g) => {
    const b = geserBulan(ctx.hariIni.y, ctx.hariIni.m, -Number(g));
    return { nilai: g, label: siap ? `${BULAN_PENDEK[b.m - 1]} ${String(b.y).slice(2)}` : ['Bulan lalu', '2 bln lalu', '3 bln lalu'][Number(g) - 1] };
  });

  return (
    <>
      <Segmen label="Pilih periode gaji" nilai={geser} ubah={setGeser} pilihan={pilihan} />

      <View style={st.hero} accessible accessibilityLabel={siap ? `Gaji diterima ${bulanNama}: ${rupiah(slip.bersih)}` : 'Gaji diterima sedang dihitung'}>
        <Teks v="label" warna={W.diJelaga2}>Diterima · {bulanNama}</Teks>
        <Teks v="raksasa" warna={W.diJelaga} style={{ fontSize: 50, lineHeight: 54 }} numberOfLines={1} adjustsFontSizeToFit>
          {uang(slip.bersih)}
        </Teks>
        <Teks v="monoKecil" warna={W.diJelaga2}>
          Ditransfer {siap ? `1 ${NAMA_BULAN[bayar.m - 1]} ${bayar.y}` : 'tiap tanggal 1'} ke rekening gaji •••• 4721
        </Teks>
        <View style={st.heroBaris}>
          <Mini label="Hadir" nilai={siap ? `${slip.hadir} hr` : '– hr'} />
          <Mini label="Lembur" nilai={siap ? `${String(slip.lemburJam).replace('.', ',')} jam` : '– jam'} />
          <Mini label="Telat" nilai={siap ? `${r.telat}×` : '–×'} />
        </View>
      </View>

      <View style={st.struk} {...({ role: 'region', 'aria-label': 'Rincian slip gaji' } as object)}>
        <Gerigi />
        <View style={st.strukIsi}>
          <Text style={st.strukJudul}>{PERUSAHAAN.nama.toUpperCase()}</Text>
          <Text style={st.strukSub}>SLIP GAJI · PERIODE {siap ? `1–${jumlahHari(bln.y, bln.m)} ${NAMA_BULAN[bln.m - 1].toUpperCase()} ${bln.y}` : 'BULAN LALU'}</Text>
          <View style={st.garisPutus} />
          <Info k="Nama" v={saya.nama} />
          <Info k="NIK" v={saya.nik} />
          <Info k="Jabatan" v={saya.jabatan} />
          <Info k="Cabang" v={CABANG[saya.cabang].nama} />
          <Info k="Status PTKP" v="TK/0" />
          <Teks v="judul" tingkat={2} style={st.bagian}>Pendapatan</Teks>
          {slip.pendapatan.map((b) => <BarisUang key={b.label} b={b} kosong={!siap} />)}
          <Total label="Total pendapatan" nilai={slip.bruto} kosong={!siap} />
          <Teks v="judul" tingkat={2} style={st.bagian}>Potongan</Teks>
          {slip.potongan.map((b) => <BarisUang key={b.label} b={b} minus kosong={!siap} />)}
          <Total label="Total potongan" nilai={-slip.totalPotongan} kosong={!siap} />
          <View style={st.diterima}>
            <Text style={st.diterimaLabel}>DITERIMA</Text>
            <Text style={st.diterimaNilai}>{uang(slip.bersih)}</Text>
          </View>
        </View>
        <Gerigi bawah />
      </View>

      <Kartu style={{ gap: 6 }} label="Dasar perhitungan">
        <Teks v="judul" tingkat={2}>Dasar perhitungan</Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Upah per jam lembur = 1/173 × (gaji pokok + tunjangan tetap) = {rupiah(slip.upahJam)}. Jam pertama dibayar 1,5×, jam berikutnya 2×, dibulatkan per setengah jam.
        </Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Uang makan {rupiah(UPAH.makan)} dan transport {rupiah(UPAH.transport)} per hari hadir. Tunjangan kehadiran {rupiah(UPAH.kehadiran)} bila telat paling banyak 2 kali dan tanpa alpa.
        </Teks>
        <Teks v="kecil" warna={W.tinta2}>
          Ditanggung perusahaan di luar slip: BPJS Kesehatan 4%, JHT 3,7%, JP 2%, JKK 0,24%, JKM 0,3%.
        </Teks>
        <Tautan href="/rekap" style={st.tautanRekap}>
          <Teks v="subjudul" style={{ flex: 1, fontSize: 15 }}>
            {siap ? `Lihat ${String(slip.lemburJam).replace('.', ',')} jam lembur & ${slip.hadir} hari hadir di Rekap` : 'Lihat lembur & hari hadir di Rekap'}
          </Teks>
          <Ikon nama="kanan" />
        </Tautan>
      </Kartu>
      <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center' }}>
        Slip contoh dengan angka rekaan untuk demo. Rumus disesuaikan dengan aturan perusahaan klien.
      </Teks>
    </>
  );
}

function Mini({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={st.mini}>
      <Text style={st.miniLabel}>{label}</Text>
      <Text style={st.miniNilai}>{nilai}</Text>
    </View>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <View style={st.info}>
      <Text style={st.infoK}>{k}</Text>
      <Text style={st.infoV}>{v}</Text>
    </View>
  );
}

function BarisUang({ b, minus, kosong }: { b: Baris; minus?: boolean; kosong?: boolean }) {
  return (
    <View style={st.baris}>
      <View style={{ flex: 1 }}>
        <Text style={st.barisLabel}>{b.label}</Text>
        {b.catatan ? <Text style={st.barisCatatan}>{kosong ? 'menghitung…' : b.catatan}</Text> : null}
      </View>
      <Text style={st.barisNilai}>{kosong ? 'Rp–' : minus && b.nilai ? rupiah(-b.nilai) : rupiah(b.nilai)}</Text>
    </View>
  );
}

function Total({ label, nilai, kosong }: { label: string; nilai: number; kosong?: boolean }) {
  return (
    <View style={[st.baris, st.total]}>
      <Text style={[st.barisLabel, { ...H.isiTebal }]}>{label}</Text>
      <Text style={[st.barisNilai, { ...H.monoTebal }]}>{kosong ? 'Rp–' : rupiah(nilai)}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  tautanRekap: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderTopWidth: 1, borderColor: W.garis, paddingTop: 8, marginTop: 4 },
  hero: { backgroundColor: W.jelaga, borderRadius: 22, padding: 16, gap: 6 },
  heroBaris: { flexDirection: 'row', gap: 8, marginTop: 6 },
  mini: { flex: 1, backgroundColor: '#2E2820', borderRadius: 12, padding: 8 },
  miniLabel: { ...H.monoTebal, fontSize: 12, letterSpacing: 0.8, color: W.diJelaga2, textTransform: 'uppercase' },
  miniNilai: { ...H.display, fontSize: 20, color: W.diJelaga },
  struk: { marginHorizontal: 4 },
  strukIsi: { backgroundColor: '#FFFDF6', paddingHorizontal: 16, paddingVertical: 8, gap: 2 },
  strukJudul: { ...H.display, fontSize: 24, color: W.tinta, textAlign: 'center', letterSpacing: 1 },
  strukSub: { ...H.monoTebal, fontSize: 12, color: W.tinta2, textAlign: 'center', letterSpacing: 0.8 },
  garisPutus: { borderBottomWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTegas, marginVertical: 10 },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, gap: 12 },
  infoK: { ...H.mono, fontSize: 12.5, color: W.tinta2 },
  infoV: { ...H.isiSedang, fontSize: 13.5, color: W.tinta, flexShrink: 1, textAlign: 'right' },
  bagian: { marginTop: 14, marginBottom: 4, fontSize: 20 },
  baris: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#EFE7D6', gap: 10 },
  barisLabel: { ...H.isi, fontSize: 14, color: W.tinta },
  barisCatatan: { ...H.mono, fontSize: 12, color: W.tinta2, marginTop: 1 },
  barisNilai: { ...H.mono, fontSize: 13.5, color: W.tinta, textAlign: 'right' },
  total: { borderBottomWidth: 0, borderTopWidth: 1.5, borderTopColor: W.tinta, marginTop: 2 },
  diterima: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingVertical: 10, borderTopWidth: 2, borderBottomWidth: 2, borderColor: W.tinta },
  diterimaLabel: { ...H.display, fontSize: 22, color: W.tinta, letterSpacing: 1 },
  diterimaNilai: { ...H.monoTebal, fontSize: 18, color: W.tinta },
});
