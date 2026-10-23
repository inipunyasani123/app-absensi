// Semua nama usaha, orang, dan angka di berkas ini rekaan untuk keperluan demo.
import { acak, awalPekan, nomorHari, Tgl, hariDalamPekan, jumlahHari, tambahHari, NAMA_BULAN } from './waktu';

export const APLIKASI = {
  nama: 'Gilir',
  tagline: 'Absen, shift, cuti, dan slip gaji dalam satu genggaman',
  slug: 'absensi',
  kontak: 'https://www.pintuweb.id/kontak?demo=absensi',
};

export const PERUSAHAAN = {
  nama: 'Roti Lintang Pagi',
  bidang: 'Toko roti & kue rumahan',
  kota: 'Tulungagung',
  karyawan: 38,
};

export type Cabang = {
  id: string;
  nama: string;
  wilayah: string;
  lat: number;
  lng: number;
  radius: number; // meter
};

// Koordinat sekadar perkiraan wilayah kecamatan, bukan alamat usaha sungguhan.
export const CABANG: Record<string, Cabang> = {
  kota: { id: 'kota', nama: 'Gerai Kota', wilayah: 'Tulungagung', lat: -8.0658, lng: 111.9036, radius: 100 },
  dapur: { id: 'dapur', nama: 'Dapur Pusat', wilayah: 'Kedungwaru', lat: -8.0519, lng: 111.9282, radius: 150 },
  ngunut: { id: 'ngunut', nama: 'Gerai Ngunut', wilayah: 'Ngunut', lat: -8.1053, lng: 112.0191, radius: 100 },
  campur: { id: 'campur', nama: 'Gerai Campurdarat', wilayah: 'Campurdarat', lat: -8.1819, lng: 111.8457, radius: 100 },
};

export type KodeShift = 'pagi' | 'siang' | 'sore' | 'subuh' | 'libur';

export type Shift = { kode: KodeShift; nama: string; mulai: number; selesai: number };

export const SHIFT: Record<KodeShift, Shift> = {
  subuh: { kode: 'subuh', nama: 'Subuh', mulai: 3 * 60, selesai: 11 * 60 },
  pagi: { kode: 'pagi', nama: 'Pagi', mulai: 6 * 60, selesai: 14 * 60 },
  siang: { kode: 'siang', nama: 'Siang', mulai: 10 * 60, selesai: 18 * 60 },
  sore: { kode: 'sore', nama: 'Sore', mulai: 13 * 60, selesai: 21 * 60 },
  libur: { kode: 'libur', nama: 'Libur', mulai: 0, selesai: 0 },
};

export const ATURAN = {
  toleransiTelat: 5, // menit
  bukaAbsen: 90, // menit sebelum shift
  jatahCuti: 12, // hari per tahun
  cutiTerpakaiAwal: 3, // dipakai sebelum riwayat di aplikasi (Maret & Juli)
};

export type Rupa = {
  kulit: string;
  rambut: string;
  gaya: 'pendek' | 'panjang' | 'kerudung' | 'ikal' | 'cepak';
  baju: string;
  latar: string;
};

export type Orang = {
  id: string;
  nama: string;
  panggilan: string;
  jabatan: string;
  cabang: string;
  nik: string;
  bergabung: string;
  geser: number; // pergeseran rotasi shift
  libur: number; // pergeseran hari libur
  rupa: Rupa;
};

export const SAYA_ID = 'sekar';
export const ATASAN_ID = 'bayu';

