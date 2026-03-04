'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItemData {
  question: string;
  answer: string;
}

interface InlineFAQProps {
  items: FAQItemData[];
}

export function InlineFAQ({ items }: InlineFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            className="flex items-center justify-between w-full py-5 text-left group"
            aria-expanded={expandedIndex === i}
          >
            <span className="text-base font-semibold text-slate-900 pr-4 group-hover:text-blue-600 transition-colors">
              {item.question}
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                expandedIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-200 ${
              expandedIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <p className="pb-5 text-sm text-slate-600 leading-relaxed pr-8">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
