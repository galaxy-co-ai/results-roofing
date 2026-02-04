import { NextResponse, type NextRequest } from 'next/server';
import {
  getQuoteVersion,
  getQuoteUrl,
  isQuoteRoute,
} from '@/lib/feature-flags';

/**
 * DEVELOPMENT BYPASS: Set to true to skip Clerk auth entirely
 * WARNING: Never enable in production!
 */
const BYPASS_AUTH = process.env.NODE_ENV === 'development' && process.env.BYPASS_CLERK === 'true';

// Production safety check - ensure auth bypass is NEVER active in production
if (process.env.NODE_ENV === 'production' && BYPASS_AUTH) {
  throw new Error('CRITICAL: Auth bypass cannot be enabled in production');
}

/**
 * Handle quote version routing for A/B testing
 * Only applies to /quote routes - redirects to /quote-v2 if user is in v2 bucket
 */
function handleQuoteRouting(req: NextRequest): NextResponse | null {
  const { pathname, searchParams } = req.nextUrl;

  // Only handle /quote routes (not /quote-v2)
  if (!isQuoteRoute(pathname)) {
    return null;
  }

  // Get the user's assigned version
  const version = getQuoteVersion({
    cookies: req.cookies,
    searchParams: searchParams,
  });

  // If user should see v2, redirect to v2
  if (version === 'v2') {
    // Extract quote ID if present (e.g., /quote/abc123 -> abc123)
    const quoteIdMatch = pathname.match(/^\/quote\/([^/]+)/);
    const quoteId = quoteIdMatch ? quoteIdMatch[1] : undefined;

    const redirectUrl = new URL(getQuoteUrl('v2', quoteId), req.url);

    // Preserve query params
    searchParams.forEach((value, key) => {
      if (key !== 'quote_v2') {
        redirectUrl.searchParams.set(key, value);
      }
    });

    const response = NextResponse.redirect(redirectUrl);

    // Set cookie to remember this user's version
    response.cookies.set('rr_quote_version', 'v2', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  }

  // User is in v1 bucket - ensure cookie is set and continue
  const response = NextResponse.next();
  response.cookies.set('rr_quote_version', 'v1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });

  return response;
}

/**
 * Middleware that bypasses Clerk entirely in development
 * or uses Clerk authentication in production
 */
export default async function middleware(req: NextRequest) {
  // Handle quote A/B routing first
  const quoteResponse = handleQuoteRouting(req);
  if (quoteResponse) {
    return quoteResponse;
  }

  // In bypass mode, skip all Clerk authentication
  if (BYPASS_AUTH) {
    return NextResponse.next();
  }

  // Dynamic import Clerk middleware only when not bypassing
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
  
  const isProtectedRoute = createRouteMatcher([
    '/portal(.*)',
    '/api/portal(.*)',
  ]);

  // Use Clerk middleware with protection for portal routes
  return clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  })(req, {} as never);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
