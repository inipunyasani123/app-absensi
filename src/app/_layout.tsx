import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Navigasi } from '@/components/Navigasi';
import { Panggung } from '@/components/Panggung';
import { useHuruf } from '@/lib/huruf';
import { JUDUL } from '@/lib/judul';
import { GilirProvider } from '@/lib/store';

/** Web: judul tab ikut berganti saat pindah halaman di dalam aplikasi (HTML statis sudah benar sejak awal). */
function JudulTab() {
  const path = usePathname();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const judul = JUDUL[path] ?? JUDUL['/404'];
    if (document.title !== judul) document.title = judul;
  }, [path]);
  return null;
}

export default function RootLayout() {
  const siap = useHuruf();
  if (!siap) return null;
  return (
    <GilirProvider>
      <StatusBar style="dark" />
      <JudulTab />
      <Panggung>
        <Navigasi />
      </Panggung>
    </GilirProvider>
  );
}
