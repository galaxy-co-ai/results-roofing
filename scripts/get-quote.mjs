// Quick script to get an existing quote for testing
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const quotes = await sql`SELECT id, selected_tier, address, city, state FROM quotes LIMIT 1`;
  if (quotes.length > 0) {
    console.log('Quote ID:', quotes[0].id);
    console.log('Selected Tier:', quotes[0].selected_tier);
    console.log('Address:', quotes[0].address, quotes[0].city, quotes[0].state);
  } else {
    console.log('No quotes found');
  }
  process.exit(0);
}

main();
