// Android/iOS: muat TTF statis per ketebalan; nama keluarga dipakai lewat theme.ts.
import { useFonts } from 'expo-font';

export function useHuruf() {
  const [siap] = useFonts({
    'StintUC-400': require('../../assets/fonts/StintUltraCondensed-400.ttf'),
    'Hanken-400': require('../../assets/fonts/Hanken-400.ttf'),
    'Hanken-600': require('../../assets/fonts/Hanken-600.ttf'),
    'Hanken-700': require('../../assets/fonts/Hanken-700.ttf'),
    'SplineMono-500': require('../../assets/fonts/SplineMono-500.ttf'),
    'SplineMono-600': require('../../assets/fonts/SplineMono-600.ttf'),
  });
  return siap;
}
