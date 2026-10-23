import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { sekarangWIB } from '@/lib/waktu';
import { H, TABULAR, W } from '@/theme';

const dua = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

/** Papan-balik dua pasang angka (jam:menit, hari:jam, dst.) + angka kecil di samping. */
export function PapanBalik({
  a, b, kecil, satuan, label,
}: { a: number | null; b: number | null; kecil?: string; satuan?: [string, string]; label: string }) {
  const sa = a == null ? '--' : dua(a);
  const sb = b == null ? '--' : dua(b);
  return (
    <View accessibilityRole="timer" accessibilityLabel={label} accessible>
      <View style={st.baris} aria-hidden>
        <View style={{ gap: 4 }}>
          <View style={st.pasang}>
            <Lipat angka={sa[0]} />
            <Lipat angka={sa.slice(1)} />
          </View>
          {satuan && <Text style={st.satuan}>{satuan[0]}</Text>}
        </View>
        <Text style={st.titik}>:</Text>
        <View style={{ gap: 4 }}>
          <View style={st.pasang}>
            <Lipat angka={sb[0]} />
            <Lipat angka={sb.slice(1)} />
          </View>
          {satuan && <Text style={st.satuan}>{satuan[1]}</Text>}
        </View>
        {kecil != null && (
          <View style={st.detikWadah}>
            <Text style={st.detik}>{kecil}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/** Jam dinding WIB (papan-balik). Sebelum terpasang di peramban tampil "--:--" agar HTML statis tidak bentrok. */
export function Jam({ siap }: { siap: boolean }) {
  const [t, setT] = useState<ReturnType<typeof sekarangWIB> | null>(null);
  useEffect(() => {
    if (!siap) return;
    setT(sekarangWIB());
    const id = setInterval(() => setT(sekarangWIB()), 1000);
    return () => clearInterval(id);
  }, [siap]);
  return (
    <PapanBalik
      a={t ? Math.floor(t.menit / 60) : null}
      b={t ? t.menit % 60 : null}
      kecil={t ? dua(t.detik) : '--'}
      label={t ? `Pukul ${dua(t.menit / 60)}.${dua(t.menit % 60)} WIB` : 'Memuat jam'}
    />
  );
}

function Lipat({ angka }: { angka: string }) {
  return (
    <View style={[st.lipat, angka.length > 1 && { width: 60 }]}>
      <Text style={st.angka}>{angka}</Text>
      <View style={st.belah} />
    </View>
  );
}

const st = StyleSheet.create({
  baris: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  pasang: { flexDirection: 'row', gap: 4 },
  lipat: {
    width: 44, height: 60, borderRadius: 9, backgroundColor: '#2E2820', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#3F372D', overflow: 'hidden',
  },
  angka: { ...H.display, fontSize: 56, lineHeight: 60, color: W.diJelaga, fontVariant: TABULAR },
  belah: { position: 'absolute', left: 0, right: 0, top: 29.5, height: 1.5, backgroundColor: W.jelaga },
  titik: { ...H.display, fontSize: 44, lineHeight: 60, color: W.oranyeTerang },
  satuan: { ...H.monoTebal, fontSize: 12, letterSpacing: 1, color: W.diJelaga2, textAlign: 'center', textTransform: 'uppercase' },
  detikWadah: { marginLeft: 6, height: 60, justifyContent: 'center' },
  detik: { ...H.monoTebal, fontSize: 18, color: W.oranyeTerang },
});
