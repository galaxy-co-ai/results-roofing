import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listTeamMembers, createTeamMember } from '@/db/queries/team-members';

/**
 * GET /api/ops/team
 * List all team members
 */
export async function GET() {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const members = await listTeamMembers();

  return NextResponse.json({
    members,
    total: members.length,
  });
}

/**
 * POST /api/ops/team
 * Create/invite a new team member
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const member = await createTeamMember({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role || 'member',
    });

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
