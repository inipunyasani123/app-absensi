import { ReactNode, useEffect, useId, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { W } from '@/theme';
import { Ikon } from './Ikon';
import { Teks } from './ui';

const web = Platform.OS === 'web';


type Props = { buka: boolean; tutup: () => void; judul: string; children: ReactNode; nativeID?: string; tanpaTutup?: boolean };

/**
 * Lembar bawah: latar redup (ketuk untuk menutup), pegangan, tombol Tutup berlabel,
 * fokus pindah ke lembar & terkunci di dalamnya, Esc menutup (web), fokus kembali ke pemicu.
 */
export function Lembar({ buka, tutup, judul, children, nativeID, tanpaTutup }: Props) {
  const ref = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const idJudul = useId();

  useEffect(() => {
    if (!buka || !web) return;
    const pemicu = document.activeElement as HTMLElement | null;
    const el = ref.current as unknown as HTMLElement | null;
    const fokusan = () =>
      el
        ? ([...el.querySelectorAll('a[href],[role="button"],[role="link"],[role="radio"],input,textarea,[tabindex="0"]')] as HTMLElement[]).filter(
            (x) => x.tabIndex >= 0 && x.offsetParent !== null,
          )
        : [];
    const t = setTimeout(() => fokusan()[0]?.focus(), 40);
    const tekan = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        tutup();
      } else if (e.key === 'Tab') {
        const f = fokusan();
        if (!f.length) return;
        const pertama = f[0];
        const akhir = f[f.length - 1];
        if (e.shiftKey && document.activeElement === pertama) {
          e.preventDefault();
          akhir.focus();
        } else if (!e.shiftKey && document.activeElement === akhir) {
          e.preventDefault();
          pertama.focus();
        } else if (!el?.contains(document.activeElement)) {
          e.preventDefault();
          pertama.focus();
        }
      }
    };
    document.addEventListener('keydown', tekan);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', tekan);
      if (pemicu && document.contains(pemicu)) pemicu.focus?.();
    };
  }, [buka, tutup]);

  if (!buka) return null;
  return (
    <View style={StyleSheet.absoluteFill} nativeID={nativeID}>
      <Pressable style={st.latar} onPress={tutup} focusable={false} accessible={false} {...({ 'aria-hidden': true } as object)} />
      <View
        ref={ref}
        style={st.lembar}
        {...({ role: 'dialog', 'aria-modal': true, 'aria-labelledby': idJudul } as object)}
        accessibilityViewIsModal
      >
        <View style={st.pegangan} aria-hidden />
        <View style={st.kepala}>
          <Teks v="judul" nativeID={idJudul} style={{ flex: 1 }}>{judul}</Teks>
          {!tanpaTutup && (
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup" onPress={tutup} style={st.tutup}>
              <Ikon nama="silang" ukuran={20} />
            </Pressable>
          )}
        </View>
        {children}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  latar: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,26,21,0.55)' },
  lembar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: W.kertas, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 18, paddingBottom: 22, paddingTop: 8, gap: 12, borderTopWidth: 3, borderColor: W.stempel, maxHeight: '88%',
  },
  pegangan: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: W.garisTegas, marginBottom: 2 },
  kepala: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tutup: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
});
