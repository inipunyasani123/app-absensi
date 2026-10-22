// Ilustrasi buatan sendiri (SVG). Tokoh digambar sederhana, bukan potret orang sungguhan.
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Rupa } from '@/lib/data';
import { BuktiAbsen } from '@/lib/riwayat';
import { W } from '@/theme';

export function Avatar({ rupa, ukuran = 48 }: { rupa: Rupa; ukuran?: number }) {
  const { kulit, rambut, gaya, baju, latar } = rupa;
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 64 64" aria-hidden focusable={false}>
      <Circle cx={32} cy={32} r={32} fill={latar} />
      <G>
        {gaya === 'panjang' && <Path d="M17 30c0-11 7-18 15-18s15 7 15 18v16H17z" fill={rambut} />}
        {/* badan + celemek */}
        <Path d="M10 64c1-12 9-19 22-19s21 7 22 19z" fill={baju} />
        <Path d="M24 47h16l-2 17H26z" fill="#FBF7EE" opacity={0.92} />
        <Path d="M24 47l-3-2M40 47l3-2" stroke="#FBF7EE" strokeWidth={1.6} strokeLinecap="round" />
        <Rect x={28.5} y={38} width={7} height={8} rx={2} fill={kulit} />
        {gaya === 'kerudung' ? (
          <>
            <Path d="M14 50c0-6 3-12 6-15-1-12 5-21 12-21s13 9 12 21c3 3 6 9 6 15-6-4-12-5-18-5s-12 1-18 5z" fill={rambut === '#2B2118' ? '#7A2412' : rambut} />
            <Ellipse cx={32} cy={31} rx={9} ry={10.5} fill={kulit} />
          </>
        ) : (
          <Ellipse cx={32} cy={29} rx={10.5} ry={12} fill={kulit} />
        )}
        {gaya === 'pendek' && <Path d="M21 27c0-8 5-13 11-13s11 4 11 12c-4-4-9-5-14-3-3 1-6 2-8 4z" fill={rambut} />}
        {gaya === 'panjang' && <Path d="M21 27c1-8 5-12 11-12s10 4 11 11c-7 0-13-3-16-7-1 4-3 6-6 8z" fill={rambut} />}
        {gaya === 'ikal' && (
          <G fill={rambut}>
            <Circle cx={23} cy={22} r={5} /><Circle cx={29} cy={18} r={5.5} /><Circle cx={36} cy={18} r={5.5} /><Circle cx={42} cy={23} r={5} />
          </G>
        )}
        {gaya === 'cepak' && <Path d="M21.5 25c0-7 4.5-11 10.5-11s10.5 4 10.5 11c-3-2-7-3-10.5-3s-7.5 1-10.5 3z" fill={rambut} />}
        {/* wajah sederhana: titik mata & garis senyum */}
        <Circle cx={28} cy={gaya === 'kerudung' ? 31 : 29.5} r={1.3} fill={W.tinta} />
        <Circle cx={36} cy={gaya === 'kerudung' ? 31 : 29.5} r={1.3} fill={W.tinta} />
        <Path d={gaya === 'kerudung' ? 'M29 35.5c2 1.6 4 1.6 6 0' : 'M29 34c2 1.6 4 1.6 6 0'} stroke={W.tinta} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

export function IlustrasiBukti({ jenis, ukuran = 44 }: { jenis: BuktiAbsen; ukuran?: number }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 48 48" aria-hidden focusable={false}>
      {jenis === 'seragam' && (
        <>
          <Path d="M17 6h14l-1 7 7 3-2 26H13l-2-26 7-3z" fill={W.stempel} />
          <Path d="M18 16h12v22H18z" fill={W.kertas} />
          <Path d="M20 22h8M20 27h8" stroke={W.garisTegas} strokeWidth={1.5} />
          <Circle cx={24} cy={10} r={2} fill={W.kunyit} />
        </>
      )}
      {jenis === 'kasir' && (
        <>
          <Rect x={8} y={22} width={32} height={18} rx={3} fill={W.jelaga} />
          <Rect x={13} y={8} width={22} height={11} rx={2} fill={W.hijauMuda} stroke={W.jelaga} strokeWidth={2} />
          <Path d="M17 13.5h9" stroke={W.hijauTua} strokeWidth={2} strokeLinecap="round" />
          <G fill={W.kunyit}>
            <Rect x={13} y={26} width={5} height={4} rx={1} /><Rect x={21.5} y={26} width={5} height={4} rx={1} /><Rect x={30} y={26} width={5} height={4} rx={1} />
          </G>
          <Rect x={13} y={33} width={22} height={3} rx={1.5} fill={W.diJelaga2} />
        </>
      )}
      {jenis === 'etalase' && (
        <>
          <Rect x={6} y={12} width={36} height={26} rx={3} fill={W.kertas} stroke={W.jelaga} strokeWidth={2} />
          <Path d="M6 25h36" stroke={W.jelaga} strokeWidth={2} />
          <Ellipse cx={15} cy={21} rx={5} ry={3} fill="#C98E4A" />
          <Ellipse cx={27} cy={21} rx={6} ry={3.2} fill="#B5773A" />
          <Circle cx={18} cy={33} r={3.4} fill="#D9A55B" /><Circle cx={28} cy={33} r={3.4} fill={W.stempel} /><Circle cx={36} cy={21} r={2.6} fill="#D9A55B" />
          <Path d="M10 38v4M38 38v4" stroke={W.jelaga} strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}
      {jenis === 'kiriman' && (
        <>
          <Path d="M8 20h32l-3 20H11z" fill="#B5773A" />
          <Path d="M10 27h28M11 33h26" stroke="#8C5626" strokeWidth={1.6} />
          <Ellipse cx={18} cy={18} rx={7} ry={4} fill="#D9A55B" />
          <Ellipse cx={30} cy={17} rx={7} ry={4.4} fill="#C98E4A" />
          <Path d="M14 17.5l2-2M18 18l2-2.5M27 16.5l2-2M31 17l2-2.5" stroke="#8C5626" strokeWidth={1.4} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export function SuratDokter({ ukuran = 56 }: { ukuran?: number }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 56 56" aria-hidden focusable={false}>
      <Path d="M12 6h24l9 9v35H12z" fill={W.kertas} stroke={W.jelaga} strokeWidth={2} />
      <Path d="M36 6v9h9" fill="none" stroke={W.jelaga} strokeWidth={2} />
      <Path d="M24 15h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill={W.stempel} />
      <Path d="M18 37h20M18 42h13" stroke={W.garisTegas} strokeWidth={2} strokeLinecap="round" />
      <Path d="M31 47c3-4 5 2 8-2" stroke={W.ungu} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function CatatanKertas({ ukuran = 56 }: { ukuran?: number }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 56 56" aria-hidden focusable={false}>
      <Path d="M10 8h36v32l-10 10H10z" fill={W.kunyitMuda} stroke={W.jelaga} strokeWidth={2} />
      <Path d="M36 50V40h10" fill="none" stroke={W.jelaga} strokeWidth={2} />
      <Path d="M17 18h22M17 25h22M17 32h14" stroke={W.tinta2} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function NotaKiriman({ ukuran = 56 }: { ukuran?: number }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 56 56" aria-hidden focusable={false}>
      <Path d="M14 6h28v44l-4-3-4 3-4-3-4 3-4-3-4 3-4-3z" fill={W.kertas} stroke={W.jelaga} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M19 15h18M19 21h18M19 27h10" stroke={W.garisTegas} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19 36h18" stroke={W.jelaga} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}
