import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { W } from '@/theme';

/** Tanda Gilir: kartu absen berlubang dengan cap centang. */
export function Logo({ ukuran = 40 }: { ukuran?: number }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 64 64" aria-hidden focusable={false}>
      <Rect width={64} height={64} rx={16} fill={W.jelaga} />
      <Rect x={14} y={10} width={36} height={46} rx={4} fill={W.manila} />
      <Circle cx={21} cy={16} r={2} fill={W.jelaga} />
      <Circle cx={32} cy={16} r={2} fill={W.jelaga} />
      <Circle cx={43} cy={16} r={2} fill={W.jelaga} />
      <Path d="M19 25h26M19 31h26M19 37h14" stroke={W.garisTegas} strokeWidth={2} strokeLinecap="round" />
      <Rect x={29} y={36} width={19} height={13} rx={3} fill="none" stroke={W.stempel} strokeWidth={2.6} transform="rotate(-8 38 42)" />
      <Path d="M33 42.5l3 3 6-6" stroke={W.stempel} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
