import { Header, Footer } from '@/components/layout';
import { HeroAddressForm, HowItWorksStepper, ReviewsTicker, ScrollToTopCTA } from '@/components/features/landing';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col bg-white">
        {/* Hero Section */}
        <section
          id="quote-form"
          className="flex flex-col items-center justify-center text-center px-6 py-8 md:py-14 relative bg-white"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="w-full flex flex-col items-center">
            <h1 className="font-[family-name:var(--font-sora)] text-[30px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-semibold leading-[1.1] tracking-tight text-slate-900 mb-6 whitespace-nowrap">
              Your Roof Quote{' '}
              <span className="bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                In Minutes
              </span>
            </h1>
            <HeroAddressForm />
          </div>
        </section>

        {/* Reviews Ticker */}
        <ReviewsTicker />

        {/* How It Works */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-[720px] mx-auto px-6 md:px-8 w-full">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-[30px] font-semibold text-slate-900 text-center tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-base text-slate-500 text-center mb-6 max-w-[400px] mx-auto leading-relaxed">
              From quote to installation in four simple steps
            </p>
            <HowItWorksStepper />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 bg-gradient-to-b from-slate-800 to-slate-900 text-center">
          <div className="max-w-[720px] mx-auto px-6 md:px-8 w-full">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-[30px] font-semibold text-white tracking-tight mb-2">
              Know Your Price in 5 Minutes
            </h2>
            <p className="text-base text-slate-400 mb-6 leading-relaxed">
              No sales calls. No home visits. Just an honest quote you can trust.
            </p>
            <ScrollToTopCTA />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
