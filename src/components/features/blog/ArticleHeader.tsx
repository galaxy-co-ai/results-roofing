import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import type { BlogPost } from '@/lib/blog/types';
import { getCategoryMeta } from '@/lib/blog/utils';
import { ShareButton } from './ShareButton';

interface ArticleHeaderProps {
  post: BlogPost;
}

function getAuthorInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  const cat = post.category ? getCategoryMeta(post.category) : null;

  return (
    <header className="mb-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#4361ee] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {cat && (
        <span
          className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
          style={{ color: cat.color, backgroundColor: `${cat.color}14` }}
        >
          {cat.label}
        </span>
      )}

      <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl lg:text-[42px] font-bold text-[#1a1a2e] leading-tight mb-6">
        {post.title}
      </h1>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 text-sm text-[#64748b]">
          <span className="w-9 h-9 rounded-full bg-[#4361ee] text-white flex items-center justify-center text-xs font-bold">
            {getAuthorInitials(post.authorName)}
          </span>
          <div>
            <span className="font-medium text-[#1a1a2e]">{post.authorName}</span>
            <span className="mx-1.5">·</span>
            <span>{post.publishedAt ? format(post.publishedAt, 'MMM d, yyyy') : ''}</span>
            <span className="mx-1.5">·</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>

        <ShareButton title={post.title} />
      </div>
    </header>
  );
}
