import { marked } from 'marked';
import type { BlogCategory } from './types';
import { BLOG_CATEGORIES } from './types';

/**
 * Slugify a string for use as an anchor ID.
 * Shared by heading renderer and ToC extraction.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Render markdown content to HTML using `marked`.
 * Adds anchor IDs to headings for ToC linking.
 */
export function renderMarkdown(markdown: string): string {
  const renderer = new marked.Renderer();

  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    const id = slugify(text);
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  return marked(markdown, { renderer, async: false }) as string;
}

/**
 * Estimate read time from markdown content.
 * ~200 words per minute is standard.
 */
export function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Extract h2 headings from markdown for table of contents.
 * Returns array of { id, title } for each ## heading.
 */
export function extractHeadings(markdown: string): { id: string; title: string }[] {
  const headings: { id: string; title: string }[] = [];
  const regex = /^## (.+)$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const title = match[1].trim();
    headings.push({ id: slugify(title), title });
  }
  return headings;
}

/** Get the display label and color for a blog category. */
export function getCategoryMeta(category: BlogCategory) {
  return BLOG_CATEGORIES[category];
}
