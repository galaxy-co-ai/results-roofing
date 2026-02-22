import Link from 'next/link';
import { format } from 'date-fns';
import type { BlogPost, BlogPostForCard } from '@/lib/blog/types';
import { getCategoryMeta } from '@/lib/blog/utils';

interface PostCardProps {
  post: BlogPost | BlogPostForCard;
  large?: boolean;
}

function getAuthorInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  try {
    return format(date, 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function PostCard({ post, large = false }: PostCardProps) {
  const cat = post.category ? getCategoryMeta(post.category) : null;

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article
        className={`rounded-2xl border border-[#e8ecf1] bg-white overflow-hidden transition-shadow hover:shadow-lg ${
          large ? 'flex flex-col md:flex-row' : ''
        }`}
      >
        {/* Gradient thumbnail */}
        <div
          className={`relative flex items-center justify-center ${
            large ? 'md:w-[45%] min-h-[220px]' : 'h-[180px]'
          }`}
          style={{ background: post.gradient || 'linear-gradient(135deg, #4361ee 0%, #1a1a2e 100%)' }}
        >
          <span className={large ? 'text-6xl' : 'text-5xl'} role="img" aria-hidden>
            {post.icon || '📝'}
          </span>
        </div>

        {/* Content */}
        <div className={`p-5 ${large ? 'md:flex-1 md:p-8' : ''}`}>
          {cat && (
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
              style={{ color: cat.color, backgroundColor: `${cat.color}14` }}
            >
              {cat.label}
            </span>
          )}

          <h3
            className={`font-[family-name:var(--font-sora)] font-bold text-[#1a1a2e] group-hover:text-[#4361ee] transition-colors leading-tight ${
              large ? 'text-xl md:text-2xl mb-3' : 'text-lg mb-2'
            }`}
          >
            {post.title}
          </h3>

          <p className="text-[#64748b] text-sm leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#4361ee] text-white flex items-center justify-center text-[10px] font-bold">
                {getAuthorInitials(post.authorName)}
              </span>
              <span className="font-medium text-[#1a1a2e]">{post.authorName}</span>
            </div>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
