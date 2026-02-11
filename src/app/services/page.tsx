import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { Home, Shield, Clock, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';

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
  },
  {
    tier: 'Better',
    name: 'Architectural Shingles',
    description: 'Enhanced durability and curb appeal',
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
  },
];

const processSteps = [
  { icon: Home, title: 'Instant Quote', description: 'Enter your address and get satellite-measured pricing in minutes' },
  { icon: CheckCircle2, title: 'Choose Your Package', description: 'Compare Good, Better, and Best options with transparent pricing' },
  { icon: Clock, title: 'Schedule Installation', description: 'Pick a date that works for you — most installs complete in 1-2 days' },
  { icon: Shield, title: 'Quality Guaranteed', description: 'GAF-certified installation backed by manufacturer warranties' },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white" id="main-content">
        {/* Hero */}
        <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-5">
              Roof Replacement <span className="text-blue-600">Services</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Quality materials, expert installation, and transparent pricing.
              Choose the package that fits your needs and budget.
            </p>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900 tracking-tight mb-10 text-center">
              Roofing Packages
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.tier}
                  className={`relative rounded-xl border-2 p-7 transition-shadow hover:shadow-lg ${
                    pkg.popular
                      ? 'border-blue-500 shadow-md shadow-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <span className={`text-sm font-semibold ${
                      pkg.tier === 'Good' ? 'text-slate-500' : pkg.tier === 'Better' ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {pkg.tier}
                    </span>
                    <h3 className="font-[family-name:var(--font-sora)] text-xl font-bold text-slate-900 mt-1">{pkg.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                  </div>
                  <div className="text-center mb-6 py-2 rounded-lg bg-slate-50">
                    <span className="text-sm font-medium text-slate-600">{pkg.warranty}</span>
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
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900 tracking-tight mb-10 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {processSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-sora)] font-semibold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Financing */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 md:p-14 text-center">
              <DollarSign className="w-12 h-12 text-blue-200 mx-auto mb-5" />
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white tracking-tight mb-4">
                Flexible Financing Available
              </h2>
              <p className="text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
                Don&apos;t let budget hold you back. We offer financing options
                with competitive rates and flexible terms. Check your rate with no
                impact to your credit score.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                Get Pre-Qualified
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white tracking-tight mb-4">
              Ready for Your New Roof?
            </h2>
            <p className="text-slate-400 mb-8">
              Get your instant quote and see package pricing for your home.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
