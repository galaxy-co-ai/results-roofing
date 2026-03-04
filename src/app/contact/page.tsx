import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { ScrollReveal } from '@/components/features/services';
import { ServiceRequestForm } from '@/components/features/contact';
import { InlineFAQ } from '@/components/features/faq/InlineFAQ';
import {
  Phone,
  Mail,
  Clock,
  Shield,
  Award,
  Star,
  Zap,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Results Roofing',
  description:
    'Get in touch with Results Roofing. Request a free quote, ask about our services, or reach us by phone and email. Serving the DFW metro area.',
};

/* ================================================================
   DATA
   ================================================================ */

const trustBadges = [
  { icon: Shield, title: 'GAF Certified', subtitle: 'Factory-Trained' },
  { icon: Award, title: 'Fully Insured', subtitle: 'Licensed Contractor' },
  { icon: Zap, title: '24hr Response', subtitle: 'Guaranteed' },
  { icon: Star, title: '4.9★ Google', subtitle: '500+ Reviews' },
];

const contactMethods = [
  {
    icon: Phone,
    label: 'Phone',
    value: '1-800-RESULTS',
    detail: 'Mon–Fri 8am–6pm, Sat 9am–2pm',
    href: 'tel:+18007378587',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@resultsroofing.com',
    detail: 'We respond within 24 hours',
    href: 'mailto:hello@resultsroofing.com',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon–Fri 8am–6pm',
    detail: 'Saturday 9am–2pm · Sunday Closed',
    href: null,
  },
];

const faqItems = [
  {
    question: 'How quickly can I get a quote?',
    answer:
      'Our instant quote system uses satellite measurement to give you pricing in under 3 minutes. Just enter your address and choose your preferred package. No appointment needed.',
  },
  {
    question: 'Do you offer free inspections?',
    answer:
      'Yes. If you suspect storm damage or want a professional assessment, we offer free roof inspections for homeowners in the DFW metro area.',
  },
  {
    question: 'What payment options do you accept?',
    answer:
      'We accept credit/debit cards and ACH payments. We also offer financing through our lending partners — check your rate with no impact to your credit score.',
  },
  {
    question: 'How long does a typical roof replacement take?',
    answer:
      'Most residential roof replacements are completed in 1–2 days, weather permitting. We handle everything from permits to cleanup.',
  },
  {
    question: 'Are you licensed and insured?',
    answer:
      'Absolutely. Results Roofing is a fully licensed Texas contractor with comprehensive liability and workers\' comp insurance. We\'re also GAF Certified.',
  },
  {
    question: 'What warranty do I get?',
    answer:
      'All installations include manufacturer warranty coverage. Our premium packages qualify for GAF\'s Golden Pledge warranty — the best in the industry.',
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

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" id="main-content">
        {/* ─── 1. HERO (Dark) + Service Request Form ─── */}
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

          <div className="relative max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left: Copy */}
              <div className="lg:pt-6">
                <ScrollReveal animation="fadeUp">
                  <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold tracking-wider uppercase rounded-full mb-5">
                    Contact Us
                  </span>
                </ScrollReveal>

                <ScrollReveal animation="fadeUp" delay={80}>
                  <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
                    Get In Touch
                  </h1>
                </ScrollReveal>

                <ScrollReveal animation="fadeUp" delay={160}>
                  <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                    Questions about your roof, our services, or ready to get started?
                    Fill out the form and we&apos;ll get back to you within 24 hours.
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="fadeUp" delay={240}>
                  <p className="text-sm text-slate-500">
                    Or call us directly:{' '}
                    <a
                      href="tel:+18007378587"
                      className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                    >
                      1-800-RESULTS
                    </a>
                  </p>
                </ScrollReveal>
              </div>

              {/* Right: Form */}
              <ScrollReveal animation="fadeUp" delay={200}>
                <ServiceRequestForm />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ─── 2. TRUST STRIP ─── */}
        <section className="bg-[#F7F9FC] py-10 px-6 border-y border-[#E8EDF5]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {trustBadges.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <ScrollReveal key={badge.title} animation="fadeUp" delay={i * 80}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {badge.title}
                        </p>
                        <p className="text-xs text-slate-500">{badge.subtitle}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 3. REACH OUT DIRECTLY ─── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-12">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                  Direct contact
                </span>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                  Reach Out Directly
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  Prefer a phone call or email? We&apos;re here for you.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, i) => {
                const Icon = method.icon;
                const Wrapper = method.href ? 'a' : 'div';
                const wrapperProps = method.href
                  ? { href: method.href }
                  : {};

                return (
                  <ScrollReveal key={method.label} animation="fadeUp" delay={i * 100}>
                    <Wrapper
                      {...wrapperProps}
                      className="block bg-[#F7F9FC] rounded-xl border border-[#E8EDF5] p-6 hover:shadow-md hover:border-blue-200 transition-all text-center"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {method.label}
                      </p>
                      <p className="font-[family-name:var(--font-sora)] font-bold text-slate-900 text-lg mb-1">
                        {method.value}
                      </p>
                      <p className="text-sm text-slate-500">{method.detail}</p>
                    </Wrapper>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 4. FAQ ─── */}
        <section className="bg-white py-16 px-6 md:py-20">
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

        {/* ─── 5. SERVICE AREA ─── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal animation="fadeUp">
                <div>
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 block mb-3">
                    Where we work
                  </span>
                  <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                    DFW Metro Area
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Proudly serving homeowners across the Dallas–Fort Worth metroplex.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {serviceAreaCities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8EDF5] rounded-full text-sm text-slate-700"
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

        {/* ─── 6. FINAL CTA ─── */}
        <section className="bg-blue-600 py-20 px-6 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Ready for Your Free Quote?
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <p className="text-blue-100 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Get satellite-measured pricing in under 3 minutes. No appointment, no
                pressure, no surprises.
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
