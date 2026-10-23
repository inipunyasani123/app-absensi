import { ReactNode, useState } from 'react';
import {
  Platform, Pressable, PressableProps, ScrollView, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { Href, Link, router } from '@/lib/nav';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H, R, TABULAR, W } from '@/theme';
import { Ikon, NamaIkon } from './Ikon';

const web = Platform.OS === 'web';

type Varian = 'raksasa' | 'display' | 'judul' | 'subjudul' | 'isi' | 'kecil' | 'label' | 'mono' | 'monoKecil' | 'angka';

const gayaTeks: Record<Varian, TextStyle> = {
  // Angka besar tanpa kapital paksa (supaya "Rp" tidak menjadi "RP").
  raksasa: { ...H.display, fontSize: 70, lineHeight: 68, letterSpacing: 0.5, fontVariant: TABULAR },
  display: { ...H.display, fontSize: 38, lineHeight: 39, letterSpacing: 0.6, textTransform: 'uppercase' },
  judul: { ...H.display, fontSize: 27, lineHeight: 29, letterSpacing: 0.5, textTransform: 'uppercase' },
  subjudul: { ...H.isiTebal, fontSize: 16, lineHeight: 21 },
  isi: { ...H.isi, fontSize: 15, lineHeight: 22 },
  kecil: { ...H.isi, fontSize: 13, lineHeight: 18 },
  label: { ...H.monoTebal, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
  mono: { ...H.mono, fontSize: 14, lineHeight: 19 },
  monoKecil: { ...H.mono, fontSize: 12, lineHeight: 16 },
  angka: { ...H.display, fontSize: 44, lineHeight: 44, fontVariant: TABULAR },
};

type TeksProps = TextProps & {
  v?: Varian;
  warna?: string;
  tingkat?: 1 | 2 | 3;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
};

/** Teks dengan tipografi Gilir. `tingkat` menjadikannya heading (h1–h3 di web). */
export function Teks({ v = 'isi', warna = W.tinta, tingkat, style, children, ...rest }: TeksProps) {
  const a11y = tingkat ? ({ role: 'heading', 'aria-level': tingkat } as object) : {};
  return (
    <Text {...a11y} {...rest} style={[gayaTeks[v], { color: warna }, style]}>
      {children}
    </Text>
  );
}

type KartuProps = {
  children: ReactNode;
  nada?: 'kertas' | 'jelaga' | 'kunyit' | 'hijau' | 'stempel' | 'ungu' | 'polos';
  lubang?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
};

const nadaKartu = {
  kertas: { backgroundColor: W.kertas, borderColor: W.garis },
  jelaga: { backgroundColor: W.jelaga, borderColor: W.jelaga },
  kunyit: { backgroundColor: W.kunyit, borderColor: '#D9AE34' },
  hijau: { backgroundColor: W.hijauMuda, borderColor: '#BBD3B0' },
  stempel: { backgroundColor: W.stempelMuda, borderColor: '#E8B9AA' },
  ungu: { backgroundColor: W.unguMuda, borderColor: '#C9C1E4' },
  polos: { backgroundColor: 'transparent', borderColor: W.garisTegas },
};

/** Kartu ber-"lubang pons" seperti kartu absen lama. */
export function Kartu({ children, nada = 'kertas', lubang, style, label }: KartuProps) {
  return (
    <View
      style={[s.kartu, nadaKartu[nada], style]}
      {...(label ? ({ role: 'group', 'aria-label': label } as object) : {})}
    >
      {lubang && <Lubang gelap={nada === 'jelaga'} />}
      {children}
    </View>
  );
}

export function Lubang({ gelap, jumlah = 9 }: { gelap?: boolean; jumlah?: number }) {
  return (
    <View style={s.lubangBaris} aria-hidden>
      {Array.from({ length: jumlah }, (_, i) => (
        <View key={i} style={[s.lubang, { backgroundColor: gelap ? '#3A332A' : W.manila, borderColor: gelap ? '#2C2620' : W.garis }]} />
      ))}
    </View>
  );
}

type TombolProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  ikon?: NamaIkon;
  varian?: 'utama' | 'stempel' | 'garis' | 'teks' | 'terang';
  besar?: boolean;
  style?: StyleProp<ViewStyle>;
  keterangan?: string;
};

