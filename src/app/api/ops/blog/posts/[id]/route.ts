import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';

// Mock storage for individual posts
const mockPosts: Record<string, {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author: { id: string; name: string };
  category?: string;
  tags?: string[];
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
}> = {
  'post-1': {
    id: 'post-1',
    title: '5 Signs Your Roof Needs Immediate Attention',
    slug: '5-signs-roof-needs-attention',
    excerpt: 'Don\'t wait until it\'s too late. Learn the warning signs that indicate your roof may need professional inspection or repair.',
    content: `# 5 Signs Your Roof Needs Immediate Attention

Your roof is your home's first line of defense against the elements. Here are the warning signs to watch for:

## 1. Missing or Damaged Shingles

If you notice shingles that are cracked, curled, or missing entirely, it's time to call a professional. These issues can lead to leaks and water damage.

## 2. Sagging Areas

A sagging roof deck is a serious concern that indicates structural damage. This requires immediate attention.

## 3. Daylight Through the Roof Boards

If you can see light coming through your attic, water can get in too. Check your attic on a sunny day.

## 4. Water Stains on Ceilings

Brown water stains on your ceiling are a clear sign of a roof leak. Even small leaks can cause significant damage over time.

## 5. Granules in Gutters

Finding excessive granules from your shingles in the gutters indicates your shingles are deteriorating.

---

**Need a professional inspection?** Contact Results Roofing today for a free assessment.`,
    featuredImage: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=800',
    status: 'published',
    author: { id: 'author-1', name: 'Mike Johnson' },
    category: 'roofing-tips',
    tags: ['maintenance', 'inspection', 'repairs'],
    publishedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    viewCount: 1234,
  },
  'post-3': {
    id: 'post-3',
    title: 'Spring Roof Maintenance Checklist',
    slug: 'spring-roof-maintenance-checklist',
    excerpt: 'Get your roof ready for the year with our comprehensive spring maintenance checklist.',
    content: `# Spring Roof Maintenance Checklist

As winter fades and spring arrives, it's the perfect time to inspect your roof for any damage that may have occurred during the colder months.

## Visual Inspection Checklist

- [ ] Check for missing or damaged shingles
- [ ] Look for signs of moss or algae growth
- [ ] Inspect flashing around chimneys and vents
- [ ] Check gutters and downspouts for debris
- [ ] Look for sagging areas on the roof deck

## Interior Checklist

- [ ] Check attic for signs of water damage
- [ ] Look for daylight through roof boards
- [ ] Inspect insulation for moisture
- [ ] Check for proper ventilation

## When to Call a Professional

If you notice any of these issues, contact us for a thorough inspection:
- Multiple damaged shingles
- Signs of water damage
- Structural concerns

**Schedule your spring inspection today!**`,
    status: 'draft',
    author: { id: 'author-1', name: 'Mike Johnson' },
    category: 'maintenance',
    tags: ['maintenance', 'checklist', 'seasonal'],
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
  },
};

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
  const post = mockPosts[id];

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ post, mock: true });
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
    const existingPost = mockPosts[id];

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const updatedPost = {
      ...existingPost,
      ...body,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    // If publishing, set publishedAt
    if (body.status === 'published' && !existingPost.publishedAt) {
      updatedPost.publishedAt = new Date().toISOString();
    }

    return NextResponse.json({ post: updatedPost, mock: true });
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

  if (!mockPosts[id]) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  // In a real implementation, we'd delete from database
  return NextResponse.json({ success: true, mock: true });
}
