import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listPosts, createPost } from '@/db/queries/blog-posts';

/**
 * GET /api/ops/blog/posts
 * List blog posts with optional filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const posts = await listPosts({ status, search });

  return NextResponse.json({
    posts,
    total: posts.length,
  });
}

/**
 * POST /api/ops/blog/posts
 * Create a new blog post
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const post = await createPost({
      title: body.title || 'Untitled Post',
      slug: body.slug || `post-${Date.now()}`,
      excerpt: body.excerpt || null,
      content: body.content || null,
      featuredImage: body.featuredImage || null,
      gradient: body.gradient || null,
      icon: body.icon || null,
      status: body.status || 'draft',
      authorName: body.authorName || 'Dalton Reed',
      authorRole: body.authorRole || 'Founder',
      category: body.category || null,
      tags: body.tags || [],
      readTime: body.readTime || null,
      featured: body.featured || false,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      seoKeywords: body.seoKeywords || [],
    });

    // Bust ISR cache
    revalidatePath('/blog');

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
