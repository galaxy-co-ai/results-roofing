import type { ShingleOption } from './types';

export const SHINGLE_CATALOG: ShingleOption[] = [
  // Good — GAF Royal Sovereign (3-tab)
  { id: 'rs-slate', tier: 'good', name: 'Slate', hex: '#6b7280', texture: '/textures/shingles/rs-slate.jpg', brand: 'GAF Royal Sovereign' },
  { id: 'rs-weathered-gray', tier: 'good', name: 'Weathered Gray', hex: '#9ca3af', texture: '/textures/shingles/rs-weathered-gray.jpg', brand: 'GAF Royal Sovereign' },
  { id: 'rs-autumn-brown', tier: 'good', name: 'Autumn Brown', hex: '#78716c', texture: '/textures/shingles/rs-autumn-brown.jpg', brand: 'GAF Royal Sovereign' },
  { id: 'rs-charcoal', tier: 'good', name: 'Charcoal', hex: '#374151', texture: '/textures/shingles/rs-charcoal.jpg', brand: 'GAF Royal Sovereign' },
  { id: 'rs-golden-cedar', tier: 'good', name: 'Golden Cedar', hex: '#a16207', texture: '/textures/shingles/rs-golden-cedar.jpg', brand: 'GAF Royal Sovereign' },
  // Better — GAF Timberline HDZ (architectural)
  { id: 'hdz-charcoal', tier: 'better', name: 'Charcoal', hex: '#3a3a3c', texture: '/textures/shingles/hdz-charcoal.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-weathered-wood', tier: 'better', name: 'Weathered Wood', hex: '#8b7355', texture: '/textures/shingles/hdz-weathered-wood.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-pewter-gray', tier: 'better', name: 'Pewter Gray', hex: '#7d8491', texture: '/textures/shingles/hdz-pewter-gray.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-barkwood', tier: 'better', name: 'Barkwood', hex: '#6d5c4b', texture: '/textures/shingles/hdz-barkwood.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-hickory', tier: 'better', name: 'Hickory', hex: '#5c4a3a', texture: '/textures/shingles/hdz-hickory.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-shakewood', tier: 'better', name: 'Shakewood', hex: '#a89279', texture: '/textures/shingles/hdz-shakewood.jpg', brand: 'GAF Timberline HDZ' },
  { id: 'hdz-slate', tier: 'better', name: 'Slate', hex: '#4a5568', texture: '/textures/shingles/hdz-slate.jpg', brand: 'GAF Timberline HDZ' },
  // Best — GAF Timberline AS II (designer)
  { id: 'as2-charcoal', tier: 'best', name: 'Charcoal', hex: '#2d2d30', texture: '/textures/shingles/as2-charcoal.jpg', brand: 'GAF Timberline AS II' },
  { id: 'as2-pewter-gray', tier: 'best', name: 'Pewter Gray', hex: '#6b7280', texture: '/textures/shingles/as2-pewter-gray.jpg', brand: 'GAF Timberline AS II' },
  { id: 'as2-barkwood', tier: 'best', name: 'Barkwood', hex: '#5c4a3a', texture: '/textures/shingles/as2-barkwood.jpg', brand: 'GAF Timberline AS II' },
  { id: 'as2-weathered-wood', tier: 'best', name: 'Weathered Wood', hex: '#7a6a55', texture: '/textures/shingles/as2-weathered-wood.jpg', brand: 'GAF Timberline AS II' },
  { id: 'as2-shakewood', tier: 'best', name: 'Shakewood', hex: '#9a8268', texture: '/textures/shingles/as2-shakewood.jpg', brand: 'GAF Timberline AS II' },
  { id: 'as2-hunter-green', tier: 'best', name: 'Hunter Green', hex: '#2d4a3e', texture: '/textures/shingles/as2-hunter-green.jpg', brand: 'GAF Timberline AS II' },
];

export function getShinglesForTier(tier: 'good' | 'better' | 'best'): ShingleOption[] {
  return SHINGLE_CATALOG.filter((s) => s.tier === tier);
}

export function getAllTextureUrls(): string[] {
  return SHINGLE_CATALOG.map((s) => s.texture);
}

export function getDefaultShingle(tier: 'good' | 'better' | 'best'): ShingleOption {
  return SHINGLE_CATALOG.find((s) => s.tier === tier)!;
}
