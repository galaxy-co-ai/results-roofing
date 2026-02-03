import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { createRateLimiter, getRequestIdentifier, rateLimitHeaders } from '@/lib/api/rate-limit';
import { isOpsAuthenticated } from '@/lib/ops/auth';

// Strict rate limiter for ops auth: 5 attempts per 15 minutes
const opsAuthLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

/**
 * POST /api/ops/auth
 * Authenticate ops user with password
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const identifier = getRequestIdentifier(request);
  const rateLimitResult = opsAuthLimiter.check(identifier);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const body = await request.json();

    const schema = z.object({
      password: z.string().min(1),
    });

    const validated = schema.parse(body);

    // Check password against environment variable
    const opsPassword = process.env.OPS_PASSWORD;

    if (!opsPassword) {
      return NextResponse.json({ error: 'Ops access not configured' }, { status: 500 });
    }

    if (validated.password !== opsPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Generate a cryptographically secure session token
    const sessionToken = process.env.OPS_SESSION_TOKEN || randomBytes(32).toString('hex');

    // Set secure cookie (separate from admin)
    const cookieStore = await cookies();
    cookieStore.set('ops_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours (longer than admin for operational use)
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

/**
 * DELETE /api/ops/auth
 * Logout ops user
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('ops_session');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

/**
 * GET /api/ops/auth
 * Check authentication status
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  return NextResponse.json({ authenticated });
}
