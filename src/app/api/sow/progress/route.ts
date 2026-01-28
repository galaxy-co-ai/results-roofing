import { NextResponse } from 'next/server';
import { db, desc } from '@/db';
import { devTasks } from '@/db/schema';

/**
 * GET /api/sow/progress
 * Public endpoint to get SOW progress data (no auth required for sharing)
 */
export async function GET() {
  try {
    const tasks = await db
      .select()
      .from(devTasks)
      .orderBy(desc(devTasks.createdAt));

    // Only include tasks that have phase information (SOW-related tasks)
    const sowTasks = tasks.filter(t => t.phaseId && t.phaseName);

    // Group by phase
    const phaseMap = new Map<string, {
      id: string;
      name: string;
      tasks: typeof sowTasks;
    }>();

    sowTasks.forEach(task => {
      const phaseId = String(task.phaseId);
      if (!phaseMap.has(phaseId)) {
        phaseMap.set(phaseId, {
          id: phaseId,
          name: task.phaseName!,
          tasks: [],
        });
      }
      phaseMap.get(phaseId)!.tasks.push(task);
    });

    const phases = Array.from(phaseMap.values()).sort((a, b) => 
      parseInt(a.id) - parseInt(b.id)
    );

    // Calculate statistics
    const total = sowTasks.length;
    const complete = sowTasks.filter(t => t.status === 'done' || t.status === 'review').length;
    const inProgress = sowTasks.filter(t => t.status === 'in_progress').length;
    const blocked = sowTasks.filter(t => t.status === 'backlog').length;
    const pending = sowTasks.filter(t => t.status === 'todo').length;
    const progress = total > 0 ? Math.round((complete / total) * 100) : 0;

    return NextResponse.json({
      phases,
      stats: { total, complete, inProgress, blocked, pending, progress },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching SOW progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOW progress' },
      { status: 500 }
    );
  }
}
