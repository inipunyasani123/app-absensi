// Membuat public/qr.svg (kode QR ke alamat demo) saat build. Tanpa layanan luar.
import { writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';

const url = 'https://app-absensi.pintuweb.id/';
const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#1E1A15', light: '#FBF7EE' },
});
await writeFile(new URL('../public/qr.svg', import.meta.url), svg.replace('<svg ', '<svg role="img" aria-label="Kode QR app-absensi.pintuweb.id" '));
console.log('public/qr.svg →', url);
