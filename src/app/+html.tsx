import { useServerDocumentContext } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Hanya berjalan di Node.js saat ekspor statis (web).
const SITUS = 'https://app-absensi.pintuweb.id';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['WebApplication', 'MobileApplication'],
      '@id': `${SITUS}/#aplikasi`,
      name: 'Gilir',
      alternateName: 'Gilir: Absensi & HR Karyawan',
      url: `${SITUS}/`,
      description:
        'Demo aplikasi absensi dan HR karyawan: absen dengan cek radius lokasi, jadwal shift, cuti, izin, lembur, rekap kehadiran, dan slip gaji. Usaha dan datanya rekaan.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Android, iOS, Web',
      inLanguage: 'id',
      isAccessibleForFree: true,
      image: `${SITUS}/og.jpg`,
      creator: { '@id': 'https://www.pintuweb.id/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.pintuweb.id/#organization',
      name: 'PintuWeb',
      url: 'https://www.pintuweb.id',
    },
  ],
};

const css = `
@font-face{font-family:"Stint Ultra Condensed";src:url(/fonts/stint-ultra-condensed.woff2) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Hanken Grotesk";src:url(/fonts/hanken-grotesk.woff2) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}
@font-face{font-family:"Spline Sans Mono";src:url(/fonts/spline-sans-mono.woff2) format("woff2");font-weight:300 700;font-style:normal;font-display:swap}
html{-webkit-text-size-adjust:100%;height:100%;background:#EFDCA6}
body{margin:0;min-height:100%;background:#EFDCA6;color:#1E1A15;overscroll-behavior-y:none;-webkit-tap-highlight-color:transparent}
#root{display:flex;flex-direction:column;min-height:100vh;min-height:100dvh}
#layar{flex:none!important;height:100vh;height:100dvh;width:100%;overflow:hidden}
#panel{display:none!important}
html.kenal #kenalan{display:none!important}
:focus-visible{outline:3px solid #7A2412!important;outline-offset:2px}
input:focus-visible,textarea:focus-visible{outline-offset:0}
@media (min-width:768px){
  html,body{background-color:#E6CD86;background-image:repeating-linear-gradient(0deg,rgba(30,26,21,.08) 0 1px,transparent 1px 32px),repeating-linear-gradient(90deg,rgba(30,26,21,.05) 0 1px,transparent 1px 32px)}
  #panggung{flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:56px;padding:32px 24px;min-height:100vh;box-sizing:border-box}
  #layar{flex:none!important;width:390px!important;height:min(844px,calc(100vh - 64px))!important;min-height:640px;border-radius:46px;border:11px solid #1E1A15;box-shadow:0 34px 70px -24px rgba(30,26,21,.55),0 0 0 2px #3A332A;box-sizing:content-box}
  #panel{display:flex!important}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1E1A15" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Gilir" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/ikon/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/ikon/favicon-48.png" sizes="48x48" type="image/png" />
        <link rel="apple-touch-icon" href="/ikon/apple-touch-icon.png" />
        <link rel="preload" href="/fonts/stint-ultra-condensed.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/hanken-grotesk.woff2" as="font" type="font/woff2" crossOrigin="" />
        <style id="gilir-dasar" dangerouslySetInnerHTML={{ __html: css }} />
        {/* Sembunyikan pengenalan sebelum hidrasi bila pengunjung sudah pernah menutupnya. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var g=localStorage.getItem('gilir:demo:v1');if(g&&g.indexOf('\"kenal\":true')>-1)document.documentElement.classList.add('kenal')}catch(e){}",
          }}
        />
        {headNodes}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body {...bodyAttributes}>
        {children}
        <aside
          aria-label="Tentang situs demo ini"
          style={{
            display: 'block', margin: 0, padding: '12px 16px', background: '#0f1b33', color: '#dfe6f3',
            font: '400 13px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', textAlign: 'center',
          }}
        >
          Situs demo buatan PintuWeb — nama dan isinya rekaan.{' '}
          <a
            href="https://www.pintuweb.id/kontak?demo=absensi"
            style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Pesan aplikasi seperti ini →
          </a>
        </aside>
        {bodyNodes}
      </body>
    </html>
  );
}
