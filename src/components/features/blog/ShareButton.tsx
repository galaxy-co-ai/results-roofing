'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        // user cancelled — that's fine
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#4361ee] transition-colors"
      aria-label="Share article"
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>
  );
}
