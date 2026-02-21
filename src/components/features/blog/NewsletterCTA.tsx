'use client';

import { useState } from 'react';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // UI-only for now — hook up to API later
    setSubmitted(true);
  }

  return (
    <section className="rounded-2xl px-6 py-12 md:px-12 md:py-16 text-center"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)' }}
    >
      <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold text-white mb-3">
        Get roofing tips that don&apos;t waste your time
      </h2>
      <p className="text-[#94a3b8] mb-8 max-w-lg mx-auto">
        Plain-English advice on roof maintenance, replacement costs, and avoiding scams. No spam, no sales pitches.
      </p>

      {submitted ? (
        <p className="text-[#10b981] font-medium">You&apos;re in! We&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4361ee] text-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#4361ee] text-white font-semibold text-sm hover:bg-[#3451de] transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
