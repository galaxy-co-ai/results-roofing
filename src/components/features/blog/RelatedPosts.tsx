import { getRelatedPosts } from '@/lib/blog/data';
import { PostCard } from './PostCard';

interface RelatedPostsProps {
  currentSlug: string;
}

export function RelatedPosts({ currentSlug }: RelatedPostsProps) {
  const related = getRelatedPosts(currentSlug, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[#e8ecf1]">
      <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1a1a2e] mb-6">
        Keep Reading
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
