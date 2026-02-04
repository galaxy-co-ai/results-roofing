import { describe, it, expect } from 'vitest';
import { calculateTierPrice, getTierDisplayName, pricingKeys } from './usePricingTiers';

describe('Pricing Tier Hooks', () => {
  describe('pricingKeys', () => {
    it('should generate correct query keys', () => {
      expect(pricingKeys.all).toEqual(['pricing']);
      expect(pricingKeys.tiers()).toEqual(['pricing', 'tiers']);
    });
  });

  describe('calculateTierPrice', () => {
    const mockTier = {
      id: '1',
      name: 'Test Tier',
      tier: 'good' as const,
      description: 'Test description',
      materialCostPerSqft: '2.50',
      laborCostPerSqft: '3.00',
      warrantyYears: 25,
      warrantyType: 'Limited',
      shingleType: '3-Tab',
      features: ['Feature 1'],
      isPopular: false,
      isActive: true,
      sortOrder: 1,
    };

    it('should calculate total price correctly', () => {
      // 2.50 + 3.00 = 5.50 per sqft
      // 1000 sqft * 5.50 = 5500
      expect(calculateTierPrice(mockTier, 1000)).toBe(5500);
    });

    it('should handle larger square footage', () => {
      // 2500 sqft * 5.50 = 13750
      expect(calculateTierPrice(mockTier, 2500)).toBe(13750);
    });

    it('should handle zero square footage', () => {
      expect(calculateTierPrice(mockTier, 0)).toBe(0);
    });

    it('should round to nearest dollar', () => {
      // 1001 sqft * 5.50 = 5505.5 -> 5506
      expect(calculateTierPrice(mockTier, 1001)).toBe(5506);
    });

    it('should handle decimal pricing correctly', () => {
      const tierWithDecimals = {
        ...mockTier,
        materialCostPerSqft: '2.75',
        laborCostPerSqft: '3.25',
      };
      // 6.00 per sqft * 1000 = 6000
      expect(calculateTierPrice(tierWithDecimals, 1000)).toBe(6000);
    });
  });

  describe('getTierDisplayName', () => {
    it('should return correct display name for good tier', () => {
      expect(getTierDisplayName('good')).toBe('Essential');
    });

    it('should return correct display name for better tier', () => {
      expect(getTierDisplayName('better')).toBe('Premium');
    });

    it('should return correct display name for best tier', () => {
      expect(getTierDisplayName('best')).toBe('Elite');
    });
  });
});
