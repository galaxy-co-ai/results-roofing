import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { ScrollReveal } from '@/components/features/services';
import {
  ArrowRight,
  Phone,
  Shield,
  Award,
  Star,
  MapPin,
  CheckCircle,
  X,
  Quote,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Results Roofing',
  description:
    'Learn about Results Roofing — 15+ years of experience, 2,500+ roofs completed, GAF Certified. We\'re changing how DFW homeowners buy a new roof.',
};

/* ================================================================
   DATA
   ================================================================ */

const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '2,500+', label: 'Roofs Completed' },
  { value: '4.9', label: 'Google Rating' },
  { value: 'DFW', label: 'Metro Area' },
];

const oldWayItems = [
  'Pushy door-to-door sales',
  'Hidden fees revealed at signing',
  'Weeks waiting for a quote',
  'No pricing until in-home visit',
  'High-pressure close tactics',
];

const resultsWayItems = [
  'Instant online quotes in minutes',
  'Transparent pricing from day one',
  'Satellite-measured accuracy',
  'Choose your package, your pace',
  'No salespeople, no pressure',
];

const certifications = [
  { icon: Shield, title: 'GAF Certified', subtitle: 'Factory-Trained Installers' },
  { icon: Award, title: 'Fully Insured', subtitle: 'Liability + Workers\' Comp' },
  { icon: Star, title: 'BBB A+ Rated', subtitle: 'Accredited Business' },
  { icon: Star, title: '5-Star Google', subtitle: '500+ Reviews' },
  { icon: Shield, title: 'TX Licensed', subtitle: 'State Licensed Contractor' },
];

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Plano, TX',
    text: 'The whole process was shockingly easy. Got my quote online, picked my shingles, and the crew had my roof done in a day. No salesperson ever knocked on my door.',
    rating: 5,
  },
  {
    name: 'James R.',
    location: 'Fort Worth, TX',
    text: 'After the hailstorm, three roofers showed up at my door. Results was the only one that let me see the pricing upfront without any pressure. Night and day difference.',
    rating: 5,
  },
  {
    name: 'Maria L.',
    location: 'McKinney, TX',
    text: 'I loved being able to choose between Good, Better, and Best options with clear pricing. No hidden fees, no surprises. My new roof looks amazing.',
    rating: 5,
  },
];

const serviceAreaCities = [
  'Dallas',
  'Fort Worth',
  'Plano',
  'Frisco',
  'Arlington',
  'McKinney',
  'Denton',
  'Irving',
  'Richardson',
  'Garland',
  'Grand Prairie',
  'Mesquite',
];

/* ================================================================
   PAGE
   ================================================================ */

export default function AboutPage() {
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

          <div className="relative max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold tracking-wider uppercase rounded-full mb-5">
                About Results Roofing
              </span>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-tight mb-5">
                Built Different.{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  On Purpose.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={160}>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
                We believe getting a new roof should be simple, transparent, and
                stress-free. No pushy salespeople, no hidden fees, no games.
              </p>
            </ScrollReveal>

            {/* Stats bar */}
            <ScrollReveal animation="fadeUp" delay={240}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-5"
                  >
                    <p className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 2. HOW WE'RE DIFFERENT ─── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Why we exist
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  How We&apos;re Different
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Old Way */}
              <ScrollReveal animation="fadeUp" delay={80}>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 md:p-8 h-full">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4">
                    The Old Way
                  </p>
                  <ul className="space-y-3">
                    {oldWayItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-red-700"
                      >
                        <X
                          size={16}
                          className="text-red-400 flex-shrink-0 mt-0.5"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              {/* Results Way */}
              <ScrollReveal animation="fadeUp" delay={160}>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-8 h-full">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
                    The Results Way
                  </p>
                  <ul className="space-y-3">
                    {resultsWayItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-blue-800"
                      >
                        <CheckCircle
                          size={16}
                          className="text-blue-600 flex-shrink-0 mt-0.5"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ─── 3. FOUNDER STORY ─── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Photo placeholder */}
              <ScrollReveal animation="fadeUp">
                <div className="bg-slate-200 rounded-xl aspect-[5/6] max-w-[400px] mx-auto lg:mx-0 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto mb-3" />
                    <p className="text-sm font-medium">Founder Photo</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Story */}
              <ScrollReveal animation="fadeUp" delay={150}>
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
                    Our Story
                  </span>
                  <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold text-slate-900 tracking-tight mb-6">
                    From Roofer to Reformer
                  </h2>
                  <div className="space-y-4 text-slate-600 leading-relaxed">
                    <p>
                      After 15 years in the roofing industry, I saw the same problems
                      over and over: homeowners getting pressured by door-to-door
                      salespeople, hidden fees buried in contracts, and weeks of waiting
                      just to get a price.
                    </p>
                    <p>
                      I started Results Roofing to fix that. Using satellite technology,
                      we measure your roof remotely and give you transparent pricing in
                      minutes — not days. You choose your package at your own pace. No
                      salesperson. No pressure. Just honest work.
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="font-[family-name:var(--font-sora)] font-bold text-slate-900">
                      Founder, Results Roofing
                    </p>
                    <p className="text-sm text-slate-500">
                      GAF Certified · 15+ Years in Roofing
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ─── 4. CERTIFICATIONS ─── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-12">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Credentials
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Why Homeowners Trust Us
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {certifications.map((cert, i) => {
                const Icon = cert.icon;
                return (
                  <ScrollReveal key={cert.title} animation="fadeUp" delay={i * 80}>
                    <div className="bg-[#F7F9FC] border border-[#E8EDF5] rounded-xl p-5 text-center hover:shadow-md hover:border-blue-200 transition-all">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-0.5">
                        {cert.title}
                      </p>
                      <p className="text-xs text-slate-500">{cert.subtitle}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 5. TESTIMONIALS ─── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-12">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Happy homeowners
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  What Our Customers Say
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.name} animation="fadeUp" delay={i * 100}>
                  <div className="bg-white border border-[#E8EDF5] rounded-xl p-6 h-full flex flex-col">
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

        {/* ─── 6. SERVICE AREA ─── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal animation="fadeUp">
                <div>
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                    Where we work
                  </span>
                  <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                    Serving the DFW Metroplex
                  </h2>
                  <p className="text-slate-500 mb-6">
                    From Dallas to Denton, Fort Worth to Frisco — we&apos;ve got you
                    covered.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {serviceAreaCities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FC] border border-[#E8EDF5] rounded-full text-sm text-slate-700"
                      >
                        <MapPin size={12} className="text-blue-600" />
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fadeUp" delay={150}>
                <div className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <MapPin size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-medium">Map Coming Soon</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ─── 7. FINAL CTA ─── */}
        <section className="bg-blue-600 py-20 px-6 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Ready to Experience the Difference?
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <p className="text-blue-100 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Get your instant roof quote — no appointment, no pressure, no surprises.
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
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-md hover:bg-white/10 transition-colors text-base"
                >
                  <Phone size={16} />
                  Contact Us
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
