/**
 * Environment Variable Validation
 * 
 * Uses Zod to validate and provide typed access to environment variables.
 * Fails fast on missing required variables to catch config issues early.
 */

import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverEnvSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_UNPOOLED: z.string().optional(),

  // Authentication (Clerk)
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Payments (Stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // E-Signature (Documenso)
  DOCUMENSO_API_KEY: z.string().optional(),
  DOCUMENSO_API_URL: z.string().url().optional(),
  DOCUMENSO_WEBHOOK_SECRET: z.string().optional(),

  // Financing (Wisetack)
  WISETACK_API_KEY: z.string().optional(),
  WISETACK_MERCHANT_ID: z.string().optional(),
  WISETACK_WEBHOOK_SECRET: z.string().optional(),
  WISETACK_ENVIRONMENT: z.enum(['sandbox', 'production']).optional(),

  // CRM (JobNimbus)
  JOBNIMBUS_API_KEY: z.string().optional(),

  // SMS (SignalWire)
  SIGNALWIRE_PROJECT_ID: z.string().optional(),
  SIGNALWIRE_API_TOKEN: z.string().optional(),
  SIGNALWIRE_SPACE_URL: z.string().optional(),
  SIGNALWIRE_PHONE_NUMBER: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_REPLY_TO_EMAIL: z.string().email().optional(),

  // Rate Limiting (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Business Configuration
  DEPOSIT_PERCENTAGE: z.coerce.number().min(0).max(1).optional(),
  DEPOSIT_MIN: z.coerce.number().positive().optional(),
  DEPOSIT_MAX: z.coerce.number().positive().optional(),
  QUOTE_EXPIRATION_DAYS: z.coerce.number().positive().optional(),

  // Development flags
  SKIP_EMAIL_SENDING: z.coerce.boolean().optional(),
  SKIP_SMS_SENDING: z.coerce.boolean().optional(),
  MOCK_WISETACK_API: z.coerce.boolean().optional(),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (prefixed with NEXT_PUBLIC_)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ENABLE_FINANCING: z.coerce.boolean().optional(),
  NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS: z.coerce.boolean().optional(),
  NEXT_PUBLIC_ENABLE_PORTAL: z.coerce.boolean().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validated server environment variables
 * Access only on the server side
 */
function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Invalid server environment variables:\n${missing}\n\n` +
        'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  return parsed.data;
}

/**
 * Validated client environment variables
 * Safe to use on both client and server
 */
function getClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    NEXT_PUBLIC_ENABLE_FINANCING: process.env.NEXT_PUBLIC_ENABLE_FINANCING,
    NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS,
    NEXT_PUBLIC_ENABLE_PORTAL: process.env.NEXT_PUBLIC_ENABLE_PORTAL,
  });

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Invalid client environment variables:\n${missing}\n\n` +
        'Please check your .env.local file.'
    );
  }

  return parsed.data;
}

// Lazy initialization to avoid issues during build
let _serverEnv: ServerEnv | undefined;
let _clientEnv: ClientEnv | undefined;

/**
 * Server environment (only use on server)
 */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_, prop: keyof ServerEnv) {
    if (!_serverEnv) {
      _serverEnv = getServerEnv();
    }
    return _serverEnv[prop];
  },
});

/**
 * Client environment (safe to use anywhere)
 */
export const clientEnv = new Proxy({} as ClientEnv, {
  get(_, prop: keyof ClientEnv) {
    if (!_clientEnv) {
      _clientEnv = getClientEnv();
    }
    return _clientEnv[prop];
  },
});

/**
 * Check if a feature is enabled
 */
export const features = {
  get financing(): boolean {
    return clientEnv.NEXT_PUBLIC_ENABLE_FINANCING ?? true;
  },
  get smsNotifications(): boolean {
    return clientEnv.NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS ?? true;
  },
  get portal(): boolean {
    return clientEnv.NEXT_PUBLIC_ENABLE_PORTAL ?? true;
  },
};
