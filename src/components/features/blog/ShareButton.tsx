'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        // user cancelled — that's fine
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        copied
          ? 'text-emerald-600'
          : 'text-[#64748b] hover:text-[#4361ee]'
      }`}
      aria-label="Share article"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}
