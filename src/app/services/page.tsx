import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout';
import { Home, Shield, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Roof replacement services from Results Roofing. Choose from Good, Better, or Best packages. Financing available. GAF certified installation.',
};

const packages = [
  {
    tier: 'Good',
    name: '3-Tab Shingles',
    description: 'Reliable protection at an affordable price',
    warranty: '25-year limited warranty',
    features: [
      'Standard 3-tab asphalt shingles',
      'Ice & water shield at valleys and eaves',
      'Synthetic underlayment',
      'New drip edge and vents',
      'Complete tear-off and disposal',
    ],
    color: 'slate',
  },
  {
    tier: 'Better',
    name: 'Architectural Shingles',
    description: 'Enhanced durability and curb appeal',
    warranty: '30-year limited warranty',
    features: [
      'Dimensional architectural shingles',
      'Enhanced ice & water protection',
      'Premium synthetic underlayment',
      'Upgraded ridge cap shingles',
      'Improved ventilation system',
      'All Good package features',
    ],
    color: 'blue',
    popular: true,
  },
  {
    tier: 'Best',
    name: 'Premium System',
    description: 'Maximum protection and aesthetics',
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
    color: 'amber',
  },
];

const processSteps = [
  {
    icon: Home,
    title: 'Instant Quote',
    description: 'Enter your address and get satellite-measured pricing in minutes',
  },
  {
    icon: CheckCircle2,
    title: 'Choose Your Package',
    description: 'Compare Good, Better, and Best options with transparent pricing',
  },
  {
    icon: Clock,
    title: 'Schedule Installation',
    description: 'Pick a date that works for you - most installs complete in 1-2 days',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'GAF-certified installation backed by manufacturer warranties',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-4">
              Roof Replacement <span className="text-blue-600">Services</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Quality materials, expert installation, and transparent pricing.
              Choose the package that fits your needs and budget.
            </p>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center">
              Roofing Packages
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.tier}
                  className={`relative rounded-xl border-2 ${
                    pkg.popular
                      ? 'border-blue-500 shadow-lg shadow-blue-100'
                      : 'border-slate-200'
                  } p-6`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <span
                      className={`text-sm font-medium ${
                        pkg.tier === 'Good'
                          ? 'text-slate-600'
                          : pkg.tier === 'Better'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {pkg.tier}
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900 mt-1">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm text-slate-600">{pkg.warranty}</span>
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {processSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Financing */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center">
              <DollarSign className="w-12 h-12 text-blue-200 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-4">
                Flexible Financing Available
              </h2>
              <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                Don&apos;t let budget hold you back. We offer financing options
                with competitive rates and flexible terms. Check your rate with no
                impact to your credit score.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Get Pre-Qualified
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ready for Your New Roof?
            </h2>
            <p className="text-slate-400 mb-6">
              Get your instant quote and see package pricing for your home.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get My Quote
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-200">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Results Roofing. All rights reserved.
            </span>
            <nav className="flex gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-700">Terms</Link>
              <Link href="/contact" className="hover:text-slate-700">Contact</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
