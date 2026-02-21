import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { BlogHero, FeaturedPosts, PostsGrid, NewsletterCTA } from '@/components/features/blog';

export const metadata: Metadata = {
  title: 'Roofing Blog — Honest Advice for Homeowners | Results Roofing',
  description:
    'Straight-talk roofing articles on replacement costs, materials, storm damage, financing, and maintenance. No fluff, no sales pitches.',
  openGraph: {
    title: 'The Results Blog',
    description: 'Honest roofing advice for homeowners who want straight answers.',
    url: '/blog',
  },
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <BlogHero />
          <FeaturedPosts />
          <PostsGrid />
          <div className="mb-16">
            <NewsletterCTA />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
