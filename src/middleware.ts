import { NextResponse, type NextRequest } from 'next/server';

/**
 * DEVELOPMENT BYPASS: Set to true to skip Clerk auth entirely
 * WARNING: Never enable in production!
 */
const BYPASS_AUTH = process.env.NODE_ENV === 'development' && process.env.BYPASS_CLERK === 'true';

/**
 * Middleware that bypasses Clerk entirely in development
 * or uses Clerk authentication in production
 */
export default async function middleware(req: NextRequest) {
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
