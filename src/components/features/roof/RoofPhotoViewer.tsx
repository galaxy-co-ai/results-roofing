'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';

interface RoofPhotoViewerProps {
  rgb: string;         // base64 PNG — satellite aerial image
  mask: string;        // base64 PNG — binary roof mask (white = roof)
  width: number;       // image width in pixels
  height: number;      // image height in pixels
  shingleHex: string;  // hex color for the selected shingle
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function RoofPhotoViewer({
  rgb,
  mask,
  width,
  height,
  shingleHex,
}: RoofPhotoViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rgbImageRef = useRef<HTMLImageElement | null>(null);
  const maskDataRef = useRef<Uint8ClampedArray | null>(null);

  const shingleRgb = useMemo(() => hexToRgb(shingleHex), [shingleHex]);

  // Load images once, cache pixel data
  const loadImages = useCallback(() => {
    return new Promise<void>((resolve) => {
      // Already loaded
      if (rgbImageRef.current && maskDataRef.current) {
        resolve();
        return;
      }

      let loaded = 0;
      const rgbImg = new Image();
      const maskImg = new Image();

      const check = () => {
        loaded++;
        if (loaded < 2) return;

        rgbImageRef.current = rgbImg;

        // Extract mask pixel data once
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d')!;
        ctx.drawImage(maskImg, 0, 0, width, height);
        maskDataRef.current = ctx.getImageData(0, 0, width, height).data;

        resolve();
      };

      rgbImg.onload = check;
      maskImg.onload = check;
      rgbImg.src = `data:image/png;base64,${rgb}`;
      maskImg.src = `data:image/png;base64,${mask}`;
    });
  }, [rgb, mask, width, height]);

  // Draw with current shingle color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    loadImages().then(() => {
      const rgbImg = rgbImageRef.current;
      const maskPixels = maskDataRef.current;
      if (!rgbImg || !maskPixels) return;

      canvas.width = width;
      canvas.height = height;

      // Draw satellite photo
      ctx.drawImage(rgbImg, 0, 0, width, height);

      // Read pixels
      const imageData = ctx.getImageData(0, 0, width, height);
      const px = imageData.data;

      const ROOF_ALPHA = 0.6;
      const { r, g, b: bl } = shingleRgb;

      for (let i = 0; i < px.length; i += 4) {
        if (maskPixels[i] > 128) {
          // Roof pixel — blend with shingle color
          px[i] = px[i] * (1 - ROOF_ALPHA) + r * ROOF_ALPHA;
          px[i + 1] = px[i + 1] * (1 - ROOF_ALPHA) + g * ROOF_ALPHA;
          px[i + 2] = px[i + 2] * (1 - ROOF_ALPHA) + bl * ROOF_ALPHA;
        } else {
          // Non-roof — subtle dim so roof pops
          px[i] = px[i] * 0.88;
          px[i + 1] = px[i + 1] * 0.88;
          px[i + 2] = px[i + 2] * 0.88;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    });
  }, [width, height, shingleRgb, loadImages]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background, #f0f0f0)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          imageRendering: 'auto',
        }}
      />
    </div>
  );
}
