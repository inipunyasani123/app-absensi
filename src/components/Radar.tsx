import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { W } from '@/theme';

/** Cincin radius gerai. Titik "kamu" ditempatkan sesuai jarak (skala log di luar radius). */
export function Radar({ jarak, radius, ukuran = 116 }: { jarak: number | null; radius: number; ukuran?: number }) {
  const c = 60;
  const rRadius = 34;
  let pos: { x: number; y: number } | null = null;
  if (jarak != null) {
    const d = jarak <= radius ? (jarak / radius) * rRadius : Math.min(54, rRadius + Math.log10(jarak / radius + 1) * 22);
    const sudut = -0.9;
    pos = { x: c + Math.cos(sudut) * d, y: c + Math.sin(sudut) * d };
  }
  const dalam = jarak != null && jarak <= radius;
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 120 120" aria-hidden focusable={false}>
      <Circle cx={c} cy={c} r={56} fill="none" stroke={W.garis} strokeWidth={1} strokeDasharray="3 4" />
      <Circle cx={c} cy={c} r={rRadius} fill={dalam ? W.hijauMuda : W.kertas2} stroke={dalam ? W.hijau : W.garisTegas} strokeWidth={2} />
      <Line x1={c - 56} y1={c} x2={c + 56} y2={c} stroke={W.garis} strokeWidth={1} />
      <Line x1={c} y1={c - 56} x2={c} y2={c + 56} stroke={W.garis} strokeWidth={1} />
      <G>
        <Path d={`M${c} ${c - 13}c5 0 8 3.5 8 8 0 6-8 13-8 13s-8-7-8-13c0-4.5 3-8 8-8z`} fill={W.jelaga} />
        <Circle cx={c} cy={c - 5} r={3} fill={W.kunyit} />
      </G>
      {pos && (
        <G>
          <Circle cx={pos.x} cy={pos.y} r={9} fill={dalam ? W.hijau : W.stempel} opacity={0.22} />
          <Circle cx={pos.x} cy={pos.y} r={5} fill={dalam ? W.hijau : W.stempel} stroke={W.kertas} strokeWidth={2} />
        </G>
      )}
    </Svg>
  );
}
