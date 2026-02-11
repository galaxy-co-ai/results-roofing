'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase, FileText, Users, Inbox, Zap, BarChart3,
  Satellite, DollarSign, CreditCard, LayoutDashboard, Bell, FileCheck,
  ArrowRight, Play,
} from 'lucide-react';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

// ─── Data ────────────────────────────────────────────────────────────────────

type View = 'homeowners' | 'team';

interface FeatureCard {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

interface ViewData {
  heroTag: string;
  heroTitle: string;
  heroSub: string;
  btn1: string;
  btn2: string;
  btn1Link: string;
  btn2Link: string;
  stats: { value: string; label: string }[];
  sectionTitle: string;
  sectionSub: string;
  features: FeatureCard[];
  showcaseTitle: string;
  showcaseSub: string;
  carouselItems: { label: string; image: string }[];
  ctaTitle: string;
  ctaSub: string;
  ctaBtn1: string;
  ctaBtn2: string;
}

const TEAM_DATA: ViewData = {
  heroTag: 'Built for roofing professionals',
  heroTitle: 'Your entire roofing business. One dashboard.',
  heroSub: 'Manage jobs, send estimates, track payments, and communicate with customers \u2014 all from a single command center designed specifically for roofing contractors.',
  btn1: 'Start Free Trial',
  btn2: 'Watch Demo',
  btn1Link: '/ops',
  btn2Link: '#features',
  stats: [
    { value: '15+ hrs', label: 'Saved per week' },
    { value: '32%', label: 'Faster estimates' },
    { value: '2x', label: 'More revenue captured' },
    { value: '100%', label: 'Paperless operations' },
  ],
  sectionTitle: 'Everything you need to run your roofing business',
  sectionSub: 'From first call to final payment \u2014 one platform handles it all.',
  features: [
    { icon: Briefcase, iconBg: '#EFF6FF', iconColor: '#2563EB', title: 'Job Pipeline', description: 'Kanban board to track every job from lead to completion. Drag cards between stages, assign crews, and never lose track of a job.' },
    { icon: FileText, iconBg: '#FEF3C7', iconColor: '#D97706', title: 'Estimates & Invoices', description: 'Professional estimates in minutes. Convert to invoices with one click. Track payments and send reminders automatically.' },
    { icon: Users, iconBg: '#ECFDF5', iconColor: '#059669', title: 'Customer CRM', description: 'Complete customer profiles with job history, communication logs, and payment tracking. Know every customer inside and out.' },
    { icon: Inbox, iconBg: '#FEF2F2', iconColor: '#DC2626', title: 'Unified Inbox', description: 'Email and SMS in one place. Every conversation linked to a job. Reply from one screen without switching between apps.' },
    { icon: Zap, iconBg: '#F3E8FF', iconColor: '#7C3AED', title: 'Smart Automations', description: 'Trigger follow-ups, status updates, and reminders automatically. Build workflows that run while you focus on roofs.' },
    { icon: BarChart3, iconBg: '#FFF7ED', iconColor: '#EA580C', title: 'Reports & Analytics', description: 'Revenue dashboards, lead funnels, close rates, and crew performance. Real numbers to grow your business.' },
  ],
  showcaseTitle: '27 pages. Every workflow covered.',
  showcaseSub: 'Dashboard  \u00b7  Jobs Kanban  \u00b7  Estimates  \u00b7  Invoices  \u00b7  Payments  \u00b7  Calendar  \u00b7  Inbox  \u00b7  CRM  \u00b7  Reports  \u00b7  Automations  \u00b7  Materials  \u00b7  Documents  \u00b7  Settings  \u00b7  Team',
  carouselItems: [
    { label: 'Dashboard', image: '/showcase/dashboard.png' },
    { label: 'Jobs Kanban', image: '/showcase/jobs-kanban.png' },
    { label: 'Estimate Builder', image: '/showcase/estimates.png' },
    { label: 'Invoices', image: '/showcase/invoices.png' },
    { label: 'Customer CRM', image: '/showcase/customers.png' },
  ],
  ctaTitle: 'Ready to modernize your roofing business?',
  ctaSub: 'Join roofing contractors who are saving 15+ hours a week and closing more deals.',
  ctaBtn1: 'Start Free Trial',
  ctaBtn2: 'Schedule a Demo',
};

const HOMEOWNERS_DATA: ViewData = {
  heroTag: 'For homeowners who want transparency',
  heroTitle: 'Your roof replacement. Transparent from start to finish.',
  heroSub: 'Get an instant satellite quote, choose your package, track every step online, and pay on your terms \u2014 no surprises, no pressure, no runaround.',
  btn1: 'Get My Free Quote',
  btn2: 'See How It Works',
  btn1Link: '/quote',
  btn2Link: '#features',
  stats: [
    { value: '< 2 min', label: 'To get a quote' },
    { value: '4.9 \u2605', label: 'Customer rating' },
    { value: '$0', label: 'Surprise fees' },
    { value: '100%', label: 'Transparent pricing' },
  ],
  sectionTitle: 'Everything you need to feel confident',
  sectionSub: 'From your first quote to your final payment \u2014 we make it easy.',
  features: [
    { icon: Satellite, iconBg: '#DBEAFE', iconColor: '#2563EB', title: 'Instant Satellite Quote', description: 'Enter your address, we measure your roof by satellite in seconds. Accurate square footage, no stranger on your roof, no appointment needed.' },
    { icon: DollarSign, iconBg: '#FEF3C7', iconColor: '#D97706', title: 'Transparent Pricing', description: 'See exactly what you\u2019re paying for \u2014 materials, labor, warranties \u2014 all broken down. Compare packages side by side. No hidden costs.' },
    { icon: CreditCard, iconBg: '#ECFDF5', iconColor: '#059669', title: 'Easy Financing', description: 'Pre-qualify in minutes with no credit impact. Flexible payment plans that fit your budget. Get started with $0 down.' },
    { icon: LayoutDashboard, iconBg: '#FEF2F2', iconColor: '#DC2626', title: 'Customer Portal', description: 'Log in anytime to see your project status, view documents, make payments, and message your team. Everything in one place.' },
    { icon: Bell, iconBg: '#F3E8FF', iconColor: '#7C3AED', title: 'Real-time Updates', description: 'Get notified at every milestone \u2014 when materials arrive, when the crew\u2019s on-site, when the job\u2019s complete. Never wonder what\u2019s happening.' },
    { icon: FileCheck, iconBg: '#FFF7ED', iconColor: '#EA580C', title: 'Digital Documents', description: 'Estimates, invoices, contracts, and warranty info \u2014 all digital, all signed online. No paper shuffling, no lost documents.' },
  ],
  showcaseTitle: 'See it in action.',
  showcaseSub: 'Get a Quote  \u00b7  Satellite Measurement  \u00b7  Package Selection  \u00b7  Checkout  \u00b7  Customer Portal  \u00b7  Payment Tracker',
  carouselItems: [
    { label: 'Get a Quote', image: '/showcase/get-a-quote.png' },
    { label: 'Satellite Measurement', image: '/showcase/satellite.png' },
    { label: 'Choose Your Package', image: '/showcase/packages.png' },
    { label: 'Schedule Installation', image: '/showcase/schedule.png' },
    { label: 'Customer Portal', image: '/showcase/portal-payments.png' },
  ],
  ctaTitle: 'Get your free roof quote in under 2 minutes.',
  ctaSub: 'No appointment needed. No pressure. Just an honest price for your roof.',
  ctaBtn1: 'Get My Free Quote',
  ctaBtn2: 'See How It Works',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [view, setView] = useState<View>('homeowners');
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselIdx, setCarouselIdx] = useState(0);

