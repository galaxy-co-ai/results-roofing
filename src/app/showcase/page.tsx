'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

type View = 'homeowners' | 'team';

const SCREENS: Record<View, { label: string; image: string }[]> = {
  homeowners: [
    { label: 'Landing Page', image: '/showcase/ho-landing.png' },
    { label: 'Property Confirm', image: '/showcase/ho-property.png' },
    { label: 'Choose Package', image: '/showcase/ho-packages.png' },
    { label: 'Schedule Install', image: '/showcase/ho-schedule.png' },
    { label: 'Confirm Booking', image: '/showcase/ho-confirm.png' },
    { label: 'Portal Dashboard', image: '/showcase/ho-portal-dashboard.png' },
    { label: 'Documents', image: '/showcase/ho-portal-documents.png' },
    { label: 'Payments', image: '/showcase/ho-portal-payments.png' },
    { label: 'Schedule View', image: '/showcase/ho-portal-schedule.png' },
  ],
  team: [
    { label: 'Dashboard', image: '/showcase/ops-dashboard.png' },
    { label: 'Customers', image: '/showcase/ops-customers.png' },
    { label: 'Calendar', image: '/showcase/ops-calendar.png' },
    { label: 'Estimates', image: '/showcase/ops-estimates.png' },
    { label: 'Invoices', image: '/showcase/ops-invoices.png' },
    { label: 'Materials', image: '/showcase/ops-materials.png' },
    { label: 'Reports', image: '/showcase/ops-reports.png' },
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [view, setView] = useState<View>('homeowners');
  const [activeIndex, setActiveIndex] = useState(0);

  const screens = SCREENS[view];
  const activeScreen = screens[activeIndex];

  // Reset index when view changes
  useEffect(() => {
    setActiveIndex(0);
  }, [view]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex((prev) => (prev + dir + screens.length) % screens.length);
    },
    [screens.length],
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

  return (
    <div className="flex h-screen flex-col bg-white md:flex-row" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>

      {/* ── Sidebar (desktop) / Top bar (mobile) ── */}
      <aside className="flex w-full shrink-0 flex-col border-b border-gray-200 bg-slate-50 md:h-screen md:w-[280px] md:border-b-0 md:border-r">

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}>R</span>
            </div>
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}>
              Results Roofing
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1 rounded-full bg-slate-200 p-1">
            {(['homeowners', 'team'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {v === 'homeowners' ? 'Homeowners' : 'Team'}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block border-t border-gray-200" />

        {/* Screen list — horizontal scroll on mobile, vertical on desktop */}
        <nav className="flex gap-1 overflow-x-auto px-5 py-3 md:flex-col md:overflow-x-visible md:py-4">
          {screens.map((screen, i) => (
            <button
              key={screen.label}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all md:w-full ${
                i === activeIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {/* Active accent bar — desktop only */}
              {i === activeIndex && (
                <span className="absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue-600 md:block" />
              )}
              <span className="md:pl-2">{screen.label}</span>
            </button>
          ))}
        </nav>

      </aside>

      {/* ── Main Viewer ── */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-100 p-4 md:p-10">

        {/* Browser chrome mockup */}
        <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-xl border border-gray-300 shadow-lg">
          {/* Title bar */}
          <div className="flex h-10 items-center gap-2 border-b border-gray-200 bg-gray-100 px-4">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="flex flex-1 justify-center">
              <div className="flex min-w-[220px] items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {view === 'team' ? 'app.resultsroofing.com/ops' : 'resultsroofing.com/quote'}
              </div>
            </div>
          </div>

          {/* Screenshot area — wider for team ops, taller for homeowner flow */}
          <div className={`relative bg-white ${view === 'team' ? 'aspect-[8/5]' : 'aspect-[4/3]'}`}>
            {screens.map((screen, i) => (
              <Image
                key={screen.image}
                src={screen.image}
                alt={screen.label}
                fill
                className={`object-contain object-top transition-opacity duration-300 ${
                  i === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 768px) 100vw, 960px"
                priority={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="mt-5 flex items-center gap-6">
          <button
            onClick={() => go(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[64px] text-center text-sm tabular-nums text-gray-500">
            {activeIndex + 1} of {screens.length}
          </span>
          <button
            onClick={() => go(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Active screen label — mobile only */}
        <p className="mt-3 text-sm font-medium text-gray-700 md:hidden">{activeScreen.label}</p>
      </main>
    </div>
  );
}
