import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Href } from '@/lib/nav';
import { W } from '@/theme';
import { Tautan, Teks } from './ui';

/** Ilustrasi buatan sendiri: kartu absen kosong / amplop pengajuan / meja beres. */
function Gambar({ jenis }: { jenis: 'kartu' | 'amplop' | 'beres' }) {
  return (
    <Svg width={84} height={72} viewBox="0 0 84 72" aria-hidden focusable={false}>
      {jenis === 'kartu' && (
        <>
          <Rect x={18} y={4} width={48} height={62} rx={5} fill={W.kertas} stroke={W.tinta} strokeWidth={2} transform="rotate(-6 42 35)" />
          <Circle cx={30} cy={13} r={2.4} fill={W.tinta} /><Circle cx={42} cy={12} r={2.4} fill={W.tinta} /><Circle cx={54} cy={11} r={2.4} fill={W.tinta} />
          <Path d="M27 26l30-3M28 36l30-3M29 46l22-2" stroke={W.garisTegas} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" />
        </>
      )}
      {jenis === 'amplop' && (
        <>
          <Rect x={10} y={16} width={64} height={44} rx={5} fill={W.kertas} stroke={W.tinta} strokeWidth={2} />
          <Path d="M11 18l31 24 31-24" fill="none" stroke={W.tinta} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={50} y={4} width={22} height={16} rx={3} fill="none" stroke={W.stempel} strokeWidth={2.4} transform="rotate(10 61 12)" />
        </>
      )}
      {jenis === 'beres' && (
        <>
          <Rect x={8} y={40} width={68} height={8} rx={3} fill={W.tinta} />
          <Rect x={22} y={14} width={30} height={26} rx={4} fill={W.kertas} stroke={W.tinta} strokeWidth={2} />
          <Path d="M29 27l5 5 11-11" fill="none" stroke={W.hijau} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M58 40c0-8 4-14 10-14v14" fill={W.kunyit} stroke={W.tinta} strokeWidth={2} />
          <Path d="M16 48v14M68 48v14" stroke={W.tinta} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export function Kosong({
  jenis, judul, teks, aksi,
}: { jenis: 'kartu' | 'amplop' | 'beres'; judul: string; teks: string; aksi?: { label: string; href: Href } }) {
  return (
    <View style={st.wadah}>
      <View style={st.garis} aria-hidden>
        {[0, 1, 2, 3].map((i) => <View key={i} style={st.baris} />)}
      </View>
      <Gambar jenis={jenis} />
      <Teks v="subjudul" style={{ textAlign: 'center' }}>{judul}</Teks>
      <Teks v="kecil" warna={W.tinta2} style={{ textAlign: 'center' }}>{teks}</Teks>
      {aksi && (
        <Tautan href={aksi.href} style={st.aksi}>
          <Teks v="subjudul" warna={W.diJelaga} style={{ fontSize: 15 }}>{aksi.label}</Teks>
        </Tautan>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  wadah: {
    backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 18, alignItems: 'center', gap: 6,
    overflow: 'hidden',
  },
  garis: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly' },
  baris: { height: 1, backgroundColor: '#EFE2BF' },
  aksi: { marginTop: 6, backgroundColor: W.jelaga, borderRadius: 14, paddingHorizontal: 18, minHeight: 46, justifyContent: 'center' },
});
