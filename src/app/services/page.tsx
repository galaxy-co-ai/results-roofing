import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { ScrollReveal } from '@/components/features/services';
import {
  ArrowRight,
  Layers,
  Droplets,
  Shield,
  Wind,
  Hammer,
  Timer,
  Palette,
  DollarSign,
  Ruler,
  Mountain,
  MapPin,
  AlertTriangle,
  X,
  Home,
  CheckCircle2,
  ClipboardCheck,
  CalendarCheck,
  Wrench,
  HardHat,
  Eye,
  BadgeCheck,
  CreditCard,
  Landmark,
  FileText,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services — What Goes Into Your Roof',
  description:
    'Understand every layer of your roof replacement. Transparent pricing, GAF certified installation, and flexible payment options from Results Roofing.',
};

/* ================================================================
   DATA
   ================================================================ */

const roofLayers = [
  {
    number: 1,
    icon: Layers,
    name: 'Shingles',
    description: 'Your first line of weather defense. Available in 3-tab, architectural, or premium designer options.',
  },
  {
    number: 2,
    icon: Shield,
    name: 'Underlayment',
    description: 'Synthetic moisture barrier covering the entire deck. If a shingle fails, this catches it.',
  },
  {
    number: 3,
    icon: Droplets,
    name: 'Ice & Water Shield',
    description: 'Self-adhering membrane at eaves, valleys, and penetrations. Stops ice dam leaks cold.',
  },
  {
    number: 4,
    icon: Hammer,
    name: 'Roof Decking',
    description: 'Plywood or OSB sheathing nailed to rafters. The structural base everything else sits on.',
  },
  {
    number: 5,
    icon: Wind,
    name: 'Ventilation',
    description: 'Ridge and soffit vents balance attic airflow. Prevents moisture buildup and reduces energy bills.',
  },
  {
    number: 6,
    icon: Droplets,
    name: 'Flashing & Drip Edge',
    description: 'Metal channels at edges and penetrations. Directs water away from vulnerable joints.',
    accent: true,
  },
];

const tiers = [
  {
    badge: 'GOOD',
    badgeColor: 'bg-slate-100 text-slate-600',
    name: '3-Tab Shingles',
    lifespan: '15–20 years',
    description: 'Reliable, budget-friendly protection. A solid choice for straightforward replacement.',
    tradeoff: 'Thinner profile, less wind resistance than architectural.',
  },
  {
    badge: 'MOST POPULAR',
    badgeColor: 'bg-blue-50 text-blue-600',
    name: 'Architectural Shingles',
    lifespan: '25–30 years',
    description: 'Dimensional depth, stronger wind rating, and enhanced curb appeal. The industry standard.',
    tradeoff: 'Best balance of durability, appearance, and value.',
    popular: true,
  },
  {
    badge: 'BEST',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    name: 'Premium System',
    lifespan: '40–50 years',
    description: 'Designer or impact-resistant shingles with a complete GAF system. Maximum protection.',
    tradeoff: 'Highest upfront cost, but lowest lifetime cost per year.',
  },
];

const costFactors = [
  { icon: Ruler, label: 'Roof Size', detail: 'Measured in squares (100 sq ft). Larger roof = more material.' },
  { icon: Layers, label: 'Material Grade', detail: '3-tab vs. architectural vs. premium designer shingles.' },
  { icon: Mountain, label: 'Roof Pitch', detail: 'Steeper roofs require more safety equipment and labor.' },
  { icon: MapPin, label: 'Location', detail: 'Permit costs and code requirements vary by state and county.' },
  { icon: AlertTriangle, label: 'Deck Condition', detail: 'Rotted decking needs replacement before new layers go on.' },
];

const cheapQuoteSkips = [
  'Ice & water shield at valleys',
  'Proper starter strip at edges',
  'Ridge vent system',
  'Drip edge replacement',
  'Full deck inspection',
];