export const ORANG: Record<string, Orang> = {
  sekar: {
    id: 'sekar', nama: 'Sekar Wulandari', panggilan: 'Sekar', jabatan: 'Staf Gerai · Kasir & Etalase', cabang: 'kota',
    nik: 'LP-0217', bergabung: 'Maret 2023', geser: 0, libur: 0,
    rupa: { kulit: '#C98E62', rambut: '#2B2118', gaya: 'kerudung', baju: '#A6351B', latar: '#EBC24A' },
  },
  bayu: {
    id: 'bayu', nama: 'Bayu Anggara', panggilan: 'Bayu', jabatan: 'Kepala Gerai Kota', cabang: 'kota',
    nik: 'LP-0088', bergabung: 'Juni 2020', geser: 1, libur: 3,
    rupa: { kulit: '#A8714B', rambut: '#1E1A15', gaya: 'cepak', baju: '#1E1A15', latar: '#DCEBD5' },
  },
  dimas: {
    id: 'dimas', nama: 'Dimas Prasetyo', panggilan: 'Dimas', jabatan: 'Staf Gerai · Etalase', cabang: 'kota',
    nik: 'LP-0231', bergabung: 'Agustus 2023', geser: 0, libur: 2,
    rupa: { kulit: '#B67C55', rambut: '#2B2118', gaya: 'pendek', baju: '#2F6A3C', latar: '#F6D9CF' },
  },
  ayu: {
    id: 'ayu', nama: 'Ayu Lestari', panggilan: 'Ayu', jabatan: 'Kasir', cabang: 'kota',
    nik: 'LP-0254', bergabung: 'Januari 2024', geser: 1, libur: 5,
    rupa: { kulit: '#D29B70', rambut: '#3A2A1E', gaya: 'panjang', baju: '#3E3570', latar: '#DCEBD5' },
  },
  fikri: {
    id: 'fikri', nama: 'Fikri Ramadhan', panggilan: 'Fikri', jabatan: 'Staf Gerai · Gudang', cabang: 'kota',
    nik: 'LP-0262', bergabung: 'Mei 2024', geser: 2, libur: 1,
    rupa: { kulit: '#9C6644', rambut: '#1E1A15', gaya: 'ikal', baju: '#5C5043', latar: '#E3DEF2' },
  },
  wulan: {
    id: 'wulan', nama: 'Wulan Maharani', panggilan: 'Wulan', jabatan: 'Kasir', cabang: 'kota',
    nik: 'LP-0270', bergabung: 'September 2024', geser: 2, libur: 4,
    rupa: { kulit: '#C68A5E', rambut: '#2B2118', gaya: 'kerudung', baju: '#2F6A3C', latar: '#F6D9CF' },
  },
};

export const TIM_KOTA = ['bayu', 'sekar', 'dimas', 'ayu', 'fikri', 'wulan'];

const ROTASI: KodeShift[] = ['pagi', 'siang', 'sore'];
const EPOCH_SENIN = nomorHari({ y: 2026, m: 1, d: 5 }); // Senin, 5 Januari 2026

export function pekanKe(t: Tgl) {
  return Math.floor((nomorHari(awalPekan(t)) - EPOCH_SENIN) / 7);
}

/** Jadwal terencana seseorang pada tanggal tertentu: rotasi pekanan + satu hari libur bergilir. */
export function shiftTerjadwal(orangId: string, t: Tgl): KodeShift {
  const o = ORANG[orangId];
  const w = pekanKe(t);
  const hariLibur = (((w * 2 + o.libur) % 7) + 7) % 7;
  const d = hariDalamPekan(t);
  if (d === hariLibur) return 'libur';
  // Separuh awal pekan (Sen–Rab) satu jenis shift, sisanya jenis berikutnya: tiap pekan memuat dua warna shift.
  return ROTASI[(((w + o.geser + (d >= 3 ? 1 : 0)) % 3) + 3) % 3];
}

// ——— Pengumuman HR ———

export type Pengumuman = {
  id: string;
  judul: string;
  ringkas: string;
  kategori: 'Operasional' | 'Pelatihan' | 'Gaji' | 'Kebersamaan';
  tanggal: Tgl;
  penting?: boolean;
  isi: string[];
  foto?: boolean;
};

