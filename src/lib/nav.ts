// Impor jalur-dalam agar bundel web tidak menarik seluruh barrel expo-router (Tabs bawaan, Drawer, dll).
export { Link } from 'expo-router/build/link/Link';
export { router } from 'expo-router/build/imperative-api';
export { useLocalSearchParams } from 'expo-router/build/hooks/useLocalSearchParams';
export type { Href } from 'expo-router';
