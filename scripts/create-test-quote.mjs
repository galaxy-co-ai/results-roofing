#!/usr/bin/env node
/**
 * Create a test quote for visual testing
 * Run with: npx tsx scripts/create-test-quote.mjs
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
config({ path: '.env.local' });
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function main() {
  const sql = neon(DATABASE_URL);

  // Generate a unique UUID
  const quoteId = randomUUID();

  // Insert a test quote with all required fields
  await sql`
    INSERT INTO quotes (
      id, address, city, state, zip,
      sqft_total, pitch_primary, complexity, selected_tier,
      total_price, deposit_amount, status, created_at, updated_at
    ) VALUES (
      ${quoteId},
      '123 Test Street',
      'Austin',
      'TX',
      '78701',
      '2500',
      '6.00',
      'moderate',
      'better',
      '15000.00',
      '750.00',
      'selected',
      NOW(),
      NOW()
    )
  `;

  console.log('');
  console.log('Test quote created successfully!');
  console.log('');
  console.log('Quote ID:', quoteId);
  console.log('');
  console.log('Test URLs:');
  console.log(`  Estimate:     http://localhost:3000/quote/${quoteId}/estimate`);
  console.log(`  Packages:     http://localhost:3000/quote/${quoteId}/packages`);
  console.log(`  Checkout:     http://localhost:3000/quote/${quoteId}/checkout`);
  console.log(`  Financing:    http://localhost:3000/quote/${quoteId}/financing`);
  console.log(`  Schedule:     http://localhost:3000/quote/${quoteId}/schedule`);
  console.log(`  Contract:     http://localhost:3000/quote/${quoteId}/contract`);
  console.log(`  Payment:      http://localhost:3000/quote/${quoteId}/payment`);
  console.log(`  Confirmation: http://localhost:3000/quote/${quoteId}/confirmation`);
  console.log('');

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