export function daftarPengumuman(hariIni: Tgl, bulanLaluNama: string): Pengumuman[] {
  const sabtuDepan = tambahHari(awalPekan(hariIni), 12);
  const awalBulan = { ...hariIni, d: 1 };
  return [
    {
      id: 'pelatihan-keamanan-pangan',
      judul: 'Pelatihan keamanan pangan di Dapur Pusat',
      ringkas: 'Wajib untuk semua staf gerai. Dihitung sebagai jam kerja.',
      kategori: 'Pelatihan',
      tanggal: tambahHari(hariIni, -1),
      penting: true,
      foto: true,
      isi: [
        `Pelatihan dasar keamanan pangan diadakan Sabtu, ${sabtuDepan.d} ${NAMA_BULAN[sabtuDepan.m - 1]}, pukul 15.00–17.00 di Dapur Pusat Kedungwaru.`,
        'Materinya: cuci tangan yang benar, suhu simpan roti isi krim, label tanggal produksi, dan cara menangani keluhan pelanggan soal alergi.',
        'Jam pelatihan dihitung sebagai jam kerja. Kalau bentrok dengan shift Sore, kepala gerai akan mengatur pengganti. Absen hadir pelatihan dilakukan di aplikasi seperti biasa dengan lokasi Dapur Pusat.',
      ],
    },
    {
      id: 'celemek-baru',
      judul: 'Celemek baru bisa diambil mulai Senin',
      ringkas: 'Dua celemek per orang, ambil di gudang Dapur Pusat.',
      kategori: 'Operasional',
      tanggal: tambahHari(hariIni, -4),
      isi: [
        'Celemek warna bata dengan logo Lintang Pagi sudah datang. Setiap karyawan mendapat dua celemek.',
        'Ambil di gudang Dapur Pusat pada jam kerja, cukup sebutkan NIK karyawan. Celemek lama boleh disimpan untuk cadangan.',
      ],
    },
    {
      id: 'slip-gaji-terbit',
      judul: `Slip gaji ${bulanLaluNama} sudah terbit`,
      ringkas: 'Cek rincian lembur dan tunjangan kehadiran di tab Gaji.',
      kategori: 'Gaji',
      tanggal: awalBulan,
      isi: [
        `Gaji periode ${bulanLaluNama} sudah ditransfer dan slipnya bisa dilihat di tab Gaji.`,
        'Lembur yang dibayar hanya lembur yang sudah disetujui kepala gerai. Kalau ada selisih, laporkan ke bagian HR paling lambat tanggal 10.',
      ],
    },
    {
      id: 'toleransi-telat',
      judul: 'Aturan toleransi telat: 5 menit',
      ringkas: 'Lewat 5 menit dari jam shift tercatat telat.',
      kategori: 'Operasional',
      tanggal: tambahHari(hariIni, -11),
      isi: [
        'Absen masuk dibuka 90 menit sebelum shift. Absen sampai 5 menit setelah jam shift masih dihitung tepat waktu.',
        'Tunjangan kehadiran penuh diberikan bila dalam satu bulan telat paling banyak 2 kali dan tidak ada alpa.',
        'Absen hanya bisa dilakukan di dalam radius gerai. Untuk tugas di luar gerai, minta kepala gerai mencatatkan dinas luar.',
      ],
    },
    {
      id: 'stok-opname',
      judul: 'Stok opname akhir bulan',
      ringkas: `Hitung stok etalase & gudang kecil tanggal ${jumlahHari(hariIni.y, hariIni.m)} setelah tutup gerai.`,
      kategori: 'Operasional',
      tanggal: tambahHari(hariIni, -2),
      penting: true,
      isi: [
        `Stok opname dilakukan ${jumlahHari(hariIni.y, hariIni.m)} ${NAMA_BULAN[hariIni.m - 1]} setelah gerai tutup. Setiap gerai menghitung roti, kue kering, kemasan, dan bahan isian.`,
        'Yang bertugas shift terakhir hari itu ikut menghitung dan mengajukan lembur lewat aplikasi (jenis Lembur, bukti nota atau daftar stok).',
        'Selisih lebih dari 2% dilaporkan ke kepala gerai di hari yang sama.',
      ],
    },
    {
      id: 'cuti-akhir-tahun',
      judul: 'Cuti akhir tahun diatur bergiliran',
      ringkas: 'Gerai tetap buka saat libur akhir tahun; cuti diatur bergiliran.',
      kategori: 'Operasional',
      tanggal: tambahHari(hariIni, -8),
      isi: [
        'Gerai Kota, Ngunut, dan Campurdarat tetap buka di libur Natal dan tahun baru, jadi cuti akhir tahun diatur bergiliran per gerai.',
        'Ajukan cuti tahunan untuk periode 20 Desember sampai 5 Januari paling lambat tiga pekan sebelumnya. Kepala gerai memprioritaskan yang belum mengambil cuti tahun ini.',
      ],
    },
    {
      id: 'makan-bersama',
      judul: 'Makan bersama akhir bulan',
      ringkas: 'Setelah tutup gerai, di Gerai Kota. Bawa cerita, bukan kado.',
      kategori: 'Kebersamaan',
      tanggal: tambahHari(hariIni, -6),
      isi: [
        'Makan bersama seluruh tim gerai diadakan di Gerai Kota setelah jam tutup pada Minggu terakhir bulan ini.',
        'Menu dari Dapur Pusat. Yang sedang shift Sore tetap bisa ikut setelah absen pulang.',
      ],
    },
  ];
}

