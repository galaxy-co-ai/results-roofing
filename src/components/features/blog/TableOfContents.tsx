'use client';

import { useEffect, useState, useMemo } from 'react';
import { extractHeadings } from '@/lib/blog/utils';

interface TableOfContentsProps {
  content: string; // markdown
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-widest text-[#94a3b8] mb-3 font-semibold">
        On this page
      </p>
      <ul className="space-y-1 border-l border-[#e8ecf1]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block pl-4 py-1 text-[13px] leading-snug transition-colors ${
                activeId === heading.id
                  ? 'text-[#4361ee] font-medium border-l-2 border-[#4361ee] -ml-px'
                  : 'text-[#64748b] hover:text-[#1a1a2e]'
              }`}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
