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

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
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
              <ArticleBody content={post.content || ''} />
              <AuthorBio author={author} />
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block pt-48">
              <TableOfContents content={post.content || ''} />
            </aside>
          </div>

          <RelatedPosts posts={relatedPosts} />
        </div>
      </main>
      <Footer />
      <ViewTracker slug={post.slug} />
    </>
  );
}
