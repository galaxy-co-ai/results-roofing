'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Eraser } from 'lucide-react';
import styles from './SignaturePad.module.css';

interface SignaturePadProps {
  /** Callback when signature changes (base64 data URL or null) */
  onSignatureChange: (dataUrl: string | null) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Canvas-based signature capture component
 * Supports touch and mouse input
 */
export function SignaturePad({
  onSignatureChange,
  disabled = false,
  className = '',
  placeholder = 'Sign here',
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Get canvas context with proper settings
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    return ctx;
  }, []);

  // Get coordinates from mouse or touch event
  const getCoordinates = useCallback((e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  // Start drawing
  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    if (disabled) return;

    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPointRef.current = coords;
  }, [disabled, getCoordinates]);

  // Draw line
  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing || disabled) return;

    e.preventDefault();
    const ctx = getContext();
    const coords = getCoordinates(e);

    if (!ctx || !coords || !lastPointRef.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPointRef.current = coords;

    if (!hasSignature) {
      setHasSignature(true);
    }
  }, [isDrawing, disabled, getContext, getCoordinates, hasSignature]);

  // Stop drawing and emit signature
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    lastPointRef.current = null;

    // Emit signature data
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  }, [isDrawing, hasSignature, onSignatureChange]);

  // Clear signature
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onSignatureChange(null);
    }
  }, [getContext, onSignatureChange]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => stopDrawing();
    const handleMouseLeave = () => stopDrawing();

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = () => stopDrawing();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      // Store current drawing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && hasSignature) {
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize with device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);

        // Restore drawing if there was one
        if (tempCtx && hasSignature) {
          ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [hasSignature]);

  return (
    <div className={`${styles.container} ${className} ${disabled ? styles.disabled : ''}`}>
      <label className={styles.label}>
        Your Signature <span className={styles.required}>*</span>
      </label>
      <div className={`${styles.canvasWrapper} ${hasSignature ? styles.hasSigned : ''}`}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Signature pad"
        />
        {!hasSignature && (
          <div className={styles.placeholderContainer}>
            <span className={styles.placeholder}>{placeholder}</span>
            <span className={styles.instruction}>(Use your mouse or finger)</span>
          </div>
        )}
        <div className={styles.baseline} aria-hidden="true" />
      </div>
      {hasSignature && !disabled && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={clearSignature}
          aria-label="Clear signature"
        >
          <Eraser size={14} />
          Clear Signature
        </button>
      )}
    </div>
  );
}

export default SignaturePad;
