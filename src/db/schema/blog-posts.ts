import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

/**
 * Blog post status enum
 */
export const blogPostStatusEnum = pgEnum('blog_post_status', [
  'draft',
  'published',
  'scheduled',
  'archived',
]);

/**
 * Blog category enum — matches the public blog categories
 */
export const blogCategoryEnum = pgEnum('blog_category', [
  'technology',
  'homeowner-tips',
  'roofing-101',
  'storm-insurance',
  'company-news',
]);

/**
 * Blog posts table — unified store for public blog + ops management
 */
export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content'), // markdown
    featuredImage: text('featured_image'),
    gradient: text('gradient'), // CSS gradient string for visual flair
    icon: text('icon'), // emoji icon
    status: blogPostStatusEnum('status').default('draft').notNull(),
    // Author (denormalized — no users table)
    authorName: text('author_name').notNull(),
    authorRole: text('author_role'),
    // Categorization
    category: blogCategoryEnum('category'),
    tags: text('tags').array(),
    readTime: integer('read_time'),
    featured: boolean('featured').default(false),
    // Analytics
    viewCount: integer('view_count').default(0).notNull(),
    // SEO
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoKeywords: text('seo_keywords').array(),
    // Scheduling
    publishedAt: timestamp('published_at', { withTimezone: true }),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('blog_posts_slug_idx').on(table.slug),
    index('blog_posts_status_idx').on(table.status),
    index('blog_posts_category_idx').on(table.category),
    index('blog_posts_created_idx').on(table.createdAt),
    index('blog_posts_featured_idx').on(table.featured),
  ]
);

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
