import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';

// Mock blog posts for demo
const mockPosts = [
  {
    id: 'post-1',
    title: '5 Signs Your Roof Needs Immediate Attention',
    slug: '5-signs-roof-needs-attention',
    excerpt: 'Don\'t wait until it\'s too late. Learn the warning signs that indicate your roof may need professional inspection or repair.',
    content: '# 5 Signs Your Roof Needs Immediate Attention\n\nYour roof is your home\'s first line of defense...',
    featuredImage: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=800',
    status: 'published' as const,
    author: { id: 'author-1', name: 'Mike Johnson' },
    category: 'roofing-tips',
    tags: ['maintenance', 'inspection', 'repairs'],
    publishedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    viewCount: 1234,
  },
  {
    id: 'post-2',
    title: 'Choosing the Right Roofing Material for Texas Weather',
    slug: 'roofing-material-texas-weather',
    excerpt: 'Texas weather can be brutal on roofs. Here\'s how to choose materials that can withstand our unique climate.',
    content: '# Choosing the Right Roofing Material for Texas Weather\n\nTexas weather presents unique challenges...',
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    status: 'published' as const,
    author: { id: 'author-1', name: 'Mike Johnson' },
    category: 'materials',
    tags: ['materials', 'texas', 'weather'],
    publishedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    viewCount: 856,
  },
  {
    id: 'post-3',
    title: 'Spring Roof Maintenance Checklist',
    slug: 'spring-roof-maintenance-checklist',
    excerpt: 'Get your roof ready for the year with our comprehensive spring maintenance checklist.',
    content: '# Spring Roof Maintenance Checklist\n\nAs winter fades...',
    status: 'draft' as const,
    author: { id: 'author-1', name: 'Mike Johnson' },
    category: 'maintenance',
    tags: ['maintenance', 'checklist', 'seasonal'],
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
  },
  {
    id: 'post-4',
    title: 'How to Handle Storm Damage Insurance Claims',
    slug: 'storm-damage-insurance-claims',
    excerpt: 'A step-by-step guide to navigating the insurance claims process after storm damage to your roof.',
    content: '# How to Handle Storm Damage Insurance Claims\n\nDealing with insurance after a storm...',
    featuredImage: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
    status: 'scheduled' as const,
    author: { id: 'author-2', name: 'Sarah Davis' },
    category: 'news',
    tags: ['insurance', 'storm-damage', 'claims'],
    scheduledAt: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
  },
  {
    id: 'post-5',
    title: 'Case Study: Complete Roof Replacement in Frisco',
    slug: 'case-study-roof-replacement-frisco',
    excerpt: 'See how we transformed a damaged roof into a beautiful, durable new installation.',
    content: '# Case Study: Complete Roof Replacement in Frisco\n\nOur client came to us with...',
    featuredImage: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800',
    status: 'published' as const,
    author: { id: 'author-1', name: 'Mike Johnson' },
    category: 'case-studies',
    tags: ['case-study', 'replacement', 'frisco'],
    publishedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    viewCount: 542,
  },
];

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
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  let posts = [...mockPosts];

  // Filter by status
  if (status && status !== 'all') {
    posts = posts.filter((p) => p.status === status);
  }

  // Filter by search
  if (search) {
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.excerpt?.toLowerCase().includes(search) ||
        p.tags?.some((t) => t.toLowerCase().includes(search))
    );
  }

  // Sort by updated date
  posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json({
    posts,
    total: posts.length,
    mock: true,
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

    const newPost = {
      id: `post-${Date.now()}`,
      title: body.title || 'Untitled Post',
      slug: body.slug || `post-${Date.now()}`,
      excerpt: body.excerpt,
      content: body.content,
      featuredImage: body.featuredImage,
      status: body.status || 'draft',
      author: { id: 'author-1', name: 'Mike Johnson' },
      category: body.category,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ post: newPost, mock: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
