/**
 * Seed script for blog_posts table
 * Converts the 18 static articles from data.ts into DB rows.
 *
 * Run with: npx tsx scripts/seed-blog-posts.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import articles from '../src/lib/blog/data.archive';

// Define schema inline for the seed script (avoids path alias issues)
const blogPostStatusEnum = pgEnum('blog_post_status', [
  'draft',
  'published',
  'scheduled',
  'archived',
]);

const blogCategoryEnum = pgEnum('blog_category', [
  'technology',
  'homeowner-tips',
  'roofing-101',
  'storm-insurance',
  'company-news',
]);

const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  featuredImage: text('featured_image'),
  gradient: text('gradient'),
  icon: text('icon'),
  status: blogPostStatusEnum('status').default('draft').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role'),
  category: blogCategoryEnum('category'),
  tags: text('tags').array(),
  readTime: integer('read_time'),
  featured: boolean('featured').default(false),
  viewCount: integer('view_count').default(0).notNull(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords').array(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

/**
 * Convert an article's sections[] to a single markdown string
 */
function sectionsToMarkdown(
  sections: Array<{ id: string; title: string; content: string }>
): string {
  return sections
    .map((section) => {
      // Skip the "Introduction" heading — just include the content
      if (section.id === 'intro') {
        return section.content;
      }
      return `## ${section.title}\n\n${section.content}`;
    })
    .join('\n\n');
}

/**
 * Parse a human-readable date string (e.g., "Feb 12, 2026") to a Date
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Estimate read time from word count (~200 wpm)
 */
function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

async function seed() {
  console.log(`Seeding ${articles.length} blog posts...`);

  for (const article of articles) {
    const markdown = sectionsToMarkdown(article.sections);
    const readTime = estimateReadTime(markdown);

    // Check if post already exists (upsert by slug)
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, article.slug))
      .limit(1);

    const postData = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: markdown,
      gradient: article.gradient,
      icon: article.icon,
      status: 'published' as const,
      authorName: article.author.name,
      authorRole: article.author.role,
      category: article.category,
      tags: [] as string[], // articles don't have tags in static data
      readTime,
      featured: article.featured,
      viewCount: 0,
      seoTitle: article.seo.metaTitle,
      seoDescription: article.seo.metaDescription,
      seoKeywords: article.seo.keywords,
      publishedAt: parseDate(article.date),
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      // Update existing
      await db
        .update(blogPosts)
        .set(postData)
        .where(eq(blogPosts.id, existing[0].id));
      console.log(`  ✓ Updated: ${article.slug}`);
    } else {
      // Insert new
      await db.insert(blogPosts).values({
        ...postData,
        createdAt: new Date(),
      });
      console.log(`  ✓ Inserted: ${article.slug}`);
    }
  }

  console.log('\nDone! All blog posts seeded.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