const timelineSteps = [
  { step: 1, icon: Home, title: 'Instant Quote', who: 'you', detail: 'Enter your address. Satellite measures your roof.' },
  { step: 2, icon: Palette, title: 'Choose Your Package', who: 'you', detail: 'Compare Good, Better, Best with transparent pricing.' },
  { step: 3, icon: ClipboardCheck, title: 'Sign Your Contract', who: 'you', detail: 'E-sign from your phone. No in-home visit required.' },
  { step: 4, icon: CalendarCheck, title: 'Schedule Install', who: 'you', detail: 'Pick a date that works. Most installs in 1–2 days.' },
  { step: 5, icon: Wrench, title: 'Pre-Project Prep', who: 'we', detail: 'Materials delivered. Permits pulled. Site prepped.' },
  { step: 6, icon: HardHat, title: 'Installation Day', who: 'we', detail: 'Full tear-off, inspection, and new system installed.' },
  { step: 7, icon: Eye, title: 'Final Walkthrough', who: 'you', detail: 'We walk the job together. You approve before we leave.' },
  { step: 8, icon: BadgeCheck, title: 'Warranty Registered', who: 'done', detail: 'GAF warranty filed. You\'re protected.' },
];

const projects = [
  {
    tag: 'Storm Damage',
    tagColor: 'bg-blue-50 text-blue-600',
    title: 'Insurance Claim in Fort Worth, TX',
    description: 'Hail-damaged 3-tab replaced with architectural shingles. Insurance covered full replacement.',
    phases: ['Before', 'During', 'After'],
  },
  {
    tag: 'Full Replacement',
    tagColor: 'bg-emerald-50 text-emerald-600',
    title: 'Aging Roof in Dallas, TX',
    description: '22-year-old roof with multiple leak points. Complete tear-off and GAF system install.',
    phases: ['Before', 'During', 'After'],
  },
  {
    tag: 'Premium Upgrade',
    tagColor: 'bg-amber-50 text-amber-600',
    title: 'Designer Shingles in Plano, TX',
    description: 'Homeowner upgraded from basic 3-tab to premium designer system for resale value.',
    phases: ['Before', 'During', 'After'],
  },
];

