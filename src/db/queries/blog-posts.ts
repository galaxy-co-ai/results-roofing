/**
 * Blog post database queries
 */

import { db, schema, eq, and, desc, rawSql } from '@/db';
import type { NewBlogPost } from '@/db/schema/blog-posts';

/**
 * Get all published posts, newest first
 */
export async function getPublishedPosts() {
  const posts = await db.query.blogPosts.findMany({
    where: eq(schema.blogPosts.status, 'published'),
    orderBy: [desc(schema.blogPosts.publishedAt)],
  });
  return posts;
}

/**
 * Get featured published posts
 */
export async function getFeaturedPosts(limit = 2) {
  const posts = await db.query.blogPosts.findMany({
    where: and(
      eq(schema.blogPosts.status, 'published'),
      eq(schema.blogPosts.featured, true)
    ),
    orderBy: [desc(schema.blogPosts.publishedAt)],
    limit,
  });
  return posts;
}

/**
 * Get a single published post by slug (for public article page)
 */
export async function getPostBySlug(slug: string) {
  const post = await db.query.blogPosts.findFirst({
    where: and(
      eq(schema.blogPosts.slug, slug),
      eq(schema.blogPosts.status, 'published')
    ),
  });
  return post ?? null;
}

/**
 * Get a single post by ID (for ops editor — any status)
 */
export async function getPostById(id: string) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(schema.blogPosts.id, id),
  });
  return post ?? null;
}

/**
 * Get related posts in the same category, excluding current
 */
export async function getRelatedPosts(
  category: string,
  excludeSlug: string,
  limit = 3
) {
  const posts = await db.query.blogPosts.findMany({
    where: and(
      eq(schema.blogPosts.status, 'published'),
      eq(schema.blogPosts.category, category as typeof schema.blogPosts.category.enumValues[number])
    ),
    orderBy: [desc(schema.blogPosts.publishedAt)],
    limit: limit + 1, // fetch one extra in case current is included
  });
  return posts.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}

/**
 * List posts with optional filters (for ops dashboard)
 */
export async function listPosts(filters?: {
  status?: string;
  search?: string;
  limit?: number;
}) {
  // Build conditions
  const conditions = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push(
      eq(schema.blogPosts.status, filters.status as typeof schema.blogPosts.status.enumValues[number])
    );
  }

  const posts = await db.query.blogPosts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(schema.blogPosts.updatedAt)],
    limit: filters?.limit,
  });

  // Apply text search in JS (simpler than SQL ILIKE for now)
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  return posts;
}

/**
 * Create a new blog post
 */
export async function createPost(data: NewBlogPost) {
  const result = await db
    .insert(schema.blogPosts)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update a blog post (always bumps updatedAt)
 */
export async function updatePost(id: string, data: Partial<NewBlogPost>) {
  const result = await db
    .update(schema.blogPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.blogPosts.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Delete a blog post (hard delete)
 */
export async function deletePost(id: string) {
  await db
    .delete(schema.blogPosts)
    .where(eq(schema.blogPosts.id, id));
}

/**
 * Atomically increment view count
 */
export async function incrementViewCount(id: string) {
  await db
    .update(schema.blogPosts)
    .set({ viewCount: rawSql`${schema.blogPosts.viewCount} + 1` })
    .where(eq(schema.blogPosts.id, id));
}
