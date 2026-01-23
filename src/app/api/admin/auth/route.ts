import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/auth
 * Authenticate admin with password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const schema = z.object({
      password: z.string().min(1),
    });

    const validated = schema.parse(body);

    // Check password against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 500 }
      );
    }

    if (validated.password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate a session token
    const sessionToken = process.env.ADMIN_SESSION_TOKEN || 
      Buffer.from(`admin_${Date.now()}_${Math.random()}`).toString('base64');

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
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
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth
 * Logout admin
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
