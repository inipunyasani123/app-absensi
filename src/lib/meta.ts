import type { Metadata } from 'expo-router/server';

export const SITUS = 'https://app-absensi.pintuweb.id';

/** Metadata statis per rute (judul ≤60, deskripsi ≤155, canonical absolut). */
export function meta(path: string, title: string, description: string, noindex = false): Metadata {
  const url = SITUS + path;
  const og = { url: `${SITUS}/og.jpg`, width: 1200, height: 630, alt: 'Gilir, demo aplikasi absensi & HR karyawan buatan PintuWeb' };
  return {
    title,
    description,
    applicationName: 'Gilir',
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'id_ID', url, siteName: 'Gilir · Demo PintuWeb', title, description, images: [og] },
    twitter: { card: 'summary_large_image', title, description, images: [og.url] },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}