/** Judul & ringkasan tetap (tanpa tanggal) untuk metadata halaman statis. */
export const PENGUMUMAN_META: Record<string, [string, string]> = {
  'pelatihan-keamanan-pangan': ['Pelatihan keamanan pangan di Dapur Pusat', 'Pelatihan wajib staf gerai Roti Lintang Pagi: cuci tangan, suhu simpan roti isi krim, label produksi, dan penanganan alergi.'],
  'celemek-baru': ['Celemek baru bisa diambil mulai Senin', 'Setiap karyawan mendapat dua celemek baru, diambil di gudang Dapur Pusat dengan menyebutkan NIK.'],
  'slip-gaji-terbit': ['Slip gaji bulan lalu sudah terbit', 'Gaji bulan lalu sudah ditransfer. Cek rincian lembur dan tunjangan kehadiran di tab Gaji.'],
  'toleransi-telat': ['Aturan toleransi telat: 5 menit', 'Absen dibuka 90 menit sebelum shift, toleransi telat 5 menit, dan syarat tunjangan kehadiran penuh.'],
  'stok-opname': ['Stok opname akhir bulan', 'Stok opname tiap akhir bulan setelah gerai tutup: roti, kue kering, kemasan, dan bahan isian; lembur diajukan lewat aplikasi.'],
  'cuti-akhir-tahun': ['Cuti akhir tahun diatur bergiliran', 'Gerai tetap buka saat libur akhir tahun, jadi cuti 20 Desember–5 Januari diatur bergiliran. Ajukan paling lambat tiga pekan sebelumnya.'],
  'makan-bersama': ['Makan bersama akhir bulan', 'Makan bersama tim gerai setelah jam tutup pada Minggu terakhir bulan ini di Gerai Kota.'],
};

// ——— Pengajuan ———

export type JenisPengajuan = 'cuti' | 'izin' | 'sakit' | 'lembur' | 'tukar';
export type StatusPengajuan = 'menunggu' | 'disetujui' | 'ditolak';

export type Pengajuan = {
  id: string;
  orang: string;
  jenis: JenisPengajuan;
  mulai: string; // kunci tanggal
  selesai: string;
  hari?: number; // hari kerja yang terpakai (cuti/izin/sakit)
  lemburMenit?: number;
  jamMulai?: number;
  alasan: string;
  bukti?: 'surat-dokter' | 'catatan' | 'foto-nota';
  rekan?: string; // tukar shift: rekan yang bertukar
  dibuat: string; // kunci tanggal
  status: StatusPengajuan;
  catatanAtasan?: string;
  contoh?: boolean; // data contoh (dibuat ulang relatif terhadap hari ini)
};

export const NAMA_JENIS: Record<JenisPengajuan, string> = {
  cuti: 'Cuti tahunan',
  izin: 'Izin',
  sakit: 'Sakit',
  lembur: 'Lembur',
  tukar: 'Tukar shift',
};

