import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { listPosts, createPost } from '@/db/queries/blog-posts';

const createPostSchema = z.object({
  title: z.string().min(1).default('Untitled Post'),
  slug: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  featuredImage: z.string().url().nullable().optional(),
  gradient: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
  authorName: z.string().default('Dalton Reed'),
  authorRole: z.string().default('Founder'),
  category: z.enum(['technology', 'homeowner-tips', 'roofing-101', 'storm-insurance', 'company-news']).nullable().optional(),
  tags: z.array(z.string()).default([]),
  readTime: z.number().nullable().optional(),
  featured: z.boolean().default(false),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.array(z.string()).default([]),
});

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
    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const data = validation.data;
    const post = await createPost({
      ...data,
      slug: data.slug || `post-${Date.now()}`,
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
