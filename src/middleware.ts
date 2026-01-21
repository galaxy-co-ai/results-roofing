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
 * Clerk middleware for authentication
 * Public routes: landing, quote flow, marketing pages
 * Protected routes: customer portal
 */
export default clerkMiddleware(async (auth, req) => {
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