const gayaTombol = {
  utama: { bg: W.jelaga, fg: W.diJelaga, border: W.jelaga },
  stempel: { bg: W.stempel, fg: '#FFF8EE', border: W.stempelTua },
  garis: { bg: 'transparent', fg: W.tinta, border: W.tinta },
  teks: { bg: 'transparent', fg: W.tinta, border: 'transparent' },
  terang: { bg: W.diJelaga, fg: W.tinta, border: W.diJelaga },
};

export function Tombol({ label, ikon, varian = 'utama', besar, style, disabled, keterangan, ...rest }: TombolProps) {
  const g = gayaTombol[varian];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={keterangan ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        s.tombol,
        besar && s.tombolBesar,
        { backgroundColor: g.bg, borderColor: g.border },
        varian === 'teks' && { paddingHorizontal: 6, minHeight: 40 },
        pressed && { transform: [{ translateY: 1 }], opacity: 0.9 },
        disabled && { opacity: 0.45 },
        style,
      ]}
      {...rest}
    >
      {ikon && <Ikon nama={ikon} warna={g.fg} ukuran={besar ? 24 : 20} />}
      <Text style={[besar ? s.tombolTeksBesar : s.tombolTeks, { color: g.fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Cap tinta miring. */
export function Stempel({
  teks, sub, warna = W.stempel, miring = -4, kecil,
}: { teks: string; sub?: string; warna?: string; miring?: number; kecil?: boolean }) {
  return (
    <View style={[s.stempel, { borderColor: warna, transform: [{ rotate: `${miring}deg` }] }, kecil && s.stempelKecil]}>
      <Text style={[kecil ? s.stempelTeksKecil : s.stempelTeks, { color: warna }]}>{teks}</Text>
      {sub ? <Text style={[s.stempelSub, { color: warna }]}>{sub}</Text> : null}
    </View>
  );
}

export function Chip({ teks, nada = 'kertas' }: { teks: string; nada?: 'kertas' | 'kunyit' | 'hijau' | 'stempel' | 'ungu' | 'jelaga' }) {
  const warna = {
    kertas: [W.kertas2, W.tinta], kunyit: [W.kunyitMuda, W.tinta], hijau: [W.hijauMuda, W.hijauTua],
    stempel: [W.stempelMuda, W.stempelTua], ungu: [W.unguMuda, W.ungu], jelaga: [W.jelaga, W.diJelaga],
  }[nada];
  return (
    <View style={[s.chip, { backgroundColor: warna[0] }]}>
      <Text style={[s.chipTeks, { color: warna[1] }]}>{teks}</Text>
    </View>
  );
}

export function Kerangka({ tinggi = 18, lebar = '60%', gelap }: { tinggi?: number; lebar?: number | `${number}%`; gelap?: boolean }) {
  return <View aria-hidden style={{ height: tinggi, width: lebar, borderRadius: 6, backgroundColor: gelap ? '#3A332A' : W.kertas2 }} />;
}

type LayarProps = {
  judul: string;
  sub?: string;
  kembali?: boolean | string;
  kanan?: ReactNode;
  children: ReactNode;
  tab?: boolean;
  kecil?: boolean;
  lapisan?: ReactNode; // lembar bawah/snackbar yang menutupi layar
};

/** Kerangka layar: kepala bergaris ganda ala buku besar + isi yang bisa digulir. */
export function Layar({ judul, sub, kembali, kanan, children, tab, kecil, lapisan }: LayarProps) {
  const inset = useSafeAreaInsets();
  // Kepala memadat setelah digulir (dengan histeresis agar tidak berkedip di ambang).
  const [padat, setPadat] = useState(false);
  return (
    <View style={s.layar} {...(web ? ({ role: 'main' } as object) : {})}>
      <View style={[s.kepala, { paddingTop: Math.max(inset.top, 12) + (padat ? 0 : 6) }, padat && s.kepalaPadat]}>
        <View style={s.kepalaBaris}>
          {kembali ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace(typeof kembali === 'string' ? (kembali as never) : '/');
              }}
              style={({ pressed }) => [s.kembali, pressed && { opacity: 0.7 }]}
            >
              <Ikon nama="kiri" ukuran={22} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            {sub && !padat ? <Teks v="label" warna={W.tinta2}>{sub}</Teks> : null}
            <Teks v={kecil || padat ? 'judul' : 'display'} tingkat={1} numberOfLines={padat ? 1 : kecil ? undefined : 2}>
              {judul}
            </Teks>
          </View>
          {kanan}
        </View>
        <View style={[s.garisGanda, padat && { marginTop: 6 }]} aria-hidden>
          <View style={{ height: 2, backgroundColor: W.tinta }} />
          <View style={{ height: 3 }} />
          <View style={{ height: 1, backgroundColor: W.tinta }} />
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.isi, { paddingBottom: tab ? 24 : Math.max(inset.bottom, 16) + 24 }]}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (!padat && y > 56) setPadat(true);
          else if (padat && y < 8) setPadat(false);
        }}
      >
        {children}
      </ScrollView>
      {lapisan}
    </View>
  );
}

