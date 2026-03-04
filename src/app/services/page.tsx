import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { ScrollReveal } from '@/components/features/services';
import { InlineFAQ } from '@/components/features/faq/InlineFAQ';
import {
  ArrowRight,
  Home,
  CloudLightning,
  Search,
  Wrench,
  CheckCircle,
  Star,
  Quote,
  Phone,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services | Results Roofing',
  description:
    'Roof replacement, storm damage repair, inspections, and gutter services. Transparent pricing with Good, Better, and Best packages. Serving DFW.',
};

/* ================================================================
   DATA
   ================================================================ */

const serviceTabs = [
  { label: 'Roof Replacement', icon: Home },
  { label: 'Storm Damage', icon: CloudLightning },
  { label: 'Inspections', icon: Search },
  { label: 'Gutters', icon: Wrench },
];

const tiers = [
  {
    badge: 'Good',
    badgeColor: 'bg-slate-100 text-slate-600',
    name: '3-Tab Shingles',
    subtitle: 'Reliable, budget-friendly protection',
    features: [
      '15–20 year lifespan',
      'Standard installation',
      'Manufacturer warranty',
      'Full tear-off & cleanup',
    ],
    cta: 'Get Good Quote',
    highlight: false,
  },
  {
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-600',
    name: 'Architectural Shingles',
    subtitle: 'Best balance of value and durability',
    features: [
      '25–30 year lifespan',
      'Enhanced wind resistance',
      'Dimensional curb appeal',
      'Extended warranty eligible',
      'Ice & water shield at valleys',
    ],
    cta: 'Get Better Quote',
    highlight: true,
  },
  {
    badge: 'Best',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    name: 'Premium Designer',
    subtitle: 'Maximum protection and aesthetics',
    features: [
      '40–50 year lifespan',
      'Impact-resistant options',
      'Premium curb appeal',
      'GAF Golden Pledge warranty',
      'Complete ventilation system',
    ],
    cta: 'Get Best Quote',
    highlight: false,
  },
];

const processSteps = [
  {
    number: '01',
    title: 'Get Your Quote',
    description: 'Enter your address. Our satellite system measures your roof and returns pricing in minutes.',
  },
  {
    number: '02',
    title: 'Choose & Customize',
    description: 'Pick Good, Better, or Best. Choose your shingle color and schedule at your own pace.',
  },
  {
    number: '03',
    title: 'Schedule Install',
    description: 'We pull permits, order materials, and handle every detail. Most installs done in 1–2 days.',
  },
  {
    number: '04',
    title: 'Track Progress',
    description: 'Follow your project in your customer portal. Real-time updates from start to finish.',
  },
];

const testimonials = [
  {
    name: 'David K.',
    location: 'Arlington, TX',
    text: 'The Good/Better/Best options made it so easy to compare. No guesswork, no hidden fees. My architectural shingle roof looks incredible.',
    rating: 5,
  },
  {
    name: 'Lisa T.',
    location: 'Denton, TX',
    text: 'Storm damage had me stressed, but Results Roofing made it painless. They handled everything and my roof was done before the next rain.',
    rating: 5,
  },
  {
    name: 'Robert P.',
    location: 'Frisco, TX',
    text: 'Went with the Premium package and couldn\'t be happier. The GAF Golden Pledge warranty gives me total peace of mind.',
    rating: 5,
  },
];

