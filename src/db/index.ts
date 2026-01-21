/**
 * Database client configuration
 * Uses Neon serverless driver with Drizzle ORM
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Create Neon HTTP client
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle ORM instance
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export { schema };

// Re-export common Drizzle utilities
export { eq, and, or, desc, asc, sql as rawSql } from 'drizzle-orm';
