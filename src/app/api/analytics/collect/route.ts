import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processServerEvent, type ServerEventPayload } from '@/lib/analytics';
import { logger } from '@/lib/utils';

/**
 * Schema for analytics event payload
 */
const eventPayloadSchema = z.object({
  event: z.string().min(1).max(100),
  params: z.record(z.unknown()),
  clientTimestamp: z.number(),
});

/**
 * POST /api/analytics/collect
 * Server-side analytics collection endpoint for sGTM
 * Forwards events to GA4 Measurement Protocol and Meta CAPI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate payload
    const parsed = eventPayloadSchema.safeParse(body);
    
    if (!parsed.success) {
      return new NextResponse(null, { status: 400 });
    }

    const { event, params, clientTimestamp } = parsed.data;

    // Extract client information from headers
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip') 
      || undefined;

    // Extract client ID and user ID from params if available
    const clientId = typeof params.sessionId === 'string' ? params.sessionId : undefined;
    const userId = typeof params.userId === 'string' ? params.userId : undefined;

    // Build server event payload
    const serverPayload: ServerEventPayload = {
      event,
      params: params as Record<string, unknown>,
      clientTimestamp,
      clientId,
      userId,
      userAgent,
      ipAddress,
    };

    // Process the event asynchronously
    // We don't await this to return 204 quickly
    processServerEvent(serverPayload)
      .then((result) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Analytics event processed', {
            event,
            ga4: result.ga4,
            meta: result.meta,
          });
        }
      })
      .catch((error) => {
        logger.error('Failed to process analytics event', error);
      });

    // Return 204 No Content immediately
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Analytics collect endpoint error', error);
    // Still return 204 to not block the client
    return new NextResponse(null, { status: 204 });
  }
}

/**
 * OPTIONS /api/analytics/collect
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
