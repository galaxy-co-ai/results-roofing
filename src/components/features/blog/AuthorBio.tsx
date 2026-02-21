import type { BlogAuthor } from '@/lib/blog/types';

interface AuthorBioProps {
  author: BlogAuthor;
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#e8ecf1] p-6 mt-12">
      <span className="w-14 h-14 rounded-full bg-[#4361ee] text-white flex items-center justify-center text-lg font-bold shrink-0">
        {author.avatar}
      </span>
      <div>
        <p className="font-[family-name:var(--font-sora)] font-bold text-[#1a1a2e]">
          {author.name}
        </p>
        <p className="text-sm text-[#64748b] mb-2">{author.role}, Results Roofing</p>
        <p className="text-sm text-[#64748b] leading-relaxed">
          Dalton built Results Roofing to give homeowners a faster, more transparent way to replace
          their roof. He writes about roofing technology, materials, and how to avoid getting ripped off.
        </p>
      </div>
    </div>
  );
}
