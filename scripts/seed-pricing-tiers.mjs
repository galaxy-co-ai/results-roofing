/**
 * Seed script for pricing_tiers table
 * Run with: node scripts/seed-pricing-tiers.mjs
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, uuid, text, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';

// Define the schema inline for the seed script
const pricingTiers = pgTable('pricing_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: text('tier').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  materialPricePerSqft: decimal('material_price_per_sqft', { precision: 10, scale: 2 }).notNull(),
  laborPricePerSqft: decimal('labor_price_per_sqft', { precision: 10, scale: 2 }).notNull(),
  shingleType: text('shingle_type').notNull(),
  shingleBrand: text('shingle_brand'),
  underlaymentType: text('underlayment_type'),
  warrantyYears: text('warranty_years').notNull(),
  warrantyType: text('warranty_type'),
  leadTimeWeeks: text('lead_time_weeks'),
  isPopular: boolean('is_popular').default(false).notNull(),
  sortOrder: text('sort_order').default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const pricingTierData = [
  {
    tier: 'good',
    displayName: 'Essential',
    description: 'Quality roofing at an affordable price. Perfect for budget-conscious homeowners who want reliable protection.',
    materialPricePerSqft: '2.50',
    laborPricePerSqft: '3.00',
    shingleType: '3-tab',
    shingleBrand: 'GAF Royal Sovereign',
    underlaymentType: 'Synthetic felt',
    warrantyYears: '25',
    warrantyType: 'limited',
    leadTimeWeeks: '1-2',
    isPopular: false,
    sortOrder: '1',
    isActive: true,
  },
  {
    tier: 'better',
    displayName: 'Premium',
    description: 'Enhanced durability and curb appeal. Our most popular choice with architectural shingles and extended warranty.',
    materialPricePerSqft: '3.50',
    laborPricePerSqft: '3.50',
    shingleType: 'architectural',
    shingleBrand: 'GAF Timberline HDZ',
    underlaymentType: 'Synthetic underlayment',
    warrantyYears: '30',
    warrantyType: 'full',
    leadTimeWeeks: '2-3',
    isPopular: true,
    sortOrder: '2',
    isActive: true,
  },
  {
    tier: 'best',
    displayName: 'Elite',
    description: 'Premium materials with maximum protection. Designer shingles, lifetime warranty, and transferable coverage.',
    materialPricePerSqft: '5.00',
    laborPricePerSqft: '4.00',
    shingleType: 'designer',
    shingleBrand: 'GAF Grand Canyon',
    underlaymentType: 'Premium synthetic with ice & water shield',
    warrantyYears: 'Lifetime',
    warrantyType: 'transferable',
    leadTimeWeeks: '3-4',
    isPopular: false,
    sortOrder: '3',
    isActive: true,
  },
];

async function seed() {
  console.log('Seeding pricing tiers...');

  try {
    // Clear existing data
    await db.delete(pricingTiers);
    console.log('Cleared existing pricing tiers');

    // Insert new data
    const result = await db.insert(pricingTiers).values(pricingTierData).returning();
    console.log(`Inserted ${result.length} pricing tiers:`);
    result.forEach((tier) => {
      console.log(`  - ${tier.displayName} (${tier.tier}): $${tier.materialPricePerSqft}/sqft materials + $${tier.laborPricePerSqft}/sqft labor`);
    });

    console.log('\nSeeding complete!');
  } catch (error) {
    console.error('Error seeding pricing tiers:', error);
    process.exit(1);
  }
}

seed();
