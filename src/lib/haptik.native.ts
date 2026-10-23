// Android/iOS: getar ringan saat stempel jatuh.
import * as Haptics from 'expo-haptics';

export function getarBerhasil() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
export function getarRingan() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
