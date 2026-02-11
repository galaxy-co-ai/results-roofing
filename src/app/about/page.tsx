import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { Shield, Award, Users, MapPin, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Results Roofing - GAF Certified roofing contractor serving TX, GA, NC, AZ, and OK. Quality roof replacements with transparent pricing.',
};

const certifications = [
  {
    icon: Shield,
    title: 'GAF Certified',
    description: 'Factory-certified installers trained in the latest roofing techniques',
  },
  {
    icon: Award,
    title: 'Licensed & Insured',
    description: 'Fully licensed contractor with comprehensive insurance coverage',
  },
  {
    icon: Users,
    title: '10,000+ Roofs',
    description: 'Trusted by thousands of homeowners across 5 states',
  },
];

const serviceAreas = [
  { state: 'Texas', cities: 'Dallas, Houston, Austin, San Antonio' },
  { state: 'Georgia', cities: 'Atlanta, Savannah, Augusta' },
  { state: 'North Carolina', cities: 'Charlotte, Raleigh, Durham' },
  { state: 'Arizona', cities: 'Phoenix, Tucson, Mesa' },
  { state: 'Oklahoma', cities: 'Oklahoma City, Tulsa, Norman' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white" id="main-content">
        {/* Hero */}
        <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-5">
              Roofing, <span className="text-blue-600">Reimagined</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We believe getting a new roof should be simple. No pushy salespeople,
              no hidden fees, no games. Just honest pricing and quality work.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900 tracking-tight mb-6">Our Mission</h2>
            <div className="space-y-5 text-slate-600 text-lg leading-relaxed">
              <p>
                Results Roofing was founded with a simple idea: homeowners deserve
                to know the real cost of their roof replacement before anyone shows up
                at their door.
              </p>
              <p>
                Using satellite technology and transparent pricing, we give you an
                instant quote in minutes — not days. No home visits required. No
                high-pressure sales tactics.
              </p>
              <p>
                When you&apos;re ready to move forward, we handle everything: scheduling,
                permitting, installation, and cleanup. Our GAF-certified crews deliver
                quality workmanship backed by industry-leading warranties.
              </p>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900 tracking-tight mb-10 text-center">
              Why Homeowners Trust Us
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <div
                  key={cert.title}
                  className="bg-white p-7 rounded-xl border border-slate-200 text-center hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 mb-2">{cert.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900 tracking-tight mb-10 text-center">
              Service Areas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceAreas.map((area) => (
                <div
                  key={area.state}
                  className="p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">{area.state}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{area.cities}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Get your instant roof quote in minutes — no appointment needed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
            >
              Get My Quote
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
