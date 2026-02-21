import type { BlogSection } from '@/lib/blog/types';
import { renderContent } from '@/lib/blog/utils';
import { NewsletterCTA } from './NewsletterCTA';

interface ArticleBodyProps {
  sections: BlogSection[];
}

export function ArticleBody({ sections }: ArticleBodyProps) {
  // Insert newsletter CTA roughly in the middle
  const midIndex = Math.floor(sections.length / 2);

  return (
    <div className="prose-article">
      {sections.map((section, i) => (
        <div key={section.id}>
          <section id={section.id} className="scroll-mt-20">
            {/* Skip rendering "Introduction" heading — it reads better without it */}
            {section.id !== 'intro' && (
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1a1a2e] mt-12 mb-4">
                {section.title}
              </h2>
            )}
            <div
              className="text-[17px] leading-[1.75] text-[#334155] [&>p]:mb-5 [&>p>strong]:text-[#1a1a2e] [&>p>strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: renderContent(section.content) }}
            />
          </section>

          {/* Mid-article CTA */}
          {i === midIndex && (
            <div className="my-12">
              <NewsletterCTA />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
