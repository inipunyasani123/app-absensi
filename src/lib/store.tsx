import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ATASAN_ID, KodeShift, Pengajuan, SAYA_ID, SHIFT, StatusPengajuan } from './data';
import { CatatanAbsen, Konteks, Simpanan, SIMPANAN_KOSONG, shiftHari, susunPengajuan } from './riwayat';
import { Tgl, kunci, sekarangWIB } from './waktu';

const KUNCI = 'gilir:demo:v1';

type Nilai = Konteks & {
  siap: boolean;
  kunciHariIni: string;
  absen: (jenis: 'masuk' | 'pulang', c: CatatanAbsen) => void;
  ulangiHariIni: () => void;
  simulasiHariKerja: (s: KodeShift) => void;
  setLokasi: (l: Simpanan['lokasi']) => void;
  ajukan: (p: Omit<Pengajuan, 'id' | 'dibuat' | 'status' | 'orang'>) => Pengajuan;
  putuskan: (id: string, status: StatusPengajuan, catatan?: string) => void;
  tandaiDibaca: (id: string) => void;
  aturUlang: () => void;
  menunggu: Pengajuan[];
};

const Ctx = createContext<Nilai | null>(null);

export function useGilir() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGilir di luar GilirProvider');
  return v;
}

function siapkanHari(s: Simpanan, t: Tgl, menit: number): Simpanan {
  // Saat aplikasi pertama dibuka di tengah/selepas shift, isi absen yang wajar agar demo tetap bisa dicoba.
  const k = kunci(t);
  if (s.disiapkan[k]) return s;
  const shift = shiftHari(SAYA_ID, t, s);
  const next: Simpanan = { ...s, disiapkan: { ...s.disiapkan, [k]: true } };
  if (shift === 'libur') return next;
  const sh = SHIFT[shift];
  const rec = { ...(s.absen[k] ?? {}) };
  if (!rec.masuk && menit >= sh.mulai + 15) {
    rec.masuk = { menit: sh.mulai - 7, bukti: ['seragam', 'kasir'], catatan: '', lokasi: 'otomatis', jarak: 24 };
  }
  if (rec.masuk && !rec.pulang && menit >= sh.selesai + 60) {
    rec.pulang = { menit: sh.selesai + 4, bukti: ['etalase'], catatan: '', lokasi: 'otomatis', jarak: 31 };
  }
  next.absen = { ...s.absen, [k]: rec };
  return next;
}

export function GilirProvider({ children }: { children: ReactNode }) {
  const [simpanan, setSimpanan] = useState<Simpanan>(SIMPANAN_KOSONG);
  const [siap, setSiap] = useState(false);
  const [jam, setJam] = useState(() => sekarangWIB());
  const muat = useRef(false);

  useEffect(() => {
    let batal = false;
    (async () => {
      let s = SIMPANAN_KOSONG;
      try {
        const raw = await AsyncStorage.getItem(KUNCI);
        if (raw) {
          const p = JSON.parse(raw);
          if (p?.versi === 1) s = { ...SIMPANAN_KOSONG, ...p };
        }
      } catch {}
      const now = sekarangWIB();
      s = siapkanHari(s, now.tgl, now.menit);
      if (batal) return;
      muat.current = true;
      setJam(now);
      setSimpanan(s);
      setSiap(true);
    })();
    const id = setInterval(() => setJam(sekarangWIB()), 20000);
    return () => {
      batal = true;
      clearInterval(id);
    };
  }, []);

  // Simpan setiap perubahan (setelah data awal termuat).
  useEffect(() => {
    if (!muat.current) return;
    AsyncStorage.setItem(KUNCI, JSON.stringify(simpanan)).catch(() => {});
  }, [simpanan]);

  // Ganti hari saat aplikasi dibiarkan terbuka melewati tengah malam WIB.
  const kunciHariIni = kunci(jam.tgl);
  useEffect(() => {
    if (!siap) return;
    setSimpanan((s) => siapkanHari(s, jam.tgl, jam.menit));
  }, [kunciHariIni, siap]); // eslint-disable-line react-hooks/exhaustive-deps

  const pengajuan = useMemo(() => susunPengajuan(simpanan, jam.tgl), [simpanan, kunciHariIni]); // eslint-disable-line react-hooks/exhaustive-deps

  const absen = useCallback((jenis: 'masuk' | 'pulang', c: CatatanAbsen) => {
    setSimpanan((s) => {
      const k = kunci(sekarangWIB().tgl);
      return { ...s, absen: { ...s.absen, [k]: { ...(s.absen[k] ?? {}), [jenis]: c } } };
    });
  }, []);

  const ulangiHariIni = useCallback(() => {
    setSimpanan((s) => {
      const k = kunci(sekarangWIB().tgl);
      const absenBaru = { ...s.absen };
      delete absenBaru[k];
      return { ...s, absen: absenBaru, disiapkan: { ...s.disiapkan, [k]: true } };
    });
  }, []);

  const simulasiHariKerja = useCallback((shift: KodeShift) => {
    setSimpanan((s) => {
      const k = kunci(sekarangWIB().tgl);
      return { ...s, override: { ...s.override, [k]: shift } };
    });
  }, []);

  const setLokasi = useCallback((l: Simpanan['lokasi']) => setSimpanan((s) => ({ ...s, lokasi: l })), []);

  const ajukan = useCallback<Nilai['ajukan']>((p) => {
    const now = sekarangWIB();
    const baru: Pengajuan = {
      ...p,
      id: `u-${Date.now().toString(36)}`,
      orang: SAYA_ID,
      dibuat: kunci(now.tgl),
      status: 'menunggu',
    };
    setSimpanan((s) => ({ ...s, pengajuan: [baru, ...s.pengajuan] }));
    return baru;
  }, []);

  const putuskan = useCallback((id: string, status: StatusPengajuan, catatan?: string) => {
    setSimpanan((s) => ({
      ...s,
      keputusan: { ...s.keputusan, [id]: { status, catatan, waktu: new Date().toISOString() } },
    }));
  }, []);

  const tandaiDibaca = useCallback((id: string) => {
    setSimpanan((s) => (s.dibaca.includes(id) ? s : { ...s, dibaca: [...s.dibaca, id] }));
  }, []);

  const aturUlang = useCallback(() => {
    const now = sekarangWIB();
    setSimpanan(siapkanHari(SIMPANAN_KOSONG, now.tgl, now.menit));
  }, []);

  const menunggu = useMemo(
    () => pengajuan.filter((p) => p.status === 'menunggu' && p.orang !== ATASAN_ID),
    [pengajuan],
  );

  const nilai: Nilai = {
    siap,
    hariIni: jam.tgl,
    menit: jam.menit,
    kunciHariIni,
    simpanan,
    pengajuan,
    absen,
    ulangiHariIni,
    simulasiHariKerja,
    setLokasi,
    ajukan,
    putuskan,
    tandaiDibaca,
    aturUlang,
    menunggu,
  };
  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}
