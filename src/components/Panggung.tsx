import { ReactNode } from 'react';
import { View } from 'react-native';

// Android/iOS: aplikasi layar penuh tanpa bingkai.
export function Panggung({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
