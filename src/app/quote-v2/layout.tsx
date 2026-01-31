import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Your Free Quote | Results Roofing',
  description: 'Get an instant estimate for your roof replacement. Licensed, insured, and backed by our 5-year workmanship warranty.',
};

export default function QuoteV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      {children}
    </div>
  );
}
