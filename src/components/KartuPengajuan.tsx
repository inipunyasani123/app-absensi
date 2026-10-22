import { StyleSheet, View } from 'react-native';
import { NAMA_JENIS, ORANG, Pengajuan } from '@/lib/data';
import { dariKunci, durasi, jam, rentang, tanggalPendek } from '@/lib/waktu';
import { W } from '@/theme';
import { Avatar, CatatanKertas, NotaKiriman, SuratDokter } from './Ilustrasi';
import { Chip, Stempel, Teks } from './ui';

export const WARNA_STATUS = {
  menunggu: { warna: W.stempel, teks: 'Menunggu' },
  disetujui: { warna: W.hijau, teks: 'Disetujui' },
  ditolak: { warna: W.tinta2, teks: 'Ditolak' },
};

export function ringkasWaktu(p: Pengajuan) {
  const a = dariKunci(p.mulai);
  if (p.jenis === 'lembur') return `${tanggalPendek(a)} · ${jam(p.jamMulai ?? 0)}–${jam((p.jamMulai ?? 0) + (p.lemburMenit ?? 0))} (${durasi(p.lemburMenit ?? 0)})`;
  return `${rentang(a, dariKunci(p.selesai))} · ${p.hari ?? 0} hari kerja`;
}

export const NADA_JENIS = { cuti: 'kunyit', izin: 'ungu', sakit: 'stempel', lembur: 'hijau' } as const;

/** Kartu pengajuan dengan cap status. `denganOrang` menampilkan avatar pengaju (mode atasan). */
export function KartuPengajuan({ p, denganOrang, children }: { p: Pengajuan; denganOrang?: boolean; children?: React.ReactNode }) {
  const s = WARNA_STATUS[p.status];
  const o = ORANG[p.orang];
  return (
    <View style={st.kartu} accessible={!children} accessibilityLabel={children ? undefined : `${NAMA_JENIS[p.jenis]}, ${ringkasWaktu(p)}, ${s.teks}. ${p.alasan}`}>
      <View style={st.atas}>
        {denganOrang ? (
          <View style={st.orang}>
            <Avatar rupa={o.rupa} ukuran={40} />
            <View style={{ flex: 1 }}>
              <Teks v="subjudul" style={{ fontSize: 15 }}>{o.nama}</Teks>
              <Teks v="kecil" warna={W.tinta2}>{o.jabatan}</Teks>
            </View>
          </View>
        ) : (
          <Chip teks={NAMA_JENIS[p.jenis]} nada={NADA_JENIS[p.jenis]} />
        )}
        <Stempel teks={s.teks} warna={s.warna} kecil miring={p.status === 'menunggu' ? -4 : 3} />
      </View>
      {denganOrang && <Chip teks={NAMA_JENIS[p.jenis]} nada={NADA_JENIS[p.jenis]} />}
      <Teks v="mono">{ringkasWaktu(p)}</Teks>
      <View style={st.alasan}>
        {p.bukti === 'surat-dokter' ? <SuratDokter ukuran={44} /> : p.bukti === 'foto-nota' ? <NotaKiriman ukuran={44} /> : <CatatanKertas ukuran={44} />}
        <View style={{ flex: 1, gap: 2 }}>
          <Teks v="isi">{p.alasan}</Teks>
          <Teks v="kecil" warna={W.tinta2}>
            {p.bukti === 'surat-dokter' ? 'Bukti: surat keterangan dokter' : p.bukti === 'foto-nota' ? 'Bukti: nota penerimaan barang' : 'Bukti: catatan'} · diajukan {tanggalPendek(dariKunci(p.dibuat))}
          </Teks>
        </View>
      </View>
      {p.catatanAtasan ? (
        <View style={st.catatan}>
          <Teks v="label" warna={W.tinta2}>Catatan {ORANG.bayu.panggilan}</Teks>
          <Teks v="kecil">{p.catatanAtasan}</Teks>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  kartu: { backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 8 },
  atas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  orang: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  alasan: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  catatan: { backgroundColor: W.kertas2, borderRadius: 12, padding: 10, gap: 2, borderLeftWidth: 3, borderLeftColor: W.tinta },
});
