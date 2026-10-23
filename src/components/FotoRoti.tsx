import { Image } from 'react-native';
import { FOTO_ROTI } from '@/lib/foto';

export function FotoRoti() {
  return (
    <Image
      source={FOTO_ROTI}
      style={{ width: '100%', aspectRatio: 3 / 2 }}
      accessibilityLabel="Rak kayu berisi roti tawar yang baru dipanggang"
      resizeMode="cover"
    />
  );
}
