import Svg, { Path } from 'react-native-svg';

/** Tepi bergerigi kertas struk (atas/bawah). */
export function Gerigi({ bawah, warna = '#FFFDF6', gigi = 22 }: { bawah?: boolean; warna?: string; gigi?: number }) {
  let d = bawah ? 'M0 0 ' : 'M0 12 ';
  for (let i = 0; i < gigi; i++) {
    const x = (i * 100) / gigi;
    const t = x + 100 / gigi / 2;
    d += bawah ? `L${t} 12 L${x + 100 / gigi} 0 ` : `L${t} 0 L${x + 100 / gigi} 12 `;
  }
  d += bawah ? 'L100 0 Z' : 'L100 12 Z';
  return (
    <Svg width="100%" height={12} viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden focusable={false}>
      <Path d={d} fill={warna} />
    </Svg>
  );
}
