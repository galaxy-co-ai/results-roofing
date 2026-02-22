import type { BlogPost as DBBlogPost } from '../../db/schema/blog-posts';

// Re-export the DB type as the canonical blog post type
export type BlogPost = DBBlogPost;

// Subset for list/card views — avoids shipping full content to every card
export type BlogPostForCard = Pick<
  BlogPost,
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'gradient'
  | 'icon'
  | 'category'
  | 'authorName'
  | 'authorRole'
  | 'readTime'
  | 'featured'
  | 'publishedAt'
  | 'viewCount'
  | 'featuredImage'
>;

// Blog category type (derived from enum values)
export type BlogCategory =
  | 'technology'
  | 'homeowner-tips'
  | 'roofing-101'
  | 'storm-insurance'
  | 'company-news';

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string; color: string }> = {
  'technology': { label: 'Technology', color: '#4361ee' },
  'homeowner-tips': { label: 'Homeowner Tips', color: '#f59e0b' },
  'roofing-101': { label: 'Roofing 101', color: '#06b6d4' },
  'storm-insurance': { label: 'Storm & Insurance', color: '#6366f1' },
  'company-news': { label: 'Company News', color: '#10b981' },
};

// Computed author shape for components that display author info
export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string; // initials like "DR"
}

// Legacy types — used by data.ts and seed script
export interface BlogSection {
  id: string;
  title: string;
  content: string;
}

export interface BlogSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  author: BlogAuthor;
  date: string;
  readTime: number;
  featured: boolean;
  gradient: string;
  icon: string;
  sections: BlogSection[];
  seo: BlogSEO;
}