type SegmenProps<T extends string> = {
  pilihan: { nilai: T; label: string }[];
  nilai: T;
  ubah: (v: T) => void;
  label: string;
};

/** Kontrol segmen (radiogroup). */
export function Segmen<T extends string>({ pilihan, nilai, ubah, label }: SegmenProps<T>) {
  return (
    <View style={s.segmen} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {pilihan.map((p) => {
        const aktif = p.nilai === nilai;
        return (
          <Pressable
            key={p.nilai}
            accessibilityRole="radio"
            aria-checked={aktif}
            onPress={() => ubah(p.nilai)}
            style={[s.segmenItem, aktif && s.segmenAktif]}
          >
            <Text style={[s.segmenTeks, { color: aktif ? W.diJelaga : W.tinta }]}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type TautanProps = { href: Href; label?: string; children: ReactNode; style?: StyleProp<ViewStyle> };

/** Kartu/elemen yang berupa tautan (<a> di web). */
export function Tautan({ href, label, children, style }: TautanProps) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={label} style={StyleSheet.flatten(style)}>
        {children}
      </Pressable>
    </Link>
  );
}

export function Baris({ children, gap = 10, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', gap }, style]}>{children}</View>;
}

export const s = StyleSheet.create({
  layar: { flex: 1, backgroundColor: W.manila },
  kepala: { paddingHorizontal: 18, paddingBottom: 10, backgroundColor: W.manila },
  kepalaPadat: { paddingBottom: 6 },
  kepalaBaris: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  garisGanda: { marginTop: 10 },
  kembali: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  isi: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  kartu: { borderRadius: R.besar, borderWidth: 1, padding: 16, overflow: 'hidden' },
  lubangBaris: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6, marginBottom: 10, paddingHorizontal: 2, alignSelf: 'stretch' },
  lubang: { width: 9, height: 9, borderRadius: 5, borderWidth: 1 },
  tombol: {
    minHeight: 48, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  tombolBesar: { minHeight: 60, borderRadius: 18 },
  tombolTeks: { ...H.isiTebal, fontSize: 15 },
  tombolTeksBesar: { ...H.display, fontSize: 28, letterSpacing: 1, textTransform: 'uppercase' },
  stempel: { borderWidth: 2.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', alignItems: 'center' },
  stempelKecil: { borderWidth: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  stempelTeks: { ...H.monoTebal, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  stempelTeksKecil: { ...H.monoTebal, fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase' },
  stempelSub: { ...H.mono, fontSize: 12, letterSpacing: 0.4 },
  chip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  chipTeks: { ...H.monoTebal, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  segmen: { flexDirection: 'row', backgroundColor: W.kertas2, borderRadius: 14, padding: 4, gap: 4, borderWidth: 1, borderColor: W.garis },
  segmenItem: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmenAktif: { backgroundColor: W.jelaga },
  segmenTeks: { ...H.isiTebal, fontSize: 13.5, textAlign: 'center' },
});

export { web };
