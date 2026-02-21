import { getFeaturedPosts } from '@/lib/blog/data';
import { PostCard } from './PostCard';

export function FeaturedPosts() {
  const featured = getFeaturedPosts().slice(0, 2);

  return (
    <section className="mb-12">
      <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1a1a2e] mb-6">
        Featured
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {featured.map((post) => (
          <PostCard key={post.slug} post={post} large />
        ))}
      </div>
    </section>
  );
}
