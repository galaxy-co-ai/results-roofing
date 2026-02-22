import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { getPostBySlug, getRelatedPosts } from '@/db/queries/blog-posts';
import {
  ReadingProgressBar,
  ArticleHeader,
  ArticleBody,
  TableOfContents,
  AuthorBio,
  RelatedPosts,
} from '@/components/features/blog';
import { ViewTracker } from '@/components/features/blog/ViewTracker';

export const dynamic = 'force-dynamic';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** Strip "| Results Roofing" suffix to prevent double-branding with root template */
function stripSiteName(title: string): string {
  return title.replace(/\s*\|\s*Results Roofing$/i, '').trim();
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = stripSiteName(post.seoTitle || post.title);

  return {
    title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords || undefined,
    openGraph: {
      title,
      description: post.seoDescription || post.excerpt || '',
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = post.category
    ? await getRelatedPosts(post.category, post.slug, 3)
    : [];

  const author = {
    name: post.authorName,
    role: post.authorRole || '',
    avatar: post.authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
  };

  const heroGradient = post.gradient || 'linear-gradient(135deg, #4361ee 0%, #1a1a2e 100%)';

  return (
    <>
      <ReadingProgressBar />
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-white">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
            {/* Article content */}
            <article className="max-w-[680px]">
              <ArticleHeader post={post} />

              {/* Hero banner */}
              <div
                className="h-[200px] md:h-[280px] rounded-2xl flex items-center justify-center mb-10"
                style={{ background: heroGradient }}
              >
                <span className="text-7xl md:text-8xl" role="img" aria-hidden>
                  {post.icon || '📝'}
                </span>
              </div>

              <ArticleBody content={post.content || ''} />
              <AuthorBio author={author} />
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block pt-48">
              <TableOfContents content={post.content || ''} />
            </aside>

            {/* Related posts — inside grid so sidebar stays sticky longer */}
            <div className="lg:col-span-2">
              <RelatedPosts posts={relatedPosts} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ViewTracker slug={post.slug} />
    </>
  );
}
