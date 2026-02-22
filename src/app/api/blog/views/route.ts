import { NextResponse } from 'next/server';
import { db, schema, eq, and } from '@/db';
import { incrementViewCount } from '@/db/queries/blog-posts';

/**
 * POST /api/blog/views
 * Increment view count for a blog post by slug.
 * Public endpoint — no auth required.
 */
export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    // Look up the post ID by slug
    const post = await db.query.blogPosts.findFirst({
      where: and(
        eq(schema.blogPosts.slug, slug),
        eq(schema.blogPosts.status, 'published')
      ),
      columns: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await incrementViewCount(post.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
