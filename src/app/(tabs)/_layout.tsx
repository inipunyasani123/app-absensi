import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { TabList, TabSlot, TabTrigger, Tabs, TabTriggerSlotProps } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ikon, NamaIkon } from '@/components/Ikon';
import { H, W } from '@/theme';

type TombolTabProps = TabTriggerSlotProps & { ikon: NamaIkon; label: string };

function TombolTab({ ikon, label, isFocused, ...props }: TombolTabProps) {
  const web = Platform.OS === 'web';
  return (
    <Pressable
      {...(props as object)}
      accessibilityRole={web ? 'link' : 'tab'}
      accessibilityState={{ selected: !!isFocused }}
      {...(web && isFocused ? ({ 'aria-current': 'page' } as object) : {})}
      style={[st.tab]}
    >
      <View style={[st.ikonWadah, isFocused && st.ikonAktif]}>
        <Ikon nama={ikon} ukuran={22} warna={isFocused ? W.tinta : W.diJelaga} />
      </View>
      <Text style={[st.label, { color: isFocused ? W.diJelaga : W.diJelaga2 }]}>{label}</Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const inset = useSafeAreaInsets();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={[st.bar, { paddingBottom: Math.max(inset.bottom, 8) }]}
        {...(Platform.OS === 'web' ? ({ role: 'navigation', 'aria-label': 'Menu utama' } as object) : {})}
      >
          <TabTrigger name="index" href="/" asChild>
            <TombolTab ikon="jam" label="Absen" />
          </TabTrigger>
          <TabTrigger name="jadwal" href="/jadwal" asChild>
            <TombolTab ikon="kalender" label="Jadwal" />
          </TabTrigger>
          <TabTrigger name="pengajuan" href="/pengajuan" asChild>
            <TombolTab ikon="dokumen" label="Ajukan" />
          </TabTrigger>
          <TabTrigger name="rekap" href="/rekap" asChild>
            <TombolTab ikon="rekap" label="Rekap" />
          </TabTrigger>
          <TabTrigger name="gaji" href="/gaji" asChild>
            <TombolTab ikon="dompet" label="Gaji" />
          </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const st = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: W.jelaga, paddingTop: 8, paddingHorizontal: 6,
    borderTopWidth: 3, borderTopColor: W.stempel,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 56, borderRadius: 12 },
  ikonWadah: { width: 44, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ikonAktif: { backgroundColor: W.kunyit },
  label: { ...H.monoTebal, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
});
