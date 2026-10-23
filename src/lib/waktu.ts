// Semua logika tanggal memakai jam dinding WIB (UTC+7), apa pun zona waktu perangkat.
// Tanggal disimpan sebagai objek {y, m, d} (m = 1–12) dan kunci "YYYY-MM-DD".

export const WIB_MS = 7 * 60 * 60 * 1000;

export type Tgl = { y: number; m: number; d: number };

export const NAMA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Jam dinding WIB sekarang: tanggal + menit sejak 00.00 + detik. */
export function sekarangWIB(ms: number = Date.now()) {
  const w = new Date(ms + WIB_MS);
  return {
    tgl: { y: w.getUTCFullYear(), m: w.getUTCMonth() + 1, d: w.getUTCDate() } as Tgl,
    menit: w.getUTCHours() * 60 + w.getUTCMinutes(),
    detik: w.getUTCSeconds(),
  };
}

const dua = (n: number) => String(n).padStart(2, '0');

export function kunci(t: Tgl) {
  return `${t.y}-${dua(t.m)}-${dua(t.d)}`;
}

export function dariKunci(k: string): Tgl {
  const [y, m, d] = k.split('-').map(Number);
  return { y, m, d };
}

/** Nomor hari sejak 1 Jan 1970 (dipakai untuk selisih & generator). */
export function nomorHari(t: Tgl) {
  return Math.floor(Date.UTC(t.y, t.m - 1, t.d) / 86400000);
}

export function dariNomor(n: number): Tgl {
  const w = new Date(n * 86400000);
  return { y: w.getUTCFullYear(), m: w.getUTCMonth() + 1, d: w.getUTCDate() };
}

export function tambahHari(t: Tgl, n: number) {
  return dariNomor(nomorHari(t) + n);
}

/** 0 = Senin … 6 = Minggu */
export function hariDalamPekan(t: Tgl) {
  return (new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay() + 6) % 7;
}

export function awalPekan(t: Tgl) {
  return tambahHari(t, -hariDalamPekan(t));
}

export function jumlahHari(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function geserBulan(y: number, m: number, n: number) {
  const total = y * 12 + (m - 1) + n;
  return { y: Math.floor(total / 12), m: (total % 12) + 1 };
}

export function sama(a: Tgl, b: Tgl) {
  return a.y === b.y && a.m === b.m && a.d === b.d;
}

export function banding(a: Tgl, b: Tgl) {
  return nomorHari(a) - nomorHari(b);
}

/** "06.00" — gaya penulisan jam Indonesia memakai titik. */
export function jam(menit: number) {
  const m = ((Math.round(menit) % 1440) + 1440) % 1440;
  return `${dua(Math.floor(m / 60))}.${dua(m % 60)}`;
}

/** "1 jam 30 menit", "45 menit" */
export function durasi(menit: number) {
  const m = Math.max(0, Math.round(menit));
  const j = Math.floor(m / 60);
  const s = m % 60;
  if (j && s) return `${j} jam ${s} menit`;
  if (j) return `${j} jam`;
  return `${s} menit`;
}

/** "4 j 13 m", "45 m" — versi ringkas untuk baris sempit. */
export function durasiPendek(menit: number) {
  const m = Math.max(0, Math.round(menit));
  const j = Math.floor(m / 60);
  const s = m % 60;
  if (j && s) return `${j} j ${s} m`;
  if (j) return `${j} j`;
  return `${s} m`;
}

/** 90 → "1,5" */
export function jamDesimal(menit: number) {
  const v = Math.round((menit / 60) * 10) / 10;
  return String(v).replace('.', ',');
}

export function tanggalPanjang(t: Tgl) {
  return `${NAMA_HARI[hariDalamPekan(t)]}, ${t.d} ${NAMA_BULAN[t.m - 1]} ${t.y}`;
}

export function tanggalSedang(t: Tgl) {
  return `${t.d} ${NAMA_BULAN[t.m - 1]} ${t.y}`;
}

export function tanggalPendek(t: Tgl) {
  return `${t.d} ${BULAN_PENDEK[t.m - 1]}`;
}

export function rentang(a: Tgl, b: Tgl) {
  if (sama(a, b)) return tanggalPendek(a);
  if (a.m === b.m && a.y === b.y) return `${a.d}–${b.d} ${BULAN_PENDEK[a.m - 1]}`;
  return `${tanggalPendek(a)} – ${tanggalPendek(b)}`;
}

/** Sebutan relatif: "hari ini", "kemarin", "besok", "3 hari lagi", "5 hari lalu". */
export function relatif(t: Tgl, hariIni: Tgl) {
  const s = banding(t, hariIni);
  if (s === 0) return 'hari ini';
  if (s === -1) return 'kemarin';
  if (s === 1) return 'besok';
  return s > 0 ? `${s} hari lagi` : `${-s} hari lalu`;
}

/** Bilangan semu-acak yang stabil untuk satu kunci (generator data contoh). */
export function acak(kunciTeks: string) {
  let h = 2166136261;
  for (let i = 0; i < kunciTeks.length; i++) {
    h ^= kunciTeks.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function rupiah(n: number) {
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '−' : ''}Rp${s}`;
}
