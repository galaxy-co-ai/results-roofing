'use client';

import { useEffect, useState } from 'react';
import type { BlogSection } from '@/lib/blog/types';

interface TableOfContentsProps {
  sections: BlogSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

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

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  // Filter out intro since we don't show its heading
  const tocSections = sections.filter((s) => s.id !== 'intro');

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-widest text-[#94a3b8] mb-3 font-semibold">
        On this page
      </p>
      <ul className="space-y-1 border-l border-[#e8ecf1]">
        {tocSections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`block pl-4 py-1 text-[13px] leading-snug transition-colors ${
                activeId === section.id
                  ? 'text-[#4361ee] font-medium border-l-2 border-[#4361ee] -ml-px'
                  : 'text-[#64748b] hover:text-[#1a1a2e]'
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
