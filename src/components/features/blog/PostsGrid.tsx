'use client';

import { useState, useMemo } from 'react';
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
      <h2 className="flex items-center gap-3 font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1a1a2e] mb-6">
        <span className="w-1 h-6 bg-[#1a1a2e] rounded-full" />
        All Posts
      </h2>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8ecf1] text-sm focus:outline-none focus:ring-2 focus:ring-[#4361ee] bg-white"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#1a1a2e] text-white border border-transparent'
                : 'bg-[#f1f5f9] text-[#475569] border border-[#e8ecf1] hover:bg-[#e2e8f0]'
            }`}
          >
            All
          </button>
          {categories.map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === key
                  ? 'text-white border border-transparent'
                  : 'text-[#475569] border border-[#e8ecf1] hover:bg-[#e2e8f0]'
              }`}
              style={
                activeCategory === key
                  ? { backgroundColor: val.color }
                  : { backgroundColor: '#f1f5f9' }
              }
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
