import { ATURAN, KodeShift, SAYA_ID, SHIFT, pekanKe, shiftTerjadwal } from './data';
import { Hari, Konteks, hari, nilaiMasuk } from './riwayat';
import { Tgl, kunci, tambahHari } from './waktu';

export type Langkah = 'libur' | 'cuti' | 'masuk' | 'pulang' | 'selesai';

export function keadaanHariIni(ctx: Konteks) {
  const h: Hari = hari(SAYA_ID, ctx.hariIni, ctx);
  const sh = SHIFT[h.shift];
  const rec = ctx.simpanan.absen[kunci(ctx.hariIni)];
  let langkah: Langkah;
  if (h.status === 'libur') langkah = 'libur';
  else if (h.status === 'cuti' || h.status === 'izin' || h.status === 'sakit') langkah = 'cuti';
  else if (!rec?.masuk) langkah = 'masuk';
  else if (!rec.pulang) langkah = 'pulang';
  else langkah = 'selesai';
  const masuk = rec?.masuk ? nilaiMasuk(h.shift, rec.masuk.menit) : null;
  const buka = sh.mulai - ATURAN.bukaAbsen;
  return { h, sh, rec, langkah, masuk, buka, simulasi: !!ctx.simpanan.override[kunci(ctx.hariIni)] };
}

/** Shift rotasi pekan ini (dipakai untuk "simulasikan hari kerja" saat libur). */
export function shiftPekanIni(t: Tgl): KodeShift {
  for (let i = 0; i < 7; i++) {
    const s = shiftTerjadwal(SAYA_ID, tambahHari(t, i - 3));
    if (s !== 'libur') return s;
  }
  return 'pagi';
}

export function shiftBerikutnya(t: Tgl) {
  for (let i = 1; i < 8; i++) {
    const d = tambahHari(t, i);
    const s = shiftTerjadwal(SAYA_ID, d);
    if (s !== 'libur') return { tgl: d, shift: SHIFT[s] };
  }
  return null;
}

export { pekanKe };
