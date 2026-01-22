import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Define routes that require authentication
 * - Portal routes require user to be signed in
 * - API routes for portal data require authentication
 */
const isProtectedRoute = createRouteMatcher([
  '/portal(.*)',
  '/api/portal(.*)',
]);

/**
 * Define public routes that never require auth
 * - Landing page, quote flow, marketing pages
 * - Public API endpoints (quotes, leads)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _isPublicRoute = createRouteMatcher([
  '/',
  '/quote(.*)',
  '/api/quotes(.*)',
  '/api/leads(.*)',
  '/api/payments/webhook(.*)',
  '/api/pricing-tiers(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

/**
 * Clerk middleware for authentication
 * Public routes: landing, quote flow, marketing pages
 * Protected routes: customer portal
 */
export default clerkMiddleware(async (auth, req) => {
  // Protect portal routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
