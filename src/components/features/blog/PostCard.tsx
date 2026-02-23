import Link from 'next/link';
import {
  Satellite,
  Home,
  BookOpen,
  Shield,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import type { BlogPost, BlogPostForCard, BlogCategory } from '@/lib/blog/types';
import { getCategoryMeta } from '@/lib/blog/utils';

interface PostCardProps {
  post: BlogPost | BlogPostForCard;
  large?: boolean;
  featured?: boolean;
}

/* ── Category → visual mapping ─────────────────────────── */

interface CategoryVisual {
  bg: string;
  accent: string;
  icon: LucideIcon;
  pattern: string;
}

const CATEGORY_VISUALS: Record<BlogCategory, CategoryVisual> = {
  technology: {
    bg: '#EEF2FF',
    accent: '#2563EB',
    icon: Satellite,
    pattern:
      'radial-gradient(circle, rgba(37,99,235,0.12) 0.6px, transparent 0.6px)',
  },
  'homeowner-tips': {
    bg: '#EFF6FF',
    accent: '#1D4ED8',
    icon: Home,
    pattern:
      'repeating-linear-gradient(135deg, rgba(29,78,216,0.10) 0px, rgba(29,78,216,0.10) 1px, transparent 1px, transparent 8px)',
  },
  'roofing-101': {
    bg: '#F0F5FF',
    accent: '#3B82F6',
    icon: BookOpen,
    pattern:
      'repeating-linear-gradient(0deg, rgba(59,130,246,0.08) 0px, rgba(59,130,246,0.08) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, rgba(59,130,246,0.08) 0px, rgba(59,130,246,0.08) 1px, transparent 1px, transparent 10px)',
  },
  'storm-insurance': {
    bg: '#EEF2FF',
    accent: '#1E40AF',
    icon: Shield,
    pattern:
      'repeating-linear-gradient(0deg, transparent 0px, transparent 6px, rgba(30,64,175,0.10) 6px, rgba(30,64,175,0.10) 7px)',
  },
  'company-news': {
    bg: '#F5F7FF',
    accent: '#2563EB',
    icon: Megaphone,
    pattern:
      'radial-gradient(circle, rgba(37,99,235,0.12) 0.8px, transparent 0.8px)',
  },
};

const DEFAULT_VISUAL: CategoryVisual = {
  bg: '#F0F5FF',
  accent: '#3B82F6',
  icon: BookOpen,
  pattern: 'radial-gradient(circle, rgba(59,130,246,0.10) 0.6px, transparent 0.6px)',
};

function getVisual(category?: BlogCategory | string | null): CategoryVisual {
  if (!category) return DEFAULT_VISUAL;
  return CATEGORY_VISUALS[category as BlogCategory] ?? DEFAULT_VISUAL;
}

export function PostCard({ post, large = false, featured = false }: PostCardProps) {
  const cat = post.category ? getCategoryMeta(post.category) : null;
  const vis = getVisual(post.category);
  const Icon = vis.icon;

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article
        className={`rounded-lg border border-[#E8EDF5] bg-white overflow-hidden transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 h-full ${
          large ? 'flex flex-col md:flex-row' : 'flex flex-col'
        }`}
      >
        {/* Pattern cover */}
        <div
          className={`relative flex items-center justify-center ${
            large ? 'md:w-[45%] min-h-[180px]' : 'h-[140px]'
          }`}
          style={{
            backgroundColor: vis.bg,
            backgroundImage: vis.pattern,
            backgroundSize: vis.pattern.includes('radial') ? '16px 16px' : undefined,
          }}
        >
          <Icon
            size={40}
            className="relative z-10 opacity-60 drop-shadow-sm"
            style={{ color: vis.accent }}
            strokeWidth={1.5}
          />
          {featured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#2563EB] rounded-md">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 flex flex-col flex-1 ${large ? 'md:p-6' : ''}`}>
          {cat && (
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 w-fit"
              style={{ color: cat.color, backgroundColor: `${cat.color}14` }}
            >
              {cat.label}
            </span>
          )}

          <h3
            className={`font-[family-name:var(--font-sora)] font-semibold text-[#1a1a2e] group-hover:text-[#2563EB] transition-colors leading-tight line-clamp-2 ${
              large ? 'text-lg md:text-xl mb-2' : 'text-base mb-2'
            }`}
          >
            {post.title}
          </h3>

          <p className="text-sm text-[#6B7A94] leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}
