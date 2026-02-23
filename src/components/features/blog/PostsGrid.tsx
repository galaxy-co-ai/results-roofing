'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { BLOG_CATEGORIES } from '@/lib/blog/types';
import type { BlogCategory, BlogPost } from '@/lib/blog/types';
import { PostCard } from './PostCard';

const categories = Object.entries(BLOG_CATEGORIES) as [BlogCategory, { label: string; color: string }][];

interface PostsGridProps {
  posts: BlogPost[];
}

export function PostsGrid({ posts }: PostsGridProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, search, activeCategory]);

  return (
    <section className="mb-16">
      <h2 className="flex items-center gap-3 font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1a1a2e] mb-4">
        <span className="w-1 h-6 bg-[#1a1a2e] rounded-full" />
        All Resources
      </h2>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7A94]" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-[#E8EDF5] text-sm text-[#1a1a2e] placeholder:text-[#6B7A94] focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F2F4F8] text-[#6B7A94] border border-[#E8EDF5] hover:bg-[#E8EDF5]'
            }`}
          >
            All
          </button>
          {categories.map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === key
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#F2F4F8] text-[#6B7A94] border border-[#E8EDF5] hover:bg-[#E8EDF5]'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-[#94a3b8] py-12">
          No articles found. Try a different search or category.
        </p>
      )}
    </section>
  );
}
