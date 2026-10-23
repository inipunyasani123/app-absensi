import { Platform, TextStyle } from 'react-native';

// Identitas "kartu absen manila & tinta stempel".
export const W = {
  manila: '#EFDCA6', // latar: manila kuning kartu absen
  kertas: '#FCF6E4', // permukaan kartu
  kertas2: '#F6EBCD',
  garis: '#DFCB97', // garis dekoratif
  garisTegas: '#B59E66',
  tinta: '#1E1A15',
  tinta2: '#574B3C', // teks sekunder (6,2:1 di manila)
  jelaga: '#1E1A15', // ubin gelap
  diJelaga: '#F3EAD6',
  diJelaga2: '#B8AE9A',
  stempel: '#A6351B', // merah bata (telat, tombol stempel) — 5:1 di manila
  stempelMuda: '#F6D9CF',
  stempelTua: '#7A2412',
  hijau: '#2F6A3C', // tepat waktu
  hijauMuda: '#DCEBD5',
  hijauTua: '#1E4A2A',
  ungu: '#3E3570', // cuti/izin
  unguMuda: '#E3DEF2',
  kunyit: '#EBC24A', // penanda
  kunyitMuda: '#F8EBC0',
  oranyeTerang: '#FF8A5C', // aksen di latar gelap
};

const web = Platform.OS === 'web';

function f(webFamily: string, weight: TextStyle['fontWeight'], native: string): TextStyle {
  return web ? { fontFamily: webFamily, fontWeight: weight } : { fontFamily: native };
}

const DISPLAY = '"Stint Ultra Condensed", "Arial Narrow", Georgia, serif';
const ISI = '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = '"Spline Sans Mono", ui-monospace, "SFMono-Regular", Menlo, monospace';

export const TABULAR: TextStyle['fontVariant'] = ['tabular-nums'];

export const H: Record<'display' | 'isi' | 'isiSedang' | 'isiTebal' | 'mono' | 'monoTebal', TextStyle> = {
  display: f(DISPLAY, '400', 'StintUC-400'),
  isi: f(ISI, '400', 'Hanken-400'),
  isiSedang: f(ISI, '600', 'Hanken-600'),
  isiTebal: f(ISI, '700', 'Hanken-700'),
  mono: { ...f(MONO, '500', 'SplineMono-500'), fontVariant: TABULAR },
  monoTebal: { ...f(MONO, '600', 'SplineMono-600'), fontVariant: TABULAR },
};

export const R = { kecil: 10, sedang: 16, besar: 22 };

export const WARNA_SHIFT = {
  subuh: '#8C82C4',
  pagi: W.kunyit,
  siang: '#7FB58A',
  sore: '#D9765A',
  libur: 'transparent',
} as const;