const faqItems = [
  {
    question: 'How accurate are the satellite measurements?',
    answer:
      'Our satellite measurement technology is accurate within 1–2% of a physical measurement. We use the same technology used by insurance adjusters and roofing manufacturers.',
  },
  {
    question: 'What\'s the difference between the three tiers?',
    answer:
      'Good (3-Tab) is budget-friendly and reliable. Better (Architectural) offers enhanced durability and curb appeal — it\'s our most popular choice. Best (Premium Designer) provides maximum lifespan with impact resistance and the industry\'s top warranty.',
  },
  {
    question: 'Do you handle permits and HOA approvals?',
    answer:
      'Yes. We handle all permits, inspections, and can assist with HOA submissions. Permitting costs are included in your quote — no surprises.',
  },
  {
    question: 'What if you find damage to the decking?',
    answer:
      'If we discover rotted or damaged decking during tear-off, we\'ll document it and repair it on site. Decking repair is priced per sheet and communicated to you before we proceed.',
  },
  {
    question: 'Can I finance my roof replacement?',
    answer:
      'Absolutely. We offer financing through our lending partners with flexible monthly payments. Check your rate with no impact to your credit score.',
  },
  {
    question: 'How long does installation take?',
    answer:
      'Most residential roof replacements are completed in 1–2 days, weather permitting. Larger or more complex roofs may take an additional day. We handle all cleanup.',
  },
];

/* ================================================================
   PAGE
   ================================================================ */

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" id="main-content">
        {/* ─── 1. HERO (Dark) ─── */}
        <section className="relative overflow-hidden bg-[#1E2329] py-20 px-6 md:py-28">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold tracking-wider uppercase rounded-full mb-5">
                Our Services
              </span>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-tight mb-6">
                Roofing Done Right,{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Priced Fair
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={160}>
              <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
                From full replacements to storm damage repair — we handle it all
                with transparent pricing and quality workmanship.
              </p>
            </ScrollReveal>

            {/* Service tabs */}
            <ScrollReveal animation="fadeUp" delay={240}>
              <div className="flex flex-wrap justify-center gap-3">
                {serviceTabs.map(({ label, icon: Icon }, i) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      i === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 2. SERVICE TIERS ─── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Choose your package
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                  Find Your Fit
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  Every homeowner has different priorities. Compare our three tiers
                  side-by-side.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier, i) => (
                <ScrollReveal key={tier.name} animation="fadeUp" delay={i * 100}>
                  <div
                    className={`rounded-xl p-6 h-full flex flex-col border ${
                      tier.highlight
                        ? 'border-blue-600 ring-1 ring-blue-600/10 bg-white'
                        : 'border-[#E8EDF5] bg-[#F7F9FC]'
                    }`}
                  >
                    <span
                      className={`inline-block self-start px-3 py-1 rounded-full text-xs font-semibold mb-4 ${tier.badgeColor}`}
                    >
                      {tier.badge}
                    </span>
                    <h3 className="font-[family-name:var(--font-sora)] text-xl font-bold text-slate-900 mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                      {tier.subtitle}
                    </p>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <CheckCircle
                            size={16}
                            className="text-blue-600 flex-shrink-0 mt-0.5"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/quote/new"
                      className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                        tier.highlight
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'border border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400'
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. HOW IT WORKS ─── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Simple process
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  How It Works
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, i) => (
                <ScrollReveal key={step.number} animation="fadeUp" delay={i * 100}>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {step.number}
                    </div>
                    <h3 className="font-[family-name:var(--font-sora)] text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 4. TESTIMONIALS ─── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-12">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Customer stories
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Trusted by DFW Homeowners
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.name} animation="fadeUp" delay={i * 100}>
                  <div className="bg-[#F7F9FC] border border-[#E8EDF5] rounded-xl p-6 h-full flex flex-col">
                    <Quote size={24} className="text-blue-200 mb-3" />
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">
                      {t.text}
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. FAQ ─── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-10">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Common questions
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={100}>
              <InlineFAQ items={faqItems} />
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 6. FINAL CTA ─── */}
        <section className="bg-blue-600 py-20 px-6 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                See Your Price in Under 3 Minutes
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <p className="text-blue-100 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                No phone call. No appointment. No salesperson.
                Just your address and an honest number.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={160}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/quote/new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-md hover:bg-blue-50 transition-colors shadow-lg text-base"
                >
                  Get My Free Quote
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="tel:+18007378587"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-md hover:bg-white/10 transition-colors text-base"
                >
                  <Phone size={16} />
                  Call 1-800-RESULTS
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
