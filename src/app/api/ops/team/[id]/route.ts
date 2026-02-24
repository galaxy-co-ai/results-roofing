import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { updateTeamMember, deleteTeamMember } from '@/db/queries/team-members';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PUT /api/ops/team/[id]
 * Full update of a team member
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const member = await updateTeamMember(id, {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role || 'member',
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/team/[id]
 * Delete a team member
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteTeamMember(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
