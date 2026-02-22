import { renderMarkdown } from '@/lib/blog/utils';
import { NewsletterCTA } from './NewsletterCTA';

interface ArticleBodyProps {
  content: string; // markdown
}

export function ArticleBody({ content }: ArticleBodyProps) {
  const html = renderMarkdown(content);

  return (
    <div className="prose-article">
      <div
        className="text-[17px] leading-[1.75] text-[#374151] [&>p]:mb-5 [&>p>strong]:text-[#1a1a2e] [&>p>strong]:font-semibold [&>h2]:font-[family-name:var(--font-sora)] [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[#1a1a2e] [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:font-[family-name:var(--font-sora)] [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#1a1a2e] [&>h3]:mt-8 [&>h3]:mb-3 [&>ul]:mb-5 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-5 [&>ol]:pl-6 [&>ol]:list-decimal [&>blockquote]:border-l-4 [&>blockquote]:border-[#4361ee] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#64748b] [&>blockquote]:my-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="my-12">
        <NewsletterCTA />
      </div>
    </div>
  );
}
