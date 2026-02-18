import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { ScrollReveal } from '@/components/features/services';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Award,
  Zap,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Results Roofing for questions about your roof replacement. Service areas include TX, GA, NC, AZ, and OK.',
};

/* ============================================================
   DATA
   ============================================================ */

const trustBadges = [
  {
    icon: Shield,
    title: 'GAF Certified',
    description: 'Factory-Trained Installers',
  },
  {
    icon: Award,
    title: 'Licensed & Insured',
    description: 'Full Coverage in All States',
  },
  {
    icon: Zap,
    title: '24hr Response',
    description: 'Guaranteed',
  },
];

const serviceAreas = [
  {
    state: 'Texas',
    abbr: 'TX',
    cities: ['Dallas', 'Houston', 'Austin', 'San Antonio'],
  },
  {
    state: 'Georgia',
    abbr: 'GA',
    cities: ['Atlanta', 'Savannah', 'Augusta'],
  },
  {
    state: 'North Carolina',
    abbr: 'NC',
    cities: ['Charlotte', 'Raleigh', 'Durham'],
  },
  {
    state: 'Arizona',
    abbr: 'AZ',
    cities: ['Phoenix', 'Tucson', 'Mesa'],
  },
  {
    state: 'Oklahoma',
    abbr: 'OK',
    cities: ['Oklahoma City', 'Tulsa', 'Norman'],
  },
];

/* ============================================================
   PAGE
   ============================================================ */

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" id="main-content">

        {/* ─── 1. HERO (Dark) ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 py-24 px-6 md:py-32">
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
                <span className="text-white">Let&apos;s</span>{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Talk
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={100}>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                Questions about your quote, our services, or coverage areas?
                We&apos;re here to help — and we respond within 24 hours.
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

        {/* ─── 2. TRUST STRIP (Light) ─── */}
        <section className="bg-slate-50 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-10">
              {trustBadges.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <ScrollReveal key={badge.title} animation="fadeUp" delay={i * 100}>
                    <div className="text-center">
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-600/20">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 text-lg">
                        {badge.title}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">{badge.description}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 3. CONTACT BENTO GRID (White) ─── */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                  Reach Us Directly
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1: Phone */}
              <ScrollReveal animation="fadeUp" delay={0}>
                <a
                  href="tel:+18007378587"
                  className="block rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-transparent transition-all group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-600/20 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-shadow">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Phone
                  </span>
                  <p className="font-[family-name:var(--font-sora)] font-bold text-slate-900 text-xl mt-1">
                    1-800-RESULTS
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Mon-Fri 8am-6pm, Sat 9am-2pm
                  </p>
                </a>
              </ScrollReveal>

              {/* Card 2: Email */}
              <ScrollReveal animation="fadeUp" delay={120}>
                <a
                  href="mailto:hello@resultsroofing.com"
                  className="block rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-transparent transition-all group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-600/20 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-shadow">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </span>
                  <p className="font-[family-name:var(--font-sora)] font-bold text-slate-900 text-xl mt-1">
                    hello@resultsroofing.com
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    We respond within 24 hours
                  </p>
                </a>
              </ScrollReveal>

              {/* Card 3: Business Hours */}
              <ScrollReveal animation="fadeUp" delay={240}>
                <div className="rounded-2xl border border-slate-200 p-8">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-600/20">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Business Hours
                  </span>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white rounded-xl p-5 border border-slate-200/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Mon-Fri
                      </h3>
                      <p className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 text-sm">
                        8am – 6pm
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Saturday
                      </h3>
                      <p className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 text-sm">
                        9am – 2pm
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Sunday
                      </h3>
                      <p className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 text-sm">
                        Closed
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 4: Response Promise */}
              <ScrollReveal animation="fadeUp" delay={360}>
                <div className="rounded-2xl border border-slate-200 p-8">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-600/20">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Response Promise
                  </span>
                  <p className="font-[family-name:var(--font-sora)] font-bold text-slate-900 text-xl mt-1">
                    Fast Response
                  </p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We respond to every inquiry within 24 hours. Most quotes are
                    ready in minutes with our satellite measurement system.
                  </p>
                  <Link
                    href="/quote/new"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors mt-4"
                  >
                    Get instant quote
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ─── 4. SERVICE AREAS (Dark) ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 py-20 px-6">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-14">
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                  Where We Serve
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Proudly serving homeowners across five states with expert roof
                  replacement.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {serviceAreas.map((area, i) => (
                <ScrollReveal key={area.abbr} animation="fadeUp" delay={i * 100}>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-blue-400 uppercase tracking-wider text-xs font-bold">
                      {area.abbr}
                    </span>
                    <p className="font-[family-name:var(--font-sora)] text-white text-lg font-semibold mt-0.5">
                      {area.state}
                    </p>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {area.cities.join(', ')}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. INSTANT QUOTE CTA (White) ─── */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="scaleIn">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background:
                      'radial-gradient(ellipse at 30% 20%, rgba(147, 197, 253, 0.5), transparent 60%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative">
                  <Phone className="w-12 h-12 text-blue-200 mx-auto mb-5" />
                  <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                    Skip the Wait — Get an Instant Quote
                  </h2>
                  <p className="text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
                    No phone call required. Just enter your address and get
                    satellite-measured pricing in minutes.
                  </p>
                  <Link
                    href="/quote/new"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Get My Quote
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 6. FINAL CTA (Dark) ─── */}
        <section className="bg-slate-900 py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Ready to Get Started?
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={100}>
              <p className="text-slate-400 mb-10 text-lg max-w-lg mx-auto">
                Get your instant quote and see package pricing tailored to your
                home.
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
