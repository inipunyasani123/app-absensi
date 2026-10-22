import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { W } from '@/theme';

export type NamaIkon =
  | 'jam' | 'kalender' | 'dokumen' | 'rekap' | 'dompet' | 'lonceng' | 'pin' | 'kiri' | 'kanan' | 'centang'
  | 'silang' | 'tambah' | 'tameng' | 'orang' | 'target' | 'info' | 'pulang' | 'masuk' | 'ulang' | 'kunci' | 'catatan';

type Props = { nama: NamaIkon; ukuran?: number; warna?: string; tebal?: number };

/** Ikon garis buatan sendiri (24×24). Dekoratif: selalu disertai label teks di pemakainya. */
export function Ikon({ nama, ukuran = 22, warna = W.tinta, tebal = 1.9 }: Props) {
  const p = { stroke: warna, strokeWidth: tebal, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 24 24" aria-hidden focusable={false}>
      {nama === 'jam' && (<><Circle cx={12} cy={12} r={8.5} {...p} /><Path d="M12 7.5V12l3 2" {...p} /></>)}
      {nama === 'kalender' && (<><Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} {...p} /><Path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2" {...p} /></>)}
      {nama === 'dokumen' && (<><Path d="M7 3h7l5 5v13H7z" {...p} /><Path d="M14 3v5h5M10 13h6M10 17h4" {...p} /></>)}
      {nama === 'rekap' && (<><Path d="M4 20h16" {...p} /><Rect x={5.5} y={11} width={3} height={6.5} rx={1} {...p} /><Rect x={10.5} y={6} width={3} height={11.5} rx={1} {...p} /><Rect x={15.5} y={13.5} width={3} height={4} rx={1} {...p} /></>)}
      {nama === 'dompet' && (<><Rect x={3} y={6} width={18} height={13} rx={2.5} {...p} /><Path d="M3 10h18M15.5 14.5h2.5" {...p} /><Path d="M6 6l9-3 1 3" {...p} /></>)}
      {nama === 'lonceng' && (<><Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" {...p} /><Path d="M10 20.5a2 2 0 0 0 4 0" {...p} /></>)}
      {nama === 'pin' && (<><Path d="M12 21s6.5-6 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21z" {...p} /><Circle cx={12} cy={9.5} r={2.4} {...p} /></>)}
      {nama === 'kiri' && <Path d="M14.5 5.5 8 12l6.5 6.5" {...p} />}
      {nama === 'kanan' && <Path d="M9.5 5.5 16 12l-6.5 6.5" {...p} />}
      {nama === 'centang' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {nama === 'silang' && <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...p} />}
      {nama === 'tambah' && <Path d="M12 5v14M5 12h14" {...p} />}
      {nama === 'tameng' && (<><Path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" {...p} /><Path d="M8.8 12l2.2 2.2 4.2-4.4" {...p} /></>)}
      {nama === 'orang' && (<><Circle cx={12} cy={8} r={3.8} {...p} /><Path d="M4.5 20.5c1.4-3.8 4.3-5.8 7.5-5.8s6.1 2 7.5 5.8" {...p} /></>)}
      {nama === 'target' && (<><Circle cx={12} cy={12} r={8.5} {...p} /><Circle cx={12} cy={12} r={4.5} {...p} /><Circle cx={12} cy={12} r={0.8} {...p} /></>)}
      {nama === 'info' && (<><Circle cx={12} cy={12} r={8.5} {...p} /><Path d="M12 11v5.5M12 7.8v.2" {...p} /></>)}
      {nama === 'masuk' && (<><Path d="M10 4H5.5v16H10" {...p} /><Path d="M20 12H9.5M15.5 7.5 20 12l-4.5 4.5" {...p} /></>)}
      {nama === 'pulang' && (<><Path d="M14 4h4.5v16H14" {...p} /><Path d="M4 12h10.5M8.5 7.5 4 12l4.5 4.5" {...p} /></>)}
      {nama === 'ulang' && (<><Path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4" {...p} /><Path d="M5 3.5v3.8h3.8" {...p} /></>)}
      {nama === 'kunci' && (<><Rect x={5} y={10.5} width={14} height={10} rx={2} {...p} /><Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...p} /></>)}
      {nama === 'catatan' && (<><Path d="M5 4h14v12l-4 4H5z" {...p} /><Path d="M15 20v-4h4M8.5 9h7M8.5 12.5h5" {...p} /></>)}
    </Svg>
  );
}
