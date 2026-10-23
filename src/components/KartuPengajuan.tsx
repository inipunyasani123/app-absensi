import { StyleSheet, Text, View } from 'react-native';
import { NAMA_JENIS, ORANG, Pengajuan, SHIFT, shiftTerjadwal } from '@/lib/data';
import { BULAN_PENDEK, HARI_PENDEK, Tgl, dariKunci, durasi, hariDalamPekan, jam, rentang, tanggalPendek } from '@/lib/waktu';
import { H, W } from '@/theme';
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
  if (p.jenis === 'tukar') return `${tanggalPendek(a)} · ${teksTukar(p)}`;
  return `${rentang(a, dariKunci(p.selesai))} · ${p.hari ?? 0} hari kerja`;
}

export function teksTukar(p: Pengajuan) {
  const t = dariKunci(p.mulai);
  const a = ORANG[p.orang];
  const b = p.rekan ? ORANG[p.rekan] : null;
  const sa = SHIFT[shiftTerjadwal(p.orang, t)].nama;
  const sb = p.rekan ? SHIFT[shiftTerjadwal(p.rekan, t)].nama : '—';
  return `${a.panggilan} ${sa} ⇄ ${b?.panggilan ?? '—'} ${sb}`;
}

/** Sobekan kalender kecil: bulan, tanggal, hari. */
export function ChipTanggal({ t }: { t: Tgl }) {
  return (
    <View style={st.sobek} aria-hidden>
      <Text style={st.sobekBulan}>{BULAN_PENDEK[t.m - 1]}</Text>
      <Text style={st.sobekTgl}>{t.d}</Text>
      <Text style={st.sobekHari}>{HARI_PENDEK[hariDalamPekan(t)]}</Text>
    </View>
  );
}

export const NADA_JENIS = { cuti: 'kunyit', izin: 'ungu', sakit: 'stempel', lembur: 'hijau', tukar: 'jelaga' } as const;

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
      <View style={st.waktu}>
        <ChipTanggal t={dariKunci(p.mulai)} />
        {p.selesai !== p.mulai && (
          <>
            <Text style={st.panah} aria-hidden>→</Text>
            <ChipTanggal t={dariKunci(p.selesai)} />
          </>
        )}
        <Teks v="mono" style={{ flex: 1 }}>
          {p.jenis === 'lembur'
            ? `${jam(p.jamMulai ?? 0)}–${jam((p.jamMulai ?? 0) + (p.lemburMenit ?? 0))} · ${durasi(p.lemburMenit ?? 0)}`
            : p.jenis === 'tukar'
              ? teksTukar(p)
              : `${p.hari ?? 0} hari kerja`}
        </Teks>
      </View>
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
  waktu: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panah: { ...H.monoTebal, fontSize: 18, color: W.stempel },
  sobek: { width: 50, borderRadius: 8, borderWidth: 1.5, borderColor: W.tinta, backgroundColor: W.kertas, alignItems: 'center', overflow: 'hidden', paddingBottom: 3 },
  sobekBulan: { alignSelf: 'stretch', textAlign: 'center', backgroundColor: W.stempel, color: '#FFF8EE', ...H.monoTebal, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', paddingVertical: 1 },
  sobekTgl: { ...H.display, fontSize: 26, lineHeight: 28, color: W.tinta },
  sobekHari: { ...H.monoTebal, fontSize: 12, color: W.tinta2 },
  kartu: { backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 8 },
  atas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  orang: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  alasan: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  catatan: { backgroundColor: W.kertas2, borderRadius: 12, padding: 10, gap: 2, borderLeftWidth: 3, borderLeftColor: W.tinta },
});
