// Menghitung status kehadiran per hari dari jadwal, riwayat contoh, pengajuan, dan absen yang dicatat di perangkat.
import {
  ATURAN, KodeShift, ORANG, Pengajuan, SAYA_ID, SHIFT, StatusPengajuan, pengajuanContoh, shiftTerjadwal,
} from './data';
import { Tgl, acak, banding, dariKunci, geserBulan, jumlahHari, kunci, nomorHari, tambahHari } from './waktu';

export type BuktiAbsen = 'seragam' | 'kasir' | 'etalase' | 'kiriman';

export type CatatanAbsen = {
  menit: number;
  bukti: BuktiAbsen[];
  catatan: string;
  lokasi: 'perangkat' | 'simulasi' | 'otomatis';
  jarak?: number;
};

export type Keputusan = { status: StatusPengajuan; catatan?: string; waktu: string };

export type Simpanan = {
  versi: 1;
  absen: Record<string, { masuk?: CatatanAbsen; pulang?: CatatanAbsen; istirahat?: { mulai: number; selesai?: number } }>;
  disiapkan: Record<string, true>;
  override: Record<string, KodeShift>;
  pengajuan: Pengajuan[];
  keputusan: Record<string, Keputusan>;
  dibaca: string[];
  lokasi?: { kunci: string; jarak: number; sumber: 'perangkat' | 'simulasi'; akurasi?: number };
  kenal?: boolean; // pengenalan singkat sudah dilihat
};

export const SIMPANAN_KOSONG: Simpanan = {
  versi: 1, absen: {}, disiapkan: {}, override: {}, pengajuan: [], keputusan: {}, dibaca: [],
};

export type StatusHari =
  | 'hadir' | 'telat' | 'luar' | 'izin' | 'sakit' | 'cuti' | 'alpa' | 'libur' | 'nanti' | 'berjalan' | 'belum';

export type Hari = {
  tgl: Tgl;
  kunci: string;
  shift: KodeShift;
  status: StatusHari;
  masuk?: number;
  pulang?: number;
  telatMenit?: number;
  lemburMenit?: number; // lembur yang sudah disetujui
  lemburMenunggu?: number;
  pengajuan?: Pengajuan;
};

export type Konteks = { hariIni: Tgl; menit: number; simpanan: Simpanan; pengajuan: Pengajuan[] };

/** Cari hari kerja terdekat seseorang mulai dari selisih tertentu, bergerak ke arah `arah`. */
function hariKerja(orang: string, hariIni: Tgl, selisih: number, arah: 1 | -1) {
  let t = tambahHari(hariIni, selisih);
  for (let i = 0; i < 7 && shiftTerjadwal(orang, t) === 'libur'; i++) t = tambahHari(t, arah);
  return t;
}

export function hitungHariKerja(orang: string, mulai: string, selesai: string) {
  const a = nomorHari(dariKunci(mulai));
  const b = nomorHari(dariKunci(selesai));
  let n = 0;
  for (let i = a; i <= b; i++) {
    const t = tambahHari(dariKunci(mulai), i - a);
    if (shiftTerjadwal(orang, t) !== 'libur') n++;
  }
  return n;
}

/** Gabungan pengajuan contoh (tanggal relatif) + buatan pengguna, dengan keputusan atasan yang tersimpan. */
export function susunPengajuan(simpanan: Simpanan, hariIni: Tgl): Pengajuan[] {
  const contoh = pengajuanContoh(hariIni, kunci).map((p) => {
    // Geser tanggal contoh ke hari kerja orangnya agar tidak jatuh di hari libur.
    const awal = dariKunci(p.mulai);
    const sel = banding(awal, hariIni);
    const arah: 1 | -1 = sel > 0 ? 1 : -1;
    const mulaiT = hariKerja(p.orang, hariIni, sel, arah);
    const panjang = banding(dariKunci(p.selesai), awal);
    const selesaiT = tambahHari(mulaiT, panjang);
    const q: Pengajuan = { ...p, mulai: kunci(mulaiT), selesai: kunci(selesaiT) };
    if (q.jenis === 'lembur') {
      const s = shiftTerjadwal(q.orang, mulaiT);
      q.jamMulai = SHIFT[s].selesai;
    } else if (q.jenis === 'tukar') {
      q.hari = 1;
    } else {
      q.hari = hitungHariKerja(q.orang, q.mulai, q.selesai);
    }
    if (banding(dariKunci(q.dibuat), mulaiT) > 0 && q.jenis !== 'sakit') q.dibuat = kunci(tambahHari(mulaiT, -1));
    return q;
  });
  const semua = [...simpanan.pengajuan, ...contoh].map((p) => {
    const k = simpanan.keputusan[p.id];
    return k ? { ...p, status: k.status, catatanAtasan: k.catatan ?? p.catatanAtasan } : p;
  });
  return semua.sort((a, b) => (a.dibuat < b.dibuat ? 1 : a.dibuat > b.dibuat ? -1 : 0));
}