/** Data contoh relatif terhadap hari ini. Keputusan atasan atasnya disimpan terpisah per id. */
export function pengajuanContoh(hariIni: Tgl, k: (t: Tgl) => string): Pengajuan[] {
  const d = (n: number) => k(tambahHari(hariIni, n));
  return [
    {
      id: 'c-ayu-sakit', orang: 'ayu', jenis: 'sakit', mulai: d(0), selesai: d(0), hari: 1,
      alasan: 'Demam sejak semalam, sudah periksa ke klinik pagi ini.', bukti: 'surat-dokter', dibuat: d(0), status: 'menunggu', contoh: true,
    },
    {
      id: 'c-fikri-lembur', orang: 'fikri', jenis: 'lembur', mulai: d(-1), selesai: d(-1), lemburMenit: 90, jamMulai: 21 * 60,
      alasan: 'Kiriman tepung dan mentega datang terlambat, bongkar dan susun stok gudang.', bukti: 'foto-nota', dibuat: d(-1), status: 'menunggu', contoh: true,
    },
    {
      id: 'c-dimas-izin', orang: 'dimas', jenis: 'izin', mulai: d(3), selesai: d(3), hari: 1,
      alasan: 'Menghadiri pernikahan kakak di Blitar.', bukti: 'catatan', dibuat: d(-2), status: 'menunggu', contoh: true,
    },
    {
      id: 'c-sekar-lembur', orang: 'sekar', jenis: 'lembur', mulai: d(-4), selesai: d(-4), lemburMenit: 120, jamMulai: 21 * 60,
      alasan: 'Stok opname akhir pekan bersama Fikri, hitung ulang etalase dan gudang kecil.', bukti: 'catatan', dibuat: d(-3), status: 'menunggu', contoh: true,
    },
    {
      id: 'c-dimas-tukar', orang: 'dimas', jenis: 'tukar', mulai: d(2), selesai: d(2), rekan: 'wulan',
      alasan: 'Ada kuliah sore, Wulan bersedia bertukar shift.', bukti: 'catatan', dibuat: d(0), status: 'menunggu', contoh: true,
    },
    {
      id: 'c-wulan-cuti', orang: 'wulan', jenis: 'cuti', mulai: d(10), selesai: d(12), hari: 3,
      alasan: 'Pulang kampung ke Trenggalek, acara keluarga.', bukti: 'catatan', dibuat: d(-5), status: 'disetujui', contoh: true,
      catatanAtasan: 'Disetujui. Shift diganti Ayu & Dimas.',
    },
    {
      id: 'c-sekar-izin', orang: 'sekar', jenis: 'izin', mulai: d(-9), selesai: d(-9), hari: 1,
      alasan: 'Mengurus perpanjangan KTP di kantor kecamatan.', bukti: 'catatan', dibuat: d(-12), status: 'disetujui', contoh: true,
    },
    {
      id: 'c-sekar-cuti', orang: 'sekar', jenis: 'cuti', mulai: d(-25), selesai: d(-24), hari: 2,
      alasan: 'Menemani ibu kontrol ke rumah sakit di Kediri.', bukti: 'catatan', dibuat: d(-33), status: 'disetujui', contoh: true,
    },
    {
      id: 'c-fikri-izin', orang: 'fikri', jenis: 'izin', mulai: d(-7), selesai: d(-7), hari: 1,
      alasan: 'Tukar shift dengan Dimas tanpa pemberitahuan.', bukti: 'catatan', dibuat: d(-8), status: 'ditolak', contoh: true,
      catatanAtasan: 'Tukar shift harus lewat saya dulu, ya. Silakan ajukan ulang.',
    },
  ];
}

/** Insentif penjualan gerai per bulan (stabil untuk bulan yang sama). */
export function insentifBulan(y: number, m: number) {
  return 75000 + Math.round(acak(`insentif-${y}-${m}`) * 5) * 25000;
}
