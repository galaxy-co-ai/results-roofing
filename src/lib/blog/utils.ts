import type { BlogCategory } from './types';
import { BLOG_CATEGORIES } from './types';

/**
 * Render plain text content to HTML paragraphs with bold support.
 * Splits on double newlines for paragraphs, converts **text** to <strong>.
 */
export function renderContent(content: string): string {
  return content
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const html = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return `<p>${html}</p>`;
    })
    .join('');
}

/** Get the display label and color for a blog category. */
export function getCategoryMeta(category: BlogCategory) {
  return BLOG_CATEGORIES[category];
}