  const data = view === 'team' ? TEAM_DATA : HOMEOWNERS_DATA;

  // Track active slide
  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCarouselIdx(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect();
    carouselApi.on('select', onSelect);
    return () => { carouselApi.off('select', onSelect); };
  }, [carouselApi, onSelect]);

  // Reset carousel on view change
  useEffect(() => {
    if (carouselApi) carouselApi.scrollTo(0);
  }, [view, carouselApi]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 md:px-12 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}>R</span>
          </div>
          <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}>
            Results Roofing
          </span>
        </Link>
        <Link
          href={view === 'team' ? '/ops' : '/quote'}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {view === 'team' ? 'Request a Demo' : 'Get a Quote'}
        </Link>
      </nav>

      {/* ── Toggle Bar ── */}
      <div className="flex items-center justify-center h-14 bg-slate-50">
        <div className="flex items-center gap-1 rounded-full bg-slate-200 p-1">
          <button
            onClick={() => setView('homeowners')}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              view === 'homeowners'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            For Homeowners
          </button>
          <button
            onClick={() => setView('team')}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              view === 'team'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            For Your Team
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center gap-8 bg-slate-50 px-6 py-20 md:py-24">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-[13px] font-medium text-blue-600">
          {data.heroTag}
        </span>
        <h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center max-w-[800px] leading-tight"
          style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
        >
          {data.heroTitle}
        </h1>
        <p className="text-lg text-gray-500 text-center max-w-[680px] leading-relaxed">
          {data.heroSub}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={data.btn1Link}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {data.btn1}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={data.btn2Link}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-7 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            {view === 'team' && <Play className="h-4 w-4" />}
            {data.btn2}
          </a>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="flex items-center justify-center bg-slate-100 px-6 md:px-20 py-0">
        <div className="w-full max-w-[1100px] rounded-xl border border-gray-300 overflow-hidden shadow-lg -mt-4 mb-0">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 h-10 bg-gray-100 px-4 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400 min-w-[260px]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {view === 'team' ? 'app.resultsroofing.com/ops' : 'resultsroofing.com/quote'}
              </div>
            </div>
          </div>
          {/* Screen content */}
          <div className="relative bg-gray-100 aspect-[16/9] overflow-hidden">
            <Image
              src={view === 'team' ? '/showcase/dashboard.png' : '/showcase/packages.png'}
              alt={view === 'team' ? 'Ops Dashboard' : 'Quote Flow'}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 1100px"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="flex items-center justify-between px-6 md:px-20 py-10 max-w-[1280px] mx-auto">
        {data.stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className="text-2xl md:text-3xl font-extrabold text-blue-600 tabular-nums"
              style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
            >
              {s.value}
            </span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Feature Grid ── */}
      <section id="features" className="bg-white px-6 md:px-20 py-16 scroll-mt-16">
        <div className="max-w-[1280px] mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2
              className="text-2xl md:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
            >
              {data.sectionTitle}
            </h2>
            <p className="text-base text-gray-500">{data.sectionSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-50 border border-gray-200 p-6 space-y-3 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: f.iconBg }}
                  >
                    <f.icon className="h-4 w-4" style={{ color: f.iconColor }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}>
                    {f.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Page Showcase / Carousel ── */}
      <section className="bg-slate-50 px-6 md:px-20 py-16">
        <div className="max-w-[1280px] mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2
              className="text-2xl md:text-[28px] font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
            >
              {data.showcaseTitle}
            </h2>
            <p className="text-sm text-gray-500 max-w-[900px] mx-auto">{data.showcaseSub}</p>
          </div>

          {/* Carousel */}
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: 'start', loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {data.carouselItems.map((item, i) => (
                <CarouselItem key={item.label} className="pl-4 basis-[85%] md:basis-1/3">
                  <Card className={`overflow-hidden transition-all duration-200 ${
                    i === carouselIdx ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:shadow-md'
                  }`}>
                    <CardContent className="p-0">
                      <div className="relative aspect-[16/10] bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.label}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 768px) 85vw, 33vw"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700 text-center">{item.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {data.carouselItems.map((_item, i) => (
              <button
                key={i}
                onClick={() => carouselApi?.scrollTo(i)}
                className={`rounded-full transition-all ${
                  i === carouselIdx ? 'w-2.5 h-2.5 bg-blue-600' : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="bg-gray-900 px-6 md:px-20 py-20">
        <div className="max-w-[700px] mx-auto text-center space-y-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-sora), system-ui, sans-serif' }}
          >
            {data.ctaTitle}
          </h2>
          <p className="text-base text-gray-400">{data.ctaSub}</p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href={data.btn1Link}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {data.ctaBtn1}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={data.btn2Link}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              {data.ctaBtn2}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between h-[60px] px-6 md:px-20 bg-gray-950 text-xs text-gray-500">
        <span>&copy; 2026 Results Roofing. All rights reserved.</span>
        <span className="space-x-4">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
        </span>
      </footer>

    </div>
  );
}