const paymentOptions = [
  {
    icon: CreditCard,
    iconColor: 'text-blue-600 bg-blue-50',
    title: 'Pay in Full',
    description: 'Simple checkout via credit card or ACH. No financing fees or interest.',
    bestFor: 'Homeowners who want the lowest total cost.',
  },
  {
    icon: Landmark,
    iconColor: 'text-emerald-600 bg-emerald-50',
    title: 'Finance',
    description: 'Low monthly payments through our lending partners. Check your rate with no credit impact.',
    bestFor: 'Homeowners who prefer to spread the cost.',
  },
  {
    icon: FileText,
    iconColor: 'text-amber-600 bg-amber-50',
    title: 'Insurance Claim',
    description: 'We work directly with your adjuster. You pay your deductible, insurance covers the rest.',
    bestFor: 'Homeowners with storm or hail damage.',
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

        {/* ─── 1. HERO (Dark) ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#1E2329] py-28 px-6 md:py-36">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <p className="text-sm font-semibold tracking-[0.15em] uppercase text-blue-400 mb-5">
                Services
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-[1.1] mb-6">
                Know exactly what
                <br />
                you&apos;re paying for.
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={160}>
              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
                We don&apos;t hide behind jargon or vague line items.
                Every layer, every cost, every step — laid out so you
                can make a confident decision.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={240}>
              <Link
                href="/quote/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25 text-base"
              >
                Get Your Price
                <ArrowRight size={16} />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 2. ANATOMY EXPLAINER (White) ─────────────────────── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 text-center mb-3">
                What you&apos;re actually paying for
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E2329] text-center tracking-tight mb-14">
                What&apos;s Inside Your Roof
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roofLayers.map((layer, i) => {
                const Icon = layer.icon;
                return (
                  <ScrollReveal key={layer.name} animation="fadeUp" delay={i * 80}>
                    <div className={`bg-[#F7F9FC] rounded-md p-6 h-full border border-[#E8EDF5] ${layer.accent ? 'border-emerald-200' : ''}`}>
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${layer.accent ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                          {layer.number}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#1E2329] mb-1">
                            {layer.name}
                          </h3>
                        </div>
                        <Icon size={20} className="text-[#6B7280] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-[#6B7280] leading-relaxed pl-[52px]">
                        {layer.description}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 3. FIND YOUR FIT (Light Gray) ───────────────────── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 text-center mb-3">
                Choose what matters most
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E2329] text-center tracking-tight mb-4">
                Find Your Fit
              </h2>
              <p className="text-[#6B7280] text-center max-w-lg mx-auto mb-12">
                Every homeowner has different priorities. Here&apos;s how each tier stacks up.
              </p>
            </ScrollReveal>

            {/* Priority selector (visual only — no JS interactivity) */}
            <ScrollReveal animation="fadeUp" delay={80}>
              <div className="flex justify-center gap-3 mb-10">
                {['Longest Life', 'Best Value', 'Best Look'].map((label, i) => (
                  <span
                    key={label}
                    className={`px-5 py-2.5 rounded-md text-sm font-medium border transition-colors ${
                      i === 0
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-[#E8EDF5] bg-white text-[#6B7280]'
                    }`}
                  >
                    {label === 'Longest Life' && <Timer size={14} className="inline mr-1.5 -mt-0.5" />}
                    {label}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            {/* Tier cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier, i) => (
                <ScrollReveal key={tier.name} animation="fadeUp" delay={i * 100}>
                  <div
                    className={`bg-white rounded-md p-6 h-full border ${
                      tier.popular ? 'border-blue-600 ring-1 ring-blue-600/10' : 'border-[#E8EDF5]'
                    }`}
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                    <h3 className="text-xl font-bold text-[#1E2329] mb-1">{tier.name}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-3">{tier.lifespan}</p>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{tier.description}</p>
                    <div className="border-t border-[#E8EDF5] pt-4">
                      <p className="text-xs text-[#6B7280] italic">{tier.tradeoff}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 4. COST TRANSPARENCY (White) ────────────────────── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 text-center mb-3">
                Honest pricing
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E2329] text-center tracking-tight mb-14">
                What Does It Actually Cost?
              </h2>
            </ScrollReveal>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Cost factors */}
              <ScrollReveal animation="fadeUp" delay={80}>
                <div className="space-y-1">
                  {costFactors.map((factor) => {
                    const Icon = factor.icon;
                    return (
                      <div key={factor.label} className="flex items-start gap-4 p-4 rounded-md hover:bg-[#F7F9FC] transition-colors">
                        <div className="w-10 h-10 rounded-md bg-[#F7F9FC] flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-[#6B7280]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#1E2329] mb-0.5">{factor.label}</h4>
                          <p className="text-sm text-[#6B7280]">{factor.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>

              {/* "What cheap quotes skip" callout */}
              <ScrollReveal animation="fadeUp" delay={160}>
                <div className="bg-red-50 border border-red-200 rounded-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-red-500" />
                    <h4 className="text-base font-bold text-red-700">What cheap quotes skip</h4>
                  </div>
                  <ul className="space-y-3">
                    {cheapQuoteSkips.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-red-600">
                        <X size={14} className="flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-400 mt-5">
                    A lower quote isn&apos;t always a better deal. Missing components
                    void warranties and cause premature failure.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ─── 5. TIMELINE (Dark) ──────────────────────────────── */}
        <section className="bg-[#1E2329] py-20 px-6 md:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-400 text-center mb-3">
                Your project, start to finish
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center tracking-tight mb-14">
                Every Step, No Surprises
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-5">
              {timelineSteps.map((step, i) => {
                const Icon = step.icon;
                const isDone = step.who === 'done';
                const isYou = step.who === 'you';

                return (
                  <ScrollReveal key={step.title} animation="fadeUp" delay={i * 60}>
                    <div
                      className={`rounded-md p-5 border ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-500/30'
                          : 'bg-white/[0.04] border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isDone
                              ? 'bg-emerald-500/20'
                              : isYou
                                ? 'bg-blue-500/20'
                                : 'bg-emerald-500/20'
                          }`}
                        >
                          <Icon
                            size={18}
                            className={
                              isDone
                                ? 'text-emerald-400'
                                : isYou
                                  ? 'text-blue-400'
                                  : 'text-emerald-400'
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500">
                              Step {step.step}
                            </span>
                            {!isDone && (
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  isYou
                                    ? 'text-blue-400 bg-blue-400/10'
                                    : 'text-emerald-400 bg-emerald-400/10'
                                }`}
                              >
                                {isYou ? 'You do:' : 'We handle:'}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-base font-semibold mb-1 ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                            {step.title}
                          </h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {step.detail}
                          </p>
                          {isDone && (
                            <p className="text-xs text-emerald-400 font-medium mt-2">
                              Done. You&apos;re protected.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 6. REAL PROJECTS (Light Gray) ───────────────────── */}
        <section className="bg-[#F7F9FC] py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 text-center mb-3">
                See the work
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E2329] text-center tracking-tight mb-14">
                Real Projects, Real Results
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <ScrollReveal key={project.title} animation="fadeUp" delay={i * 100}>
                  <div className="bg-white rounded-md overflow-hidden border border-[#E8EDF5] h-full">
                    {/* Image placeholder */}
                    <div className="w-full h-[180px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Home size={32} className="text-slate-300" />
                    </div>

                    <div className="p-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${project.tagColor}`}>
                        {project.tag}
                      </span>
                      <h3 className="text-base font-semibold text-[#1E2329] mb-2">{project.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{project.description}</p>
                      <div className="flex gap-2">
                        {project.phases.map((phase) => (
                          <span
                            key={phase}
                            className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F7F9FC] text-[#6B7280] border border-[#E8EDF5]"
                          >
                            {phase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 7. PAYMENT OPTIONS (White) ──────────────────────── */}
        <section className="bg-white py-20 px-6 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fadeUp">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-600 text-center mb-3">
                Flexible payment
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E2329] text-center tracking-tight mb-14">
                Ways to Pay
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {paymentOptions.map((option, i) => {
                const Icon = option.icon;
                return (
                  <ScrollReveal key={option.title} animation="fadeUp" delay={i * 100}>
                    <div className="bg-[#F7F9FC] rounded-md p-6 border border-[#E8EDF5] h-full">
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-4 ${option.iconColor}`}>
                        <Icon size={22} />
                      </div>
                      <h3 className="text-lg font-semibold text-[#1E2329] mb-2">{option.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{option.description}</p>
                      <p className="text-xs text-[#6B7280]">
                        <span className="font-semibold text-[#1E2329]">Best for: </span>
                        {option.bestFor}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 8. FINAL CTA (Brand Blue) ──────────────────────── */}
        <section className="bg-blue-600 py-24 px-6 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal animation="fadeUp">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-5">
                See your price in under 3 minutes.
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={80}>
              <p className="text-blue-100 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                No phone call. No appointment. No salesperson.
                Just your address and an honest number.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={160}>
              <Link
                href="/quote/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-md hover:bg-blue-50 transition-colors shadow-lg text-base"
              >
                Get My Free Quote
                <ArrowRight size={16} />
              </Link>
            </ScrollReveal>

            <ScrollReveal animation="fadeUp" delay={240}>
              <p className="text-blue-200 text-sm mt-8">
                Satellite-measured &bull; GAF Certified &bull; Transparent pricing
              </p>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
