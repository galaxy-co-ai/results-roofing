export function BlogHero() {
  return (
    <section
      className="pt-10 pb-8 md:pt-12 md:pb-10 text-center rounded-2xl border border-[#E8EDF5] shadow-[inset_0_1px_4px_rgba(0,0,0,0.06)]"
      style={{
        backgroundColor: '#F7F9FC',
        backgroundImage:
          'radial-gradient(circle, #2563EB 0.75px, transparent 0.75px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0',
      }}
    >
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-3">
        Resources
      </h1>
      <p className="text-[#6B7A94] text-lg max-w-md mx-auto leading-relaxed text-balance">
        Honest roofing advice for homeowners who want straight answers — not sales pitches.
      </p>
    </section>
  );
}
