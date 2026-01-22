import { describe, it, expect } from 'vitest';
import {
  estimateRoofSqft,
  calculatePriceRange,
  calculateDeposit,
  calculatePriceRanges,
  calculateQuotePricing,
  getPitchCategory,
} from './index';

describe('Pricing Engine', () => {
  describe('estimateRoofSqft', () => {
    it('should return Texas regional average for TX', () => {
      const result = estimateRoofSqft('TX');
      expect(result.sqftEstimate).toBe(2800);
      expect(result.sqftMin).toBe(1800);
      expect(result.sqftMax).toBe(4500);
      expect(result.confidence).toBe('low');
      expect(result.source).toBe('regional_average');
    });

    it('should return Georgia regional average for GA', () => {
      const result = estimateRoofSqft('GA');
      expect(result.sqftEstimate).toBe(2600);
      expect(result.sqftMin).toBe(1600);
      expect(result.sqftMax).toBe(4200);
    });

    it('should return North Carolina regional average for NC', () => {
      const result = estimateRoofSqft('NC');
      expect(result.sqftEstimate).toBe(2400);
      expect(result.sqftMin).toBe(1500);
      expect(result.sqftMax).toBe(3800);
    });

    it('should return Arizona regional average for AZ', () => {
      const result = estimateRoofSqft('AZ');
      expect(result.sqftEstimate).toBe(2500);
      expect(result.sqftMin).toBe(1600);
      expect(result.sqftMax).toBe(4000);
    });

    it('should handle lowercase state codes', () => {
      const result = estimateRoofSqft('tx');
      expect(result.sqftEstimate).toBe(2800);
    });

    it('should return default for unknown states', () => {
      const result = estimateRoofSqft('XX');
      expect(result.sqftEstimate).toBe(2500);
      expect(result.sqftMin).toBe(1500);
      expect(result.sqftMax).toBe(4000);
    });
  });

  describe('calculatePriceRange', () => {
    it('should calculate price range correctly', () => {
      const result = calculatePriceRange(1800, 4500, 3.5, 3.5);
      expect(result.min).toBe(12600); // 1800 * 7
      expect(result.max).toBe(31500); // 4500 * 7
    });

    it('should handle zero sq ft', () => {
      const result = calculatePriceRange(0, 0, 3.5, 3.5);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
    });

    it('should round to nearest dollar', () => {
      const result = calculatePriceRange(1000, 1000, 2.55, 2.55);
      expect(result.min).toBe(5100);
      expect(result.max).toBe(5100);
    });
  });

  describe('calculateDeposit', () => {
    it('should calculate 10% deposit', () => {
      const deposit = calculateDeposit(10000);
      expect(deposit).toBe(1000);
    });

    it('should enforce minimum deposit of $500', () => {
      const deposit = calculateDeposit(3000);
      expect(deposit).toBe(500); // 10% of 3000 = 300, but min is 500
    });

    it('should enforce maximum deposit of $2500', () => {
      const deposit = calculateDeposit(50000);
      expect(deposit).toBe(2500); // 10% of 50000 = 5000, but max is 2500
    });

    it('should return minimum for very small totals', () => {
      const deposit = calculateDeposit(1000);
      expect(deposit).toBe(500); // 10% = 100, but min is 500
    });
  });

  describe('getPitchCategory', () => {
    it('should return standard for pitches 4-7', () => {
      expect(getPitchCategory(4)).toBe('standard');
      expect(getPitchCategory(5)).toBe('standard');
      expect(getPitchCategory(6)).toBe('standard');
      expect(getPitchCategory(7)).toBe('standard');
    });

    it('should return steep for pitches 8-10', () => {
      expect(getPitchCategory(8)).toBe('steep');
      expect(getPitchCategory(9)).toBe('steep');
      expect(getPitchCategory(10)).toBe('steep');
    });

    it('should return very_steep for pitches over 10', () => {
      expect(getPitchCategory(11)).toBe('very_steep');
      expect(getPitchCategory(12)).toBe('very_steep');
      expect(getPitchCategory(14)).toBe('very_steep');
    });
  });

  describe('calculatePriceRanges', () => {
    const mockTiers = [
      {
        id: '1',
        tier: 'good',
        displayName: 'Good',
        description: 'Basic package',
        materialPricePerSqft: '2.50',
        laborPricePerSqft: '3.00',
        warrantyYears: 25,
        warrantyType: 'Limited',
        shingleType: '3-Tab',
        features: ['Basic coverage'],
        isPopular: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        tier: 'better',
        displayName: 'Better',
        description: 'Recommended package',
        materialPricePerSqft: '3.50',
        laborPricePerSqft: '3.50',
        warrantyYears: 30,
        warrantyType: 'Full',
        shingleType: 'Architectural',
        features: ['Full coverage'],
        isPopular: true,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        tier: 'best',
        displayName: 'Best',
        description: 'Premium package',
        materialPricePerSqft: '5.00',
        laborPricePerSqft: '4.00',
        warrantyYears: 50,
        warrantyType: 'Lifetime',
        shingleType: 'Designer',
        features: ['Lifetime coverage'],
        isPopular: false,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as const;

    it('should calculate price ranges for all tiers', () => {
      const result = calculatePriceRanges(2000, 3000, mockTiers as never);
      
      expect(result).toHaveLength(3);
      
      // Good tier: $5.50/sqft
      expect(result[0].tier).toBe('good');
      expect(result[0].priceMin).toBe(11000); // 2000 * 5.50
      expect(result[0].priceMax).toBe(16500); // 3000 * 5.50
      
      // Better tier: $7.00/sqft
      expect(result[1].tier).toBe('better');
      expect(result[1].priceMin).toBe(14000); // 2000 * 7.00
      expect(result[1].priceMax).toBe(21000); // 3000 * 7.00
      
      // Best tier: $9.00/sqft
      expect(result[2].tier).toBe('best');
      expect(result[2].priceMin).toBe(18000); // 2000 * 9.00
      expect(result[2].priceMax).toBe(27000); // 3000 * 9.00
    });

    it('should calculate deposit ranges correctly', () => {
      const result = calculatePriceRanges(2000, 3000, mockTiers as never);
      
      // Good tier min deposit: 10% of 11000 = 1100
      expect(result[0].depositMin).toBe(1100);
      // Good tier max deposit: 10% of 16500 = 1650
      expect(result[0].depositMax).toBe(1650);
    });
  });

  describe('calculateQuotePricing', () => {
    const mockTiers = [
      {
        id: '1',
        tier: 'good',
        displayName: 'Good',
        description: 'Basic package',
        materialPricePerSqft: '2.50',
        laborPricePerSqft: '3.00',
        warrantyYears: 25,
        warrantyType: 'Limited',
        shingleType: '3-Tab',
        features: ['Basic coverage'],
        isPopular: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as const;

    it('should calculate pricing with default options', () => {
      const result = calculateQuotePricing(2500, mockTiers as never);
      
      expect(result.sqft).toBe(2500);
      expect(result.sqftSource).toBe('estimated');
      expect(result.complexity).toBe('moderate');
      expect(result.pitch).toBe('standard');
      expect(result.complexityMultiplier).toBe(1.15);
      expect(result.pitchMultiplier).toBe(1.0);
      expect(result.tiers).toHaveLength(1);
    });

    it('should apply complexity multiplier to labor only', () => {
      const simple = calculateQuotePricing(2500, mockTiers as never, { complexity: 'simple' });
      const complex = calculateQuotePricing(2500, mockTiers as never, { complexity: 'complex' });
      
      // Material cost should be the same
      expect(simple.tiers[0].materialCost).toBe(complex.tiers[0].materialCost);
      
      // Labor cost should differ
      expect(complex.tiers[0].laborCost).toBeGreaterThan(simple.tiers[0].laborCost);
    });

    it('should apply pitch multiplier correctly', () => {
      const standard = calculateQuotePricing(2500, mockTiers as never, { pitchRatio: 6 });
      const steep = calculateQuotePricing(2500, mockTiers as never, { pitchRatio: 9 });
      
      expect(steep.pitchMultiplier).toBe(1.1);
      expect(steep.tiers[0].adjustedPrice).toBeGreaterThan(standard.tiers[0].adjustedPrice);
    });

    it('should calculate deposit correctly', () => {
      const result = calculateQuotePricing(2500, mockTiers as never);
      
      // Deposit should be 10% of adjusted price, capped at 2500
      expect(result.tiers[0].deposit).toBeGreaterThanOrEqual(500);
      expect(result.tiers[0].deposit).toBeLessThanOrEqual(2500);
    });

    it('should set expiration 30 days from now', () => {
      const result = calculateQuotePricing(2500, mockTiers as never);
      
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Allow 1 second tolerance for test execution time
      expect(result.expiresAt.getTime()).toBeGreaterThan(now.getTime());
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(thirtyDaysFromNow.getTime() + 1000);
    });

    it('should calculate monthly estimate', () => {
      const result = calculateQuotePricing(2500, mockTiers as never);
      
      // Monthly estimate is adjusted price / 48
      const expectedMonthly = Math.round(result.tiers[0].adjustedPrice / 48);
      expect(result.tiers[0].monthlyEstimate).toBe(expectedMonthly);
    });
  });
});
