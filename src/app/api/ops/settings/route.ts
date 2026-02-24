import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { getCompanySettings, upsertCompanySettings } from '@/db/queries/settings';

/**
 * GET /api/ops/settings
 * Get company settings
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getCompanySettings();

  return NextResponse.json({ settings });
}

/**
 * PUT /api/ops/settings
 * Save company settings (upsert)
 */
export async function PUT(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const settings = await upsertCompanySettings({
      companyName: body.companyName || 'Results Roofing',
      phone: body.phone || null,
      address: body.address || null,
      email: body.email || null,
      licenseNumber: body.licenseNumber || null,
    });

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
