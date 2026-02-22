import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { getPostById, updatePost, deletePost } from '@/db/queries/blog-posts';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ops/blog/posts/[id]
 * Get a single blog post by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ post });
}

/**
 * PUT /api/ops/blog/posts/[id]
 * Update a blog post
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await getPostById(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If publishing for the first time, set publishedAt
    const publishedAt =
      body.status === 'published' && !existing.publishedAt
        ? new Date()
        : body.publishedAt !== undefined
          ? body.publishedAt
          : undefined;

    const post = await updatePost(id, {
      ...body,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    });

    // Bust ISR cache
    revalidatePath('/blog');
    revalidatePath(`/blog/${post?.slug ?? existing.slug}`);

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/blog/posts/[id]
 * Delete a blog post
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getPostById(id);

  if (!existing) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  await deletePost(id);

  // Bust ISR cache
  revalidatePath('/blog');
  if (existing.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }

  return NextResponse.json({ success: true });
}