function cariPengajuan(list: Pengajuan[], orang: string, k: string, jenis?: 'cuti-izin-sakit' | 'lembur') {
  return list.find((p) => {
    if (p.orang !== orang || p.status === 'ditolak') return false;
    if (p.jenis === 'tukar') return false;
    if (jenis === 'lembur' ? p.jenis !== 'lembur' : p.jenis === 'lembur') return false;
    return p.mulai <= k && k <= p.selesai;
  });
}

function shiftDasar(orang: string, t: Tgl, simpanan: Simpanan): KodeShift {
  if (orang === SAYA_ID) {
    const o = simpanan.override[kunci(t)];
    if (o) return o;
  }
  return shiftTerjadwal(orang, t);
}

/** Shift efektif: jadwal + simulasi hari kerja + tukar shift yang sudah disetujui. */
export function shiftHari(orang: string, t: Tgl, simpanan: Simpanan, pengajuan: Pengajuan[] = []): KodeShift {
  const k = kunci(t);
  const tukar = pengajuan.find(
    (p) => p.jenis === 'tukar' && p.status === 'disetujui' && p.mulai === k && (p.orang === orang || p.rekan === orang),
  );
  if (tukar && tukar.rekan) {
    const lawan = tukar.orang === orang ? tukar.rekan : tukar.orang;
    return shiftDasar(lawan, t, simpanan);
  }
  return shiftDasar(orang, t, simpanan);
}

/** Status masuk dibanding jadwal. */
export function nilaiMasuk(shift: KodeShift, menit: number): { status: 'hadir' | 'telat' | 'luar'; telat: number } {
  const s = SHIFT[shift];
  if (menit < s.mulai - ATURAN.bukaAbsen || menit > s.selesai) return { status: 'luar', telat: 0 };
  const telat = menit - s.mulai;
  if (telat > ATURAN.toleransiTelat) return { status: 'telat', telat };
  return { status: 'hadir', telat: 0 };
}

export function hari(orang: string, t: Tgl, ctx: Konteks): Hari {
  const k = kunci(t);
  const shift = shiftHari(orang, t, ctx.simpanan, ctx.pengajuan);
  const dasar: Hari = { tgl: t, kunci: k, shift, status: 'nanti' };
  const beda = banding(t, ctx.hariIni);
  const cuti = cariPengajuan(ctx.pengajuan, orang, k, 'cuti-izin-sakit');
  const lembur = cariPengajuan(ctx.pengajuan, orang, k, 'lembur');
  const s = SHIFT[shift];

  if (shift === 'libur') return { ...dasar, status: 'libur' };
  if (cuti && (cuti.status === 'disetujui' || beda >= 0)) {
    return { ...dasar, status: cuti.jenis as StatusHari, pengajuan: cuti };
  }
  if (beda > 0) return dasar;

  if (beda === 0 && orang === SAYA_ID) {
    const rec = ctx.simpanan.absen[k];
    if (!rec?.masuk) return { ...dasar, status: 'belum' };
    const n = nilaiMasuk(shift, rec.masuk.menit);
    return {
      ...dasar,
      status: rec.pulang ? n.status : 'berjalan',
      masuk: rec.masuk.menit,
      pulang: rec.pulang?.menit,
      telatMenit: n.telat || undefined,
      lemburMenit: lembur?.status === 'disetujui' ? lembur.lemburMenit : undefined,
      lemburMenunggu: lembur?.status === 'menunggu' ? lembur.lemburMenit : undefined,
    };
  }

  // Riwayat contoh yang stabil per orang & tanggal.
  const r = acak(`${orang}|${k}`);
  const r2 = acak(`${k}|${orang}|masuk`);
  const r3 = acak(`${k}|${orang}|pulang`);
  const hariIniOrangLain = beda === 0;
  if (hariIniOrangLain) {
    // Orang lain hari ini: anggap sudah masuk kalau shift sudah mulai.
    if (ctx.menit < s.mulai - 10) return { ...dasar, status: 'belum' };
    const masuk = r < 0.12 ? s.mulai + 6 + Math.floor(r2 * 14) : s.mulai - 3 - Math.floor(r2 * 18);
    if (ctx.menit < masuk) return { ...dasar, status: 'belum' };
    const n = nilaiMasuk(shift, masuk);
    const pulang = ctx.menit > s.selesai + 15 ? s.selesai + Math.floor(r3 * 12) : undefined;
    return { ...dasar, status: pulang ? n.status : 'berjalan', masuk, pulang, telatMenit: n.telat || undefined };
  }

  if (r < 0.012) return { ...dasar, status: 'alpa' };
  if (r < 0.03) return { ...dasar, status: 'sakit' };
  const masuk = r < 0.095 ? s.mulai + 6 + Math.floor(r2 * 19) : s.mulai - 3 - Math.floor(r2 * 22);
  const n = nilaiMasuk(shift, masuk);
  let pulang = s.selesai + Math.floor(r3 * 14);
  let lemburMenit: number | undefined;
  let lemburMenunggu: number | undefined;
  if (lembur) {
    pulang = s.selesai + (lembur.lemburMenit ?? 0) + Math.floor(r3 * 8);
    if (lembur.status === 'disetujui') lemburMenit = lembur.lemburMenit;
    else lemburMenunggu = lembur.lemburMenit;
  } else if (acak(`${k}|${orang}|lembur`) < 0.06) {
    lemburMenit = 60 + Math.floor(r3 * 4) * 30;
    pulang = s.selesai + lemburMenit + Math.floor(r2 * 6);
  }
  return { ...dasar, status: n.status, masuk, pulang, telatMenit: n.telat || undefined, lemburMenit, lemburMenunggu };
}

