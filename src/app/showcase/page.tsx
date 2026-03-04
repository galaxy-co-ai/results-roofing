'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ================================================================
   DATA
   ================================================================ */

interface Screen {
  label: string;
  description: string;
  subtitle: string;
  image: string;
  url: string;
}

interface ScreenGroup {
  section: string;
  screens: Screen[];
}

const GROUPS: ScreenGroup[] = [
  {
    section: 'Quote Journey',
    screens: [
      {
        label: 'Landing Page',
        description: 'Your first impression',
        subtitle:
          'The homepage that starts the journey — instant quote promise, trust signals, and a clear call-to-action.',
        image: '/showcase/ho-landing.png',
        url: 'resultsroofing.com',
      },
      {
        label: 'Property Confirm',
        description: 'Satellite verification',
        subtitle:
          'AI-powered satellite measurement confirms the property. Homeowners verify their address before pricing.',
        image: '/showcase/ho-property.png',
        url: 'resultsroofing.com/quote/confirm',
      },
      {
        label: 'Choose Package',
        description: 'Good, Better, Best pricing',
        subtitle:
          'Three transparent tiers side-by-side. No hidden fees, no pressure — just honest options.',
        image: '/showcase/ho-packages.png',
        url: 'resultsroofing.com/quote/packages',
      },
      {
        label: 'Schedule Install',
        description: 'Pick your date & time',
        subtitle:
          'Interactive calendar with available time slots. Homeowners choose what works for them.',
        image: '/showcase/ho-schedule.png',
        url: 'resultsroofing.com/quote/schedule',
      },
      {
        label: 'Confirm Booking',
        description: 'Review & pay deposit',
        subtitle:
          'Order summary with Stripe-powered secure payment. One click to lock in the project.',
        image: '/showcase/ho-confirm.png',
        url: 'resultsroofing.com/quote/confirm',
      },
    ],
  },
  {
    section: 'Your Portal',
    screens: [
      {
        label: 'Dashboard',
        description: 'Project overview',
        subtitle:
          'Real-time project status, next steps, and installation countdown at a glance.',
        image: '/showcase/ho-portal-dashboard.png',
        url: 'app.resultsroofing.com/portal',
      },
      {
        label: 'Documents',
        description: 'Contracts & receipts',
        subtitle:
          'Every document in one place — quotes, contracts, authorizations, and receipts.',
        image: '/showcase/ho-portal-documents.png',
        url: 'app.resultsroofing.com/portal/documents',
      },
      {
        label: 'Payments',
        description: 'Balance & history',
        subtitle:
          'Full payment breakdown with balance tracking and transaction history.',
        image: '/showcase/ho-portal-payments.png',
        url: 'app.resultsroofing.com/portal/payments',
      },
      {
        label: 'Schedule View',
        description: 'Timeline & milestones',
        subtitle:
          'Visual project timeline from quote acceptance through final inspection.',
        image: '/showcase/ho-portal-schedule.png',
        url: 'app.resultsroofing.com/portal/schedule',
      },
    ],
  },
];

// Flat list for indexed navigation
const ALL_SCREENS = GROUPS.flatMap((g) => g.screens);

/* ================================================================
   COMPONENT
   ================================================================ */

export default function ShowcasePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const screen = ALL_SCREENS[activeIndex];

  const go = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex(
        (prev) => (prev + dir + ALL_SCREENS.length) % ALL_SCREENS.length,
      );
    },
    [],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // Compute flat index offset per group for active highlighting
  let flatIndex = 0;
  const groupOffsets = GROUPS.map((g) => {
    const offset = flatIndex;
    flatIndex += g.screens.length;
    return offset;
  });

  return (
    <div
      className="flex h-screen flex-col bg-white md:flex-row"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* ── Sidebar ── */}
      <aside className="flex w-full shrink-0 flex-col border-b border-zinc-200 bg-white md:h-screen md:w-[264px] md:border-b-0 md:border-r">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
            >
              R
            </span>
          </div>
          <span
            className="text-[15px] font-bold text-zinc-900"
            style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
          >
            Results Roofing
          </span>
        </div>

        <div className="hidden border-t border-zinc-100 md:block" />

        {/* Nav groups — horizontal scroll on mobile, vertical on desktop */}
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:gap-0 md:overflow-x-visible md:px-3 md:py-4">
          {GROUPS.map((group, gi) => (
            <div key={group.section} className={gi > 0 ? 'md:mt-5' : ''}>
              {/* Section label */}
              <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400 md:block">
                {group.section}
              </p>

              <div className="flex gap-1 md:flex-col">
                {group.screens.map((s, si) => {
                  const idx = groupOffsets[gi] + si;
                  const isActive = idx === activeIndex;

                  return (
                    <button
                      key={s.label}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative shrink-0 rounded-lg px-3 py-2 text-left transition-colors md:w-full ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      {/* Active accent bar — desktop only */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue-600 md:block" />
                      )}
                      <span className="block text-sm font-medium md:pl-2">
                        {s.label}
                      </span>
                      <span
                        className={`hidden text-[11px] md:block md:pl-2 ${
                          isActive ? 'text-blue-500' : 'text-zinc-400'
                        }`}
                      >
                        {s.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main Viewer ── */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#F4F4F5] p-4 md:p-8">
        {/* Browser chrome */}
        <div className="flex w-full max-w-[920px] flex-col overflow-hidden rounded-xl border border-zinc-300 shadow-lg">
          {/* Title bar */}
          <div className="flex h-10 items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex flex-1 justify-center">
              <div className="flex min-w-[220px] items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-400">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {screen.url}
              </div>
            </div>
          </div>

          {/* Screenshot area */}
          <div className="relative aspect-[920/660] bg-white">
            {ALL_SCREENS.map((s, i) => (
              <Image
                key={s.image}
                src={s.image}
                alt={s.label}
                fill
                className={`object-contain object-top transition-opacity duration-300 ${
                  i === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 768px) 100vw, 920px"
                priority={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Screen title + subtitle */}
        <div className="mt-4 max-w-[720px] text-center">
          <h2
            className="text-lg font-bold text-zinc-900"
            style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
          >
            {screen.label}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            {screen.subtitle}
          </p>
        </div>

        {/* Navigation controls */}
        <div className="mt-4 flex items-center gap-6">
          <button
            onClick={() => go(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[64px] text-center text-sm tabular-nums text-zinc-400">
            {activeIndex + 1} of {ALL_SCREENS.length}
          </span>
          <button
            onClick={() => go(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Active screen label — mobile only */}
        <p className="mt-3 text-sm font-medium text-zinc-700 md:hidden">
          {screen.label}
        </p>
      </main>
    </div>
  );
}
