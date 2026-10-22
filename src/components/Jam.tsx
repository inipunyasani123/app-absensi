import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { sekarangWIB } from '@/lib/waktu';
import { H, W } from '@/theme';

/** Jam papan-lipat WIB. Sebelum terpasang di peramban, tampil "--:--" agar HTML statis tidak bentrok. */
export function Jam({ siap }: { siap: boolean }) {
  const [t, setT] = useState<ReturnType<typeof sekarangWIB> | null>(null);
  useEffect(() => {
    if (!siap) return;
    setT(sekarangWIB());
    const id = setInterval(() => setT(sekarangWIB()), 1000);
    return () => clearInterval(id);
  }, [siap]);
  const hh = t ? String(Math.floor(t.menit / 60)).padStart(2, '0') : '--';
  const mm = t ? String(t.menit % 60).padStart(2, '0') : '--';
  const ss = t ? String(t.detik).padStart(2, '0') : '--';
  return (
    <View
      style={st.wadah}
      accessibilityRole="timer"
      accessibilityLabel={t ? `Pukul ${hh}.${mm} WIB` : 'Memuat jam'}
    >
      <View style={st.baris} aria-hidden>
        <Lipat angka={hh[0]} /><Lipat angka={hh[1]} />
        <Text style={st.titik}>:</Text>
        <Lipat angka={mm[0]} /><Lipat angka={mm[1]} />
        <View style={st.detikWadah}>
          <Text style={st.detik}>{ss}</Text>
          <Text style={st.wib}>WIB</Text>
        </View>
      </View>
    </View>
  );
}

function Lipat({ angka }: { angka: string }) {
  return (
    <View style={st.lipat}>
      <Text style={st.angka}>{angka}</Text>
      <View style={st.belah} />
    </View>
  );
}

const st = StyleSheet.create({
  wadah: {},
  baris: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lipat: {
    width: 50, height: 70, borderRadius: 10, backgroundColor: '#2E2820', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#3F372D', overflow: 'hidden',
  },
  angka: { ...H.display, fontSize: 60, lineHeight: 66, color: W.diJelaga },
  belah: { position: 'absolute', left: 0, right: 0, top: 34.5, height: 1.5, backgroundColor: W.jelaga },
  titik: { ...H.display, fontSize: 44, color: W.oranyeTerang, marginTop: -6 },
  detikWadah: { marginLeft: 6, justifyContent: 'center', gap: 2 },
  detik: { ...H.monoTebal, fontSize: 18, color: W.oranyeTerang },
  wib: { ...H.monoTebal, fontSize: 11, letterSpacing: 1.5, color: W.diJelaga2 },
});
