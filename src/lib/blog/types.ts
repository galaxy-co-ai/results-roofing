// Blog data types — static data layer for public blog

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

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string; // initials like "DR"
}

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
