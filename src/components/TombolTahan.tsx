import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { getarRingan } from '@/lib/haptik';
import { H, W } from '@/theme';
import { Ikon, NamaIkon } from './Ikon';

const LAMA = 800;

/**
 * Tombol stempel tekan-tahan (±0,8 detik) agar tidak terpencet tak sengaja.
 * Aktivasi tanpa penekanan fisik (pembaca layar/klik sintetis) langsung menstempel.
 */
export function TombolTahan({ label, ikon, onSelesai, disabled }: { label: string; ikon: NamaIkon; onSelesai: () => void; disabled?: boolean }) {
  const isi = useRef(new Animated.Value(0)).current;
  const [menahan, setMenahan] = useState(false);
  const [petunjuk, setPetunjuk] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tekan = useRef<number | null>(null);
  const beres = useRef(false);

  function mulai() {
    if (disabled) return;
    beres.current = false;
    tekan.current = Date.now();
    setMenahan(true);
    getarRingan();
    Animated.timing(isi, { toValue: 1, duration: LAMA, easing: Easing.linear, useNativeDriver: false }).start();
    timer.current = setTimeout(() => {
      beres.current = true;
      setMenahan(false);
      onSelesai();
    }, LAMA);
  }

  function lepas() {
    if (beres.current) return;
    if (timer.current) clearTimeout(timer.current);
    isi.stopAnimation();
    Animated.timing(isi, { toValue: 0, duration: 160, useNativeDriver: false }).start();
    setMenahan(false);
    if (tekan.current != null) setPetunjuk(true);
  }

  return (
    <View style={{ gap: 6 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Tekan dan tahan sampai penuh untuk menstempel"
        accessibilityState={{ disabled: !!disabled }}
        accessibilityActions={[{ name: 'activate', label }]}
        onAccessibilityAction={() => !disabled && onSelesai()}
        disabled={disabled}
        onPressIn={mulai}
        onPressOut={lepas}
        onPress={() => {
          // Klik tanpa penekanan (mis. pembaca layar di web) → langsung stempel.
          if (tekan.current == null && !beres.current && !disabled) onSelesai();
          tekan.current = null;
        }}
        style={[st.tombol, disabled && { opacity: 0.45 }]}
      >
        <Animated.View
          style={[st.isi, { width: isi.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
          aria-hidden
        />
        <Ikon nama={ikon} warna="#FFF8EE" ukuran={24} />
        <Text style={st.teks}>{menahan ? 'Tahan…' : label}</Text>
      </Pressable>
      <Text style={[st.petunjuk, petunjuk && { color: W.stempelTua }]} aria-live="polite">
        {petunjuk ? 'Tahan sampai penuh, sekitar satu detik.' : 'Tekan dan tahan tombol untuk menstempel (Enter juga bisa ditahan).'}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  tombol: {
    minHeight: 62, borderRadius: 18, borderWidth: 1.5, borderColor: W.stempelTua, backgroundColor: W.stempel, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden',
  },
  isi: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: W.stempelTua },
  teks: { ...H.display, fontSize: 28, letterSpacing: 1, color: '#FFF8EE', textTransform: 'uppercase' },
  petunjuk: { ...H.isi, fontSize: 13, lineHeight: 18, minHeight: 36, color: W.tinta2, textAlign: 'center' },
});