export type Rekap = {
  y: number;
  m: number;
  hari: Hari[];
  hariKerja: number; // terjadwal sampai hari ini
  hadir: number; // termasuk telat
  telat: number;
  telatMenit: number;
  izin: number;
  sakit: number;
  cuti: number;
  alpa: number;
  lemburMenit: number;
  lemburMenunggu: number;
  rataSelisihMasuk: number | null; // menit; negatif = lebih awal
  persen: number | null;
};

export function rekapBulan(orang: string, y: number, m: number, ctx: Konteks): Rekap {
  const n = jumlahHari(y, m);
  const hariList: Hari[] = [];
  const r: Rekap = {
    y, m, hari: hariList, hariKerja: 0, hadir: 0, telat: 0, telatMenit: 0, izin: 0, sakit: 0, cuti: 0, alpa: 0,
    lemburMenit: 0, lemburMenunggu: 0, rataSelisihMasuk: null, persen: null,
  };
  let totalSelisih = 0;
  let jumlahSelisih = 0;
  for (let d = 1; d <= n; d++) {
    const h = hari(orang, { y, m, d }, ctx);
    hariList.push(h);
    if (h.status === 'nanti' || h.status === 'libur') continue;
    if (h.status === 'belum') continue;
    r.hariKerja++;
    if (h.status === 'hadir' || h.status === 'telat' || h.status === 'berjalan' || h.status === 'luar') {
      r.hadir++;
      if (h.status !== 'luar' && h.masuk != null) {
        totalSelisih += h.masuk - SHIFT[h.shift].mulai;
        jumlahSelisih++;
      }
    }
    if (h.telatMenit) {
      r.telat++;
      r.telatMenit += h.telatMenit;
    }
    if (h.status === 'izin') r.izin++;
    if (h.status === 'sakit') r.sakit++;
    if (h.status === 'cuti') r.cuti++;
    if (h.status === 'alpa') r.alpa++;
    r.lemburMenit += h.lemburMenit ?? 0;
    r.lemburMenunggu += h.lemburMenunggu ?? 0;
  }
  if (jumlahSelisih) r.rataSelisihMasuk = Math.round(totalSelisih / jumlahSelisih);
  if (r.hariKerja) r.persen = Math.round((r.hadir / r.hariKerja) * 100);
  return r;
}

export function sisaCuti(ctx: Konteks) {
  const tahun = ctx.hariIni.y;
  let terpakai = ATURAN.cutiTerpakaiAwal;
  let menunggu = 0;
  for (const p of ctx.pengajuan) {
    if (p.orang !== SAYA_ID || p.jenis !== 'cuti' || !p.mulai.startsWith(String(tahun))) continue;
    if (p.status === 'disetujui') terpakai += p.hari ?? 0;
    if (p.status === 'menunggu') menunggu += p.hari ?? 0;
  }
  return { jatah: ATURAN.jatahCuti, terpakai, menunggu, sisa: Math.max(0, ATURAN.jatahCuti - terpakai) };
}

export function bulanLalu(t: Tgl, n = 1) {
  return geserBulan(t.y, t.m, -n);
}

export function namaOrang(id: string) {
  return ORANG[id]?.nama ?? id;
}
