/**
 * QRCode — génère un QR code entièrement côté navigateur (librairie
 * embarquée, aucun appel réseau) pour scanner directement une clé 2FA au
 * lieu de la recopier à la main.
 */
import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

export default function QRCode({ value, size = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0F1923', light: '#FFFFFF' },
    }).catch(() => {});
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 8 }} />;
}
