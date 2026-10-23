// Web: <img> biasa supaya foto sudah ada di HTML statis (Image RN-web baru menggambar setelah JS jalan).
export function FotoRoti() {
  return (
    <img
      src="/images/roti-dapur.webp"
      alt="Rak kayu berisi roti tawar yang baru dipanggang"
      width={720}
      height={480}
      decoding="async"
      style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3 / 2', objectFit: 'cover' }}
    />
  );
}
