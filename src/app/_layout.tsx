import { StatusBar } from 'expo-status-bar';
import { Navigasi } from '@/components/Navigasi';
import { Panggung } from '@/components/Panggung';
import { useHuruf } from '@/lib/huruf';
import { GilirProvider } from '@/lib/store';

export default function RootLayout() {
  const siap = useHuruf();
  if (!siap) return null;
  return (
    <GilirProvider>
      <StatusBar style="dark" />
      <Panggung>
        <Navigasi />
      </Panggung>
    </GilirProvider>
  );
}
