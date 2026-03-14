'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface RoofCanvasViewerProps {
  /** Base64-encoded PNG satellite image */
  rgbBase64: string;
  /** Base64-encoded PNG roof mask */
  maskBase64: string;
  /** Width of the image in pixels */
  width: number;
  /** Height of the image in pixels */
  height: number;
  /** Hex color of the selected shingle */
  shingleHex: string;
  /** Name of the selected shingle (for aria-label) */
  shingleName: string;
}

const COLOR_ALPHA = 0.65;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.2;

/**
 * Renders a satellite image with shingle color applied only to masked roof pixels.
 * Uses HTML Canvas with multiply blend mode for natural-looking color application.
 * Supports zoom (scroll/pinch) and pan (drag) interactions.
 */
export function RoofCanvasViewer({
  rgbBase64,
  maskBase64,
  width,
  height,
  shingleHex,
  shingleName,
}: RoofCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rgbImage, setRgbImage] = useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);

  // Zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Load images from base64
  useEffect(() => {
    let cancelled = false;

    const rgb = new Image();
    const mask = new Image();

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2 && !cancelled) {
        setRgbImage(rgb);
        setMaskImage(mask);
        setLoading(false);
      }
    };

    rgb.onload = onLoad;
    mask.onload = onLoad;
    rgb.onerror = () => { if (!cancelled) setLoading(false); };
    mask.onerror = () => { if (!cancelled) setLoading(false); };

    rgb.src = `data:image/png;base64,${rgbBase64}`;
    mask.src = `data:image/png;base64,${maskBase64}`;

    return () => { cancelled = true; };
  }, [rgbBase64, maskBase64]);

  // Render to canvas whenever images or shingle color changes
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rgbImage || !maskImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw satellite image as base
    ctx.drawImage(rgbImage, 0, 0, width, height);

    // 2. Create mask canvas — extract alpha from mask image
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.drawImage(maskImage, 0, 0, width, height);
    const maskData = maskCtx.getImageData(0, 0, width, height);

    // 3. Create color overlay canvas — filled with shingle color, masked to roof
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = width;
    colorCanvas.height = height;
    const colorCtx = colorCanvas.getContext('2d')!;
    colorCtx.fillStyle = shingleHex;
    colorCtx.fillRect(0, 0, width, height);

    // Apply mask as alpha channel on color overlay
    const colorData = colorCtx.getImageData(0, 0, width, height);
    for (let i = 0; i < maskData.data.length; i += 4) {
      // mask pixel R channel: 255 = roof, 0 = not roof
      const isRoof = maskData.data[i] > 128;
      colorData.data[i + 3] = isRoof ? Math.round(COLOR_ALPHA * 255) : 0;
    }
    colorCtx.putImageData(colorData, 0, 0);

    // 4. Composite color onto satellite with multiply blend
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(colorCanvas, 0, 0);

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [rgbImage, maskImage, width, height, shingleHex]);

  useEffect(() => {
    render();
  }, [render]);

  // ── Zoom/Pan handlers ──────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.01 * ZOOM_STEP)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Reset zoom/pan on double-click
  const handleDoubleClick = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--rr-color-surface)',
        cursor: zoom > 1 ? 'grab' : 'zoom-in',
        touchAction: 'none', // Prevent browser scroll on touch
      }}
      role="img"
      aria-label={`Aerial view of your roof with ${shingleName} shingles`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Loading state */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, var(--rr-color-surface) 0%, var(--rr-color-background) 100%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: loading ? 'none' : 'block',
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center',
          transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
        }}
      />

      {/* Shingle color badge */}
      {!loading && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 500,
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: shingleHex,
            border: '1.5px solid rgba(255,255,255,0.5)',
          }} />
          {shingleName}
        </div>
      )}

      {/* Attribution */}
      {!loading && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          fontSize: '0.625rem',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Imagery © Google
        </div>
      )}
    </div>
  );
}
