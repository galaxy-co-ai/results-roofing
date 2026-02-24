import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listTeamMembers, createTeamMember } from '@/db/queries/team-members';

const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().nullable().optional(),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
});

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
    const validation = createTeamMemberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const member = await createTeamMember(validation.data);

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
