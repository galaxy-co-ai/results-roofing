import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import {
  ScrollReveal,
  StatsStrip,
  ServiceTierCard,
  BeforeAfterSlider,
} from '@/components/features/services';
import { Home, Shield, Clock, CheckCircle2, ArrowRight, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Roof replacement services from Results Roofing. Choose from Good, Better, or Best packages. Financing available. GAF certified installation.',
};

/* ============================================================
   DATA
   ============================================================ */

const packages = [
  {
    tier: 'good' as const,
    name: '3-Tab Shingles',
    tagline: 'Reliable protection at an affordable price',
    warranty: '25-year limited warranty',
    features: [
      'Standard 3-tab asphalt shingles',
      'Ice & water shield at valleys and eaves',
      'Synthetic underlayment',
      'New drip edge and vents',
      'Complete tear-off and disposal',
    ],
  },
  {
    tier: 'better' as const,
    name: 'Architectural Shingles',
    tagline: 'Enhanced durability and curb appeal',
    warranty: '30-year limited warranty',
    popular: true,
    features: [
      'Dimensional architectural shingles',
      'Enhanced ice & water protection',
      'Premium synthetic underlayment',
      'Upgraded ridge cap shingles',
      'Improved ventilation system',
      'All Good package features',
    ],
  },
  {
    tier: 'best' as const,
    name: 'Premium System',
    tagline: 'Maximum protection and aesthetics',
    warranty: '50-year limited warranty',
    features: [
      'Designer or impact-resistant shingles',
      'Full ice & water barrier',
      'GAF Tiger Paw underlayment',
      'Cobra ridge vent system',
      'Starter strip at all edges',
      'GAF Golden Pledge warranty eligible',
      'All Better package features',
    ],
  },
];

const processSteps = [
  {
    icon: Home,
    title: 'Instant Quote',
    description: 'Enter your address and get satellite-measured pricing in minutes.',
  },
  {
    icon: CheckCircle2,
    title: 'Choose Your Package',
    description: 'Compare Good, Better, and Best options with transparent pricing.',
  },
  {
    icon: Clock,
    title: 'Schedule Installation',
    description: 'Pick a date that works — most installs complete in 1-2 days.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'GAF-certified installation backed by manufacturer warranties.',
  },
];

/* ============================================================
   PAGE
   ============================================================ */

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" id="main-content">

        {/* ─── 1. HERO (Dark) ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 py-24 px-6 md:py-32">
          {/* Dot pattern decorative background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-white">Roof Replacement</span>{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Done Right
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={100}>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                Quality materials, expert installation, and transparent pricing.
                Choose the package that fits your needs and budget — backed by
                industry-leading warranties.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={200}>
              <Link
                href="/quote/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25 text-lg"
              >
                Get My Free Quote
                <ArrowRight size={18} />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 2. STATS STRIP (Light) ─── */}
        <section className="bg-slate-50 py-16 px-6">
          <StatsStrip />
        </section>

        {/* ─── 3. SERVICE TIERS (White) ─── */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                  Roofing Packages
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                  Every package includes complete tear-off, professional installation,
                  and a thorough post-install inspection.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
              {packages.map((pkg, i) => (
                <ScrollReveal key={pkg.tier} animation="fadeUp" delay={i * 120}>
                  <ServiceTierCard
                    tier={pkg.tier}
                    name={pkg.name}
                    tagline={pkg.tagline}
                    warranty={pkg.warranty}
                    features={pkg.features}
                    popular={pkg.popular}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 4. BEFORE/AFTER (Dark) ─── */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-12">
                <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold text-white tracking-tight mb-4">
                  See the Difference
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Drag the slider to compare before and after one of our recent roof replacements.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scaleIn" delay={100}>
              <BeforeAfterSlider />
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 5. PROCESS (Light) ─── */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                  How It Works
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  From quote to completion in four simple steps.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-10">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <ScrollReveal key={step.title} animation="fadeUp" delay={index * 100}>
                    <div className="flex gap-5">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 text-lg mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 6. FINANCING (White) ─── */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="scaleIn">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
                {/* Subtle radial glow */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 20%, rgba(147, 197, 253, 0.5), transparent 60%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative">
                  <DollarSign className="w-12 h-12 text-blue-200 mx-auto mb-5" />
                  <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                    Flexible Financing Available
                  </h2>
                  <p className="text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
                    Don&apos;t let budget hold you back. We offer financing options
                    with competitive rates and flexible terms. Check your rate with no
                    impact to your credit score.
                  </p>
                  <Link
                    href="/quote/new"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Get Pre-Qualified
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 7. FINAL CTA (Dark) ─── */}
        <section className="bg-slate-900 py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Ready for Your New Roof?
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={100}>
              <p className="text-slate-400 mb-10 text-lg max-w-lg mx-auto">
                Get your instant quote and see package pricing tailored to your home.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={200}>
              <Link
                href="/quote/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg text-lg"
              >
                Get My Free Quote
                <ArrowRight size={18} />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
