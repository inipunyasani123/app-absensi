import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true bila pengguna meminta gerak dikurangi (prefers-reduced-motion / setelan sistem). */
export function useGerakDikurangi() {
  const [kurang, setKurang] = useState(false);
  useEffect(() => {
    let aktif = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => aktif && setKurang(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => setKurang(!!v));
    return () => {
      aktif = false;
      sub?.remove?.();
    };
  }, []);
  return kurang;
}
