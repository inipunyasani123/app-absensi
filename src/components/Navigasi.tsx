// Android/iOS: tumpukan layar native dengan animasi geser.
import Stack from 'expo-router/stack';
import { W } from '@/theme';

export function Navigasi() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.manila }, animation: 'slide_from_right' }} />;
}
