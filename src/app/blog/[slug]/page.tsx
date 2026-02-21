import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { getArticleBySlug, getAllSlugs } from '@/lib/blog/data';
import {
  ReadingProgressBar,
  ArticleHeader,
  ArticleBody,
  TableOfContents,
  AuthorBio,
  RelatedPosts,
} from '@/components/features/blog';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getArticleBySlug(slug);
  if (!post) return {};

  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = getArticleBySlug(slug);
  if (!post) notFound();

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
              <ArticleBody sections={post.sections} />
              <AuthorBio author={post.author} />
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block pt-48">
              <TableOfContents sections={post.sections} />
            </aside>
          </div>

          <RelatedPosts currentSlug={post.slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
