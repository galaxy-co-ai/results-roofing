import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local for local development
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use unpooled URL for migrations (pooled can cause issues with DDL)
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
