// Slip gaji contoh. Angka rekaan, rumus mengikuti kebiasaan umum di Indonesia:
// upah lembur per jam = 1/173 × upah sebulan; jam pertama 1,5×, jam berikutnya 2×.
// Iuran BPJS bagian karyawan: Kesehatan 1%, JHT 2%, JP 1% dari upah (pokok + tunjangan tetap).
// PPh 21 memakai tarif efektif bulanan kategori A; penghasilan bruto ≤ Rp5,4 juta bertarif 0%.
import { insentifBulan } from './data';
import { Hari, Rekap } from './riwayat';

export const UPAH = {
  pokok: 2650000,
  tunjanganTetap: 150000,
  makan: 15000, // per hari hadir
  transport: 10000, // per hari hadir
  kehadiran: 100000, // bila telat ≤ 2× dan tanpa alpa
};

export type Baris = { label: string; nilai: number; catatan?: string };

export type Slip = {
  pendapatan: Baris[];
  potongan: Baris[];
  bruto: number;
  totalPotongan: number;
  bersih: number;
  hadir: number;
  lemburJam: number;
  upahJam: number;
};

function bayarLemburHari(menit: number, upahJam: number) {
  const jam = Math.floor(menit / 30) / 2; // dibulatkan ke bawah per setengah jam
  if (jam <= 0) return 0;
  const pertama = Math.min(1, jam);
  const sisa = Math.max(0, jam - 1);
  return pertama * 1.5 * upahJam + sisa * 2 * upahJam;
}

export function hitungSlip(r: Rekap): Slip {
  const upah = UPAH.pokok + UPAH.tunjanganTetap;
  const upahJam = upah / 173;
  const hadir = r.hadir;
  const lemburHari = r.hari.filter((h: Hari) => (h.lemburMenit ?? 0) > 0);
  const lembur = Math.round(lemburHari.reduce((s, h) => s + bayarLemburHari(h.lemburMenit ?? 0, upahJam), 0));
  const lemburJam = lemburHari.reduce((s, h) => s + Math.floor((h.lemburMenit ?? 0) / 30) / 2, 0);
  const dapatKehadiran = r.telat <= 2 && r.alpa === 0;
  const insentif = insentifBulan(r.y, r.m);

  const pendapatan: Baris[] = [
    { label: 'Gaji pokok', nilai: UPAH.pokok },
    { label: 'Tunjangan tetap', nilai: UPAH.tunjanganTetap },
    { label: 'Uang makan', nilai: UPAH.makan * hadir, catatan: `${hadir} hari × Rp15.000` },
    { label: 'Uang transport', nilai: UPAH.transport * hadir, catatan: `${hadir} hari × Rp10.000` },
    {
      label: 'Tunjangan kehadiran',
      nilai: dapatKehadiran ? UPAH.kehadiran : 0,
      catatan: dapatKehadiran ? `telat ${r.telat}×, tanpa alpa` : `gugur: telat ${r.telat}×${r.alpa ? `, alpa ${r.alpa}` : ''}`,
    },
    { label: 'Lembur', nilai: lembur, catatan: `${String(lemburJam).replace('.', ',')} jam disetujui` },
    { label: 'Insentif penjualan gerai', nilai: insentif },
  ];
  const bruto = pendapatan.reduce((s, b) => s + b.nilai, 0);
  const potonganAlpa = Math.round((UPAH.pokok / 25) * r.alpa);
  const potongan: Baris[] = [
    { label: 'BPJS Kesehatan', nilai: Math.round(upah * 0.01), catatan: '1% dari upah' },
    { label: 'BPJS Ketenagakerjaan JHT', nilai: Math.round(upah * 0.02), catatan: '2% dari upah' },
    { label: 'BPJS Ketenagakerjaan JP', nilai: Math.round(upah * 0.01), catatan: '1% dari upah' },
    { label: 'PPh 21', nilai: 0, catatan: 'tarif efektif kategori A: 0%' },
  ];
  if (r.alpa) potongan.push({ label: 'Potongan alpa', nilai: potonganAlpa, catatan: `${r.alpa} hari × 1/25 gaji pokok` });
  const totalPotongan = potongan.reduce((s, b) => s + b.nilai, 0);
  return { pendapatan, potongan, bruto, totalPotongan, bersih: bruto - totalPotongan, hadir, lemburJam, upahJam };
}
