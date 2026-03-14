import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { SOWStatusDocument } from '@/lib/pdf/sow-status-template';

/**
 * GET /api/reports/sow-status
 * Generate the SOW status report as a branded PDF.
 * No auth required — this is an internal report for the client.
 */
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(SOWStatusDocument) as any
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Results-Roofing-SOW-Status-2026-03-03.pdf"',
      },
    });
  } catch (error) {
    console.error('[SOW Status PDF] Generation failed', error);
    return NextResponse.json(
      { error: 'Failed to generate SOW status PDF' },
      { status: 500 }
    );
  }
}
