import type { BlogPost } from '@/lib/blog/types';
import { PostCard } from './PostCard';

interface FeaturedPostsProps {
  posts: BlogPost[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1a1a2e] mb-6">
        Featured
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} large />
        ))}
      </div>
    </section>
  );
}
